const express = require('express');
const { z } = require('zod');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const Notification = require('../models/Notification');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const { generateQueueNumber, recomputeQueue, queuePosition } = require('../services/queue.service');
const { sendTelegramMessage } = require('../services/telegram.service');

const router = express.Router();

const populateAppointment = (query) =>
  query
    .populate('doctor', 'firstName lastName specialty avatar rating')
    .populate('clinic', 'name address logo')
    .populate('department', 'name');

// ---- Create (book) an appointment -----------------------------------------
const createSchema = z.object({
  scheduleId: z.string().min(1),
});

router.post(
  '/',
  protect,
  requireRole('patient'),
  asyncHandler(async (req, res) => {
    const { scheduleId } = createSchema.parse(req.body);

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) throw new ApiError(404, 'Tanlangan vaqt topilmadi.');
    if (schedule.isBooked) throw new ApiError(409, 'Bu vaqt allaqachon band qilingan. Boshqa vaqtni tanlang.');

    const doctor = await Doctor.findById(schedule.doctor);
    if (!doctor) throw new ApiError(404, 'Shifokor topilmadi.');

    // Queue number prefix is derived from the department name (e.g. "K-3" for Kardiologiya)
    const department = await Department.findById(doctor.department);
    const properQueueNumber = await generateQueueNumber(department?.name, schedule.date);

    schedule.isBooked = true;
    await schedule.save();

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctor._id,
      clinic: doctor.clinic,
      department: doctor.department,
      schedule: schedule._id,
      date: schedule.date,
      time: schedule.startTime,
      queueNumber: properQueueNumber,
      status: 'CONFIRMED',
      source: 'web',
    });

    await Notification.create({
      user: req.user._id,
      type: 'APPOINTMENT_CONFIRMED',
      title: 'Navbat tasdiqlandi',
      message: `${schedule.date} ${schedule.startTime} - navbat raqamingiz ${properQueueNumber}.`,
      appointment: appointment._id,
    });

    await sendTelegramMessage(
      req.user.telegramChatId,
      `✅ <b>Navbatingiz tasdiqlandi</b>\n\nBo'lim: ${department?.name}\nShifokor: Dr. ${doctor.firstName} ${doctor.lastName}\nVaqt: ${schedule.date} ${schedule.startTime}\nNavbat: <b>${properQueueNumber}</b>`
    );

    await recomputeQueue(doctor._id, schedule.date);

    const full = await populateAppointment(Appointment.findById(appointment._id));
    res.status(201).json({ appointment: full });
  })
);

// ---- Patient: my appointments ---------------------------------------------
router.get(
  '/me',
  protect,
  requireRole('patient'),
  asyncHandler(async (req, res) => {
    const appointments = await populateAppointment(Appointment.find({ patient: req.user._id }).sort({ createdAt: -1 }));
    const withPosition = await Promise.all(
      appointments.map(async (a) => ({ ...a.toObject(), queuePosition: await queuePosition(a) }))
    );
    res.json({ appointments: withPosition });
  })
);

router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const appointment = await populateAppointment(Appointment.findById(req.params.id));
    if (!appointment) throw new ApiError(404, 'Navbat topilmadi.');
    const isOwner = appointment.patient.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'doctor') throw new ApiError(403, "Bu navbatni ko'rishga huquqingiz yo'q.");
    const position = await queuePosition(appointment);
    res.json({ appointment: { ...appointment.toObject(), queuePosition: position } });
  })
);

router.patch(
  '/:id/cancel',
  protect,
  requireRole('patient'),
  asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) throw new ApiError(404, 'Navbat topilmadi.');
    if (appointment.patient.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Bu navbatni bekor qilishga huquqingiz yo'q.");
    }
    if (['COMPLETED', 'CANCELLED', 'CALLED'].includes(appointment.status)) {
      throw new ApiError(400, "Bu navbatni endi bekor qilib bo'lmaydi.");
    }

    appointment.status = 'CANCELLED';
    appointment.cancelReason = req.body?.reason || null;
    await appointment.save();
    await Schedule.findByIdAndUpdate(appointment.schedule, { isBooked: false });

    await recomputeQueue(appointment.doctor, appointment.date);
    res.json({ appointment });
  })
);

// ---- Doctor: manage the live queue -----------------------------------------
router.get(
  '/doctor/queue',
  protect,
  requireRole('doctor'),
  asyncHandler(async (req, res) => {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) throw new ApiError(403, "Sizga bog'langan shifokor profili topilmadi.");
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const appointments = await Appointment.find({ doctor: doctor._id, date })
      .sort({ time: 1, createdAt: 1 })
      .populate('patient', 'fullName phone')
      .lean();
    res.json({ appointments, date });
  })
);

const statusSchema = z.object({
  status: z.enum(['CALLED', 'COMPLETED', 'CANCELLED']),
});

router.patch(
  '/:id/status',
  protect,
  requireRole('doctor'),
  asyncHandler(async (req, res) => {
    const { status } = statusSchema.parse(req.body);
    const appointment = await Appointment.findById(req.params.id).populate('patient', 'telegramChatId');
    if (!appointment) throw new ApiError(404, 'Navbat topilmadi.');

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
      throw new ApiError(403, "Bu navbatni boshqarishga huquqingiz yo'q.");
    }

    appointment.status = status;
    await appointment.save();

    if (status === 'CALLED') {
      await Notification.create({
        user: appointment.patient._id,
        type: 'QUEUE_CALLED',
        title: 'Sizning navbatingiz keldi',
        message: `${appointment.queueNumber}. Iltimos, shifokor xonasiga boring.`,
        appointment: appointment._id,
      });
      await sendTelegramMessage(
        appointment.patient.telegramChatId,
        `🔔 <b>Sizning navbatingiz keldi</b>\n\n${appointment.queueNumber}\n\nIltimos, shifokor xonasiga boring.`
      );
    }

    if (status === 'CANCELLED') {
      await Schedule.findByIdAndUpdate(appointment.schedule, { isBooked: false });
    }

    await recomputeQueue(appointment.doctor, appointment.date);
    res.json({ appointment });
  })
);

module.exports = router;
