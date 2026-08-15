const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // set once the doctor can log in
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    avatar: { type: String, default: null },
    specialty: { type: String, required: true },
    experienceYears: { type: Number, default: 1 },
    bio: { type: String, default: '' },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true, index: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    rating: { type: Number, default: 4.6, min: 0, max: 5 },
    workingDays: { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    workingHours: { type: String, default: '09:00 - 17:00' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
