const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, default: null },
    address: { type: String, required: true },
    district: { type: String, default: null },
    phone: { type: String, required: true },
    workingHours: { type: String, default: '08:00 - 20:00' },
    description: { type: String, default: '' },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Clinic', clinicSchema);
