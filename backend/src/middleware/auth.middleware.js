const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

// Verifies the JWT and attaches the authenticated user to req.user.
// Used by both the web app and the Telegram bot (the bot gets its own JWT
// from POST /api/auth/telegram-link and then calls the same protected
// endpoints as the web app - single data-access layer for both clients).
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, 'Avtorizatsiya talab qilinadi. Iltimos, tizimga kiring.');
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Sessiya muddati tugagan yoki token yaroqsiz. Qayta kiring.');
  }

  const user = await User.findById(payload.sub).select('-passwordHash');
  if (!user) {
    throw new ApiError(401, 'Foydalanuvchi topilmadi.');
  }

  req.user = user;
  next();
});

// Restricts a route to one or more roles, e.g. requireRole('doctor')
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new ApiError(403, "Bu amal uchun sizda yetarli huquq yo'q.");
  }
  next();
};

module.exports = { protect, requireRole };
