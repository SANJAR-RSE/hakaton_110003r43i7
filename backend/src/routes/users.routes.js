const express = require('express');
const { z } = require('zod');
const { protect } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

const updateSchema = z.object({
  fullName: z.string().min(2).optional(),
  avatar: z.string().url().optional().nullable(),
});

router.patch(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const body = updateSchema.parse(req.body);
    Object.assign(req.user, body);
    await req.user.save();
    res.json({ user: req.user.toSafeJSON() });
  })
);

module.exports = router;
