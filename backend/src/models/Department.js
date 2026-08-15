const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: 'Stethoscope' }, // lucide-react icon name
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true, index: true },
  },
  { timestamps: true }
);

departmentSchema.index({ clinic: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Department', departmentSchema);
