const express = require('express');
const Clinic = require('../models/Clinic');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const clinics = await Clinic.find().sort({ rating: -1 }).lean();
    const [deptCounts, doctorCounts] = await Promise.all([
      Department.aggregate([{ $group: { _id: '$clinic', count: { $sum: 1 } } }]),
      Doctor.aggregate([{ $group: { _id: '$clinic', count: { $sum: 1 } } }]),
    ]);
    const deptMap = Object.fromEntries(deptCounts.map((d) => [d._id.toString(), d.count]));
    const docMap = Object.fromEntries(doctorCounts.map((d) => [d._id.toString(), d.count]));

    res.json({
      clinics: clinics.map((c) => ({
        ...c,
        departmentsCount: deptMap[c._id.toString()] || 0,
        doctorsCount: docMap[c._id.toString()] || 0,
      })),
    });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const clinic = await Clinic.findById(req.params.id).lean();
    if (!clinic) throw new ApiError(404, 'Klinika topilmadi.');
    const departments = await Department.find({ clinic: clinic._id }).lean();
    res.json({ clinic, departments });
  })
);

module.exports = router;
