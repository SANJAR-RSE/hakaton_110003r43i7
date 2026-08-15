const express = require('express');
const Doctor = require('../models/Doctor');
const Schedule = require('../models/Schedule');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.clinicId) filter.clinic = req.query.clinicId;
    if (req.query.departmentId) filter.department = req.query.departmentId;
    const doctors = await Doctor.find(filter)
      .populate('clinic', 'name address')
      .populate('department', 'name')
      .sort({ rating: -1 })
      .lean();
    res.json({ doctors });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id)
      .populate('clinic', 'name address logo')
      .populate('department', 'name')
      .lean();
    if (!doctor) throw new ApiError(404, 'Shifokor topilmadi.');
    res.json({ doctor });
  })
);

// Available (not booked) slots for a doctor on a given date, e.g.
// GET /api/doctors/:id/schedules?date=2026-08-16
router.get(
  '/:id/schedules',
  asyncHandler(async (req, res) => {
    const filter = { doctor: req.params.id };
    if (req.query.date) filter.date = req.query.date;
    const schedules = await Schedule.find(filter).sort({ date: 1, startTime: 1 }).lean();
    res.json({ schedules });
  })
);

module.exports = router;
