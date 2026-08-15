const mongoose = require('mongoose');

const STATUSES = ['PENDING', 'CONFIRMED', 'WAITING', 'NEAR', 'CALLED', 'COMPLETED', 'CANCELLED'];
// Statuses that still occupy a place in the live queue for a doctor/date
const ACTIVE_QUEUE_STATUSES = ['CONFIRMED', 'WAITING', 'NEAR'];

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
    date: { type: String, required: true }, // denormalized from schedule for fast queue queries
    time: { type: String, required: true },
    queueNumber: { type: String, required: true }, // e.g. "A-24"
    status: { type: String, enum: STATUSES, default: 'CONFIRMED', index: true },
    source: { type: String, enum: ['web', 'bot'], default: 'web' },
    cancelReason: { type: String, default: null },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctor: 1, date: 1, status: 1 });

appointmentSchema.statics.STATUSES = STATUSES;
appointmentSchema.statics.ACTIVE_QUEUE_STATUSES = ACTIVE_QUEUE_STATUSES;

module.exports = mongoose.model('Appointment', appointmentSchema);
