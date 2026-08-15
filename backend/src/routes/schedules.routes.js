const express = require('express');
const { z } = require('zod');
const Schedule = require('../models/Schedule');
const Doctor = require('../models/Doctor');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');

const router = express.Router();

async function getOwnDoctorProfile(userId) {
  const doctor = await Doctor.findOne({ user: userId });
  if (!doctor) throw new ApiError(403, "Sizga bog'langan shifokor profili topilmadi.");
  return doctor;
}

const createSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

// Doctor creates a bookable slot on their own schedule.
router.post(
  '/',
  protect,
  requireRole('doctor'),
  asyncHandler(async (req, res) => {
    const body = createSchema.parse(req.body);
    const doctor = await getOwnDoctorProfile(req.user._id);
    const schedule = await Schedule.create({ ...body, doctor: doctor._id });
    res.status(201).json({ schedule });
  })
);

// Doctor's own full schedule (booked + free), for their dashboard.
router.get(
  '/me',
  protect,
  requireRole('doctor'),
  asyncHandler(async (req, res) => {
    const doctor = await getOwnDoctorProfile(req.user._id);
    const filter = { doctor: doctor._id };
    if (req.query.date) filter.date = req.query.date;
    const schedules = await Schedule.find(filter).sort({ date: 1, startTime: 1 }).lean();
    res.json({ schedules });
  })
);

router.delete(
  '/:id',
  protect,
  requireRole('doctor'),
  asyncHandler(async (req, res) => {
    const doctor = await getOwnDoctorProfile(req.user._id);
    const schedule = await Schedule.findOne({ _id: req.params.id, doctor: doctor._id });
    if (!schedule) throw new ApiError(404, 'Vaqt topilmadi.');
    if (schedule.isBooked) throw new ApiError(400, "Band qilingan vaqtni o'chirib bo'lmaydi.");
    await schedule.deleteOne();
    res.json({ success: true });
  })
);

module.exports = router;
