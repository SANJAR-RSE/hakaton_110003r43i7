const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');
const { normalizePhone } = require('../utils/normalizePhone');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

const registerSchema = z.object({
  phone: z.string().min(7, "Telefon raqam noto'g'ri"),
  password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak"),
  fullName: z.string().min(2, "Ism familiyani kiriting"),
});

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);
    const phone = normalizePhone(body.phone);
    if (!phone) throw new ApiError(400, "Telefon raqam noto'g'ri formatda.");

    let user = await User.findOne({ phone });
    if (user && user.passwordHash) {
      throw new ApiError(409, "Bu telefon raqam bilan foydalanuvchi allaqachon ro'yxatdan o'tgan.");
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    if (user) {
      // User already exists from a Telegram-only link -> attach web credentials
      user.passwordHash = passwordHash;
      user.fullName = body.fullName;
      await user.save();
    } else {
      user = await User.create({ phone, passwordHash, fullName: body.fullName, role: 'patient' });
    }

    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  })
);

const loginSchema = z.object({
  phone: z.string().min(7),
  password: z.string().min(1),
});

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const phone = normalizePhone(body.phone);
    const user = await User.findOne({ phone }).select('+passwordHash');
    if (!user || !user.passwordHash) {
      throw new ApiError(401, "Telefon raqam yoki parol noto'g'ri.");
    }
    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, "Telefon raqam yoki parol noto'g'ri.");
    }
    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  })
);

router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user.toSafeJSON() });
  })
);

// Used exclusively by the Telegram bot service to link (or create) the User
// behind a given phone number, and hand back a normal JWT so the bot can
// call the *same* protected endpoints the web app uses. Guarded by a shared
// secret (the bot token itself) so only our bot can call it.
const telegramLinkSchema = z.object({
  phone: z.string().min(7),
  telegramChatId: z.number(),
  telegramUsername: z.string().optional(),
  fullName: z.string().optional(),
});

router.post(
  '/telegram-link',
  asyncHandler(async (req, res) => {
    const botSecret = req.headers['x-bot-secret'];
    if (!botSecret || botSecret !== process.env.BOT_TOKEN) {
      throw new ApiError(401, 'Ruxsat etilmagan.');
    }

    const body = telegramLinkSchema.parse(req.body);
    const phone = normalizePhone(body.phone);
    if (!phone) throw new ApiError(400, "Telefon raqam noto'g'ri formatda.");

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        phone,
        fullName: body.fullName || 'Telegram foydalanuvchisi',
        role: 'patient',
        telegramChatId: body.telegramChatId,
        telegramUsername: body.telegramUsername,
      });
    } else if (user.telegramChatId !== body.telegramChatId) {
      // Free up the chat id from any previous owner (e.g. re-linked account)
      await User.updateOne({ telegramChatId: body.telegramChatId }, { $unset: { telegramChatId: 1 } });
      user.telegramChatId = body.telegramChatId;
      user.telegramUsername = body.telegramUsername;
      await user.save();
    }

    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  })
);

module.exports = router;
