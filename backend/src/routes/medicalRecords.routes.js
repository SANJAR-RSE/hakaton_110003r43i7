const express = require('express');
const { z } = require('zod');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const { recomputeQueue } = require('../services/queue.service');
const { sendTelegramMessage } = require('../services/telegram.service');

const router = express.Router();

const labResultSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
  normalRange: z.string().optional(),
  notes: z.string().optional(),
});

const createSchema = z.object({
  appointmentId: z.string().min(1),
  examination: z.string().min(3, "Ko'rik xulosasini kiriting"),
  recommendation: z.string().optional(),
  labResults: z.array(labResultSchema).optional(),
});

// Doctor finishes an appointment: writes the medical record AND marks the
// appointment COMPLETED in the same call, so the queue moves on immediately.
router.post(
  '/',
  protect,
  requireRole('doctor'),
  asyncHandler(async (req, res) => {
    const body = createSchema.parse(req.body);

    const appointment = await Appointment.findById(body.appointmentId).populate('patient', 'telegramChatId');
    if (!appointment) throw new ApiError(404, 'Navbat topilmadi.');

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
      throw new ApiError(403, "Bu navbat uchun yozuv qo'shishga huquqingiz yo'q.");
    }

    const existing = await MedicalRecord.findOne({ appointment: appointment._id });
    if (existing) throw new ApiError(409, "Bu navbat uchun tibbiy yozuv allaqachon mavjud.");

    const record = await MedicalRecord.create({
      patient: appointment.patient._id,
      doctor: doctor._id,
      appointment: appointment._id,
      clinic: appointment.clinic,
      department: appointment.department,
      date: appointment.date,
      examination: body.examination,
      recommendation: body.recommendation || '',
      labResults: body.labResults || [],
    });

    appointment.status = 'COMPLETED';
    await appointment.save();

    await Notification.create({
      user: appointment.patient._id,
      type: 'APPOINTMENT_COMPLETED',
      title: "Ko'rik yakunlandi",
      message: 'Tibbiy tarixingizda yangi yozuv paydo bo\'ldi.',
      appointment: appointment._id,
    });
    await sendTelegramMessage(
      appointment.patient.telegramChatId,
      `📋 <b>Ko'rik yakunlandi</b>\n\nTibbiy tarixingizga yangi yozuv qo'shildi. Uni Web ilovada "Tibbiy tarix" bo'limidan ko'rishingiz mumkin.`
    );

    await recomputeQueue(appointment.doctor, appointment.date);
    res.status(201).json({ record });
  })
);

router.get(
  '/me',
  protect,
  requireRole('patient'),
  asyncHandler(async (req, res) => {
    const records = await MedicalRecord.find({ patient: req.user._id })
      .sort({ createdAt: -1 })
      .populate('doctor', 'firstName lastName specialty')
      .populate('clinic', 'name')
      .populate('department', 'name')
      .lean();
    res.json({ records });
  })
);

// Doctor viewing a specific patient's history - only for a patient they have
// actually treated (has at least one appointment with this doctor).
router.get(
  '/patient/:patientId',
  protect,
  requireRole('doctor'),
  asyncHandler(async (req, res) => {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) throw new ApiError(403, "Sizga bog'langan shifokor profili topilmadi.");

    const treated = await Appointment.exists({ doctor: doctor._id, patient: req.params.patientId });
    if (!treated) throw new ApiError(403, "Bu bemorning tibbiy tarixini ko'rishga huquqingiz yo'q.");

    const records = await MedicalRecord.find({ patient: req.params.patientId })
      .sort({ createdAt: -1 })
      .populate('doctor', 'firstName lastName specialty')
      .populate('clinic', 'name')
      .populate('department', 'name')
      .lean();
    res.json({ records });
  })
);

module.exports = router;
