const mongoose = require('mongoose');

// A single bookable time slot for a doctor. Booking an appointment marks the
// matching slot isBooked=true; cancelling frees it up again.
const scheduleSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    date: { type: String, required: true }, // 'YYYY-MM-DD' (kept as string: simplest for slot generation/lookup)
    startTime: { type: String, required: true }, // 'HH:mm'
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

scheduleSchema.index({ doctor: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
