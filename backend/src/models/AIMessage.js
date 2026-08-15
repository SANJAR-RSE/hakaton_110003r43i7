const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    route: { type: String, required: true }, // real frontend route, e.g. "/appointments"
  },
  { _id: false }
);

const aiMessageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'AIConversation', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    actions: { type: [actionSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIMessage', aiMessageSchema);
