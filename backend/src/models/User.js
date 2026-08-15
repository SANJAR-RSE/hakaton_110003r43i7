const mongoose = require('mongoose');

// The phone number is the single unique identity key shared by the web app
// and the Telegram bot (see backend/README.md "Web/Bot sync"). It must
// always be stored already normalized via utils/normalizePhone.
const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, select: false }, // absent for bot-only users until they set one on web
    fullName: { type: String, required: true, trim: true },
    role: { type: String, enum: ['patient', 'doctor'], default: 'patient', index: true },
    avatar: { type: String, default: null },
    telegramChatId: { type: Number, unique: true, sparse: true, index: true },
    telegramUsername: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    phone: this.phone,
    fullName: this.fullName,
    role: this.role,
    avatar: this.avatar,
    telegramConnected: Boolean(this.telegramChatId),
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
