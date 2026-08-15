const express = require('express');
const { z } = require('zod');
const AIConversation = require('../models/AIConversation');
const AIMessage = require('../models/AIMessage');
const { protect } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const { generateAssistantReply } = require('../services/ai.service');

const router = express.Router();

const messageSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().optional(),
});

router.post(
  '/message',
  protect,
  asyncHandler(async (req, res) => {
    const body = messageSchema.parse(req.body);

    let conversation;
    if (body.conversationId) {
      conversation = await AIConversation.findOne({ _id: body.conversationId, user: req.user._id });
      if (!conversation) throw new ApiError(404, 'Suhbat topilmadi.');
    } else {
      conversation = await AIConversation.create({ user: req.user._id, title: body.message.slice(0, 40) });
    }

    await AIMessage.create({ conversation: conversation._id, user: req.user._id, role: 'user', content: body.message });

    const { reply, actions } = await generateAssistantReply(req.user, body.message);

    const assistantMessage = await AIMessage.create({
      conversation: conversation._id,
      user: req.user._id,
      role: 'assistant',
      content: reply,
      actions,
    });

    res.json({ conversationId: conversation._id, message: assistantMessage });
  })
);

router.get(
  '/conversations/me',
  protect,
  asyncHandler(async (req, res) => {
    const conversations = await AIConversation.find({ user: req.user._id }).sort({ updatedAt: -1 }).lean();
    res.json({ conversations });
  })
);

router.get(
  '/conversations/:id/messages',
  protect,
  asyncHandler(async (req, res) => {
    const conversation = await AIConversation.findOne({ _id: req.params.id, user: req.user._id });
    if (!conversation) throw new ApiError(404, 'Suhbat topilmadi.');
    const messages = await AIMessage.find({ conversation: conversation._id }).sort({ createdAt: 1 }).lean();
    res.json({ messages });
  })
);

module.exports = router;
