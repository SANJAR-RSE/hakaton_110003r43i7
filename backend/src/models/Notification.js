const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['APPOINTMENT_CONFIRMED', 'QUEUE_NEAR', 'QUEUE_CALLED', 'APPOINTMENT_COMPLETED', 'APPOINTMENT_CANCELLED'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
