const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendTelegramMessage } = require('./telegram.service');

// Queue numbers look like "A-24": one letter derived from the department
// name + a counter that resets daily per department (matches the spec's
// example UI: A-20 A-21 A-22 -> Hozir A-23 -> Siz A-24 ...).
async function generateQueueNumber(departmentName, date) {
  const letter = (departmentName || 'X').trim().charAt(0).toUpperCase() || 'X';
  const count = await Appointment.countDocuments({
    date,
    queueNumber: { $regex: `^${letter}-` },
  });
  return `${letter}-${count + 1}`;
}

// Recomputes queue positions/statuses for every still-active appointment of
// a doctor on a given date, and notifies patients who just entered the
// "almost your turn" window. Called after any appointment leaves the active
// queue (CALLED/COMPLETED/CANCELLED) or a new one joins it.
async function recomputeQueue(doctorId, date) {
  const active = await Appointment.find({
    doctor: doctorId,
    date,
    status: { $in: Appointment.ACTIVE_QUEUE_STATUSES },
  })
    .sort({ time: 1, createdAt: 1 })
    .populate('patient', 'telegramChatId fullName');

  for (let i = 0; i < active.length; i += 1) {
    const appt = active[i];
    const nextStatus = i < 3 ? 'NEAR' : 'WAITING';
    const enteredNear = nextStatus === 'NEAR' && appt.status !== 'NEAR';

    if (appt.status !== nextStatus) {
      appt.status = nextStatus;
      await appt.save();
    }

    if (enteredNear) {
      const aheadCount = i;
      await Notification.create({
        user: appt.patient._id,
        type: 'QUEUE_NEAR',
        title: 'Navbatingiz yaqinlashmoqda',
        message: `Oldingizda ${aheadCount} kishi qoldi. Iltimos, klinikaga yaqin bo'ling.`,
        appointment: appt._id,
      });
      await sendTelegramMessage(
        appt.patient.telegramChatId,
        `⏳ <b>Navbatingiz yaqinlashmoqda</b>\n\nOldingizda ${aheadCount} kishi qoldi.\nIltimos, klinikaga yaqin bo'ling.\n\nNavbat: <b>${appt.queueNumber}</b>`
      );
    }
  }

  return active;
}

async function queuePosition(appointment) {
  if (!Appointment.ACTIVE_QUEUE_STATUSES.includes(appointment.status)) return null;
  const aheadCount = await Appointment.countDocuments({
    doctor: appointment.doctor,
    date: appointment.date,
    status: { $in: Appointment.ACTIVE_QUEUE_STATUSES },
    $or: [{ time: { $lt: appointment.time } }, { time: appointment.time, createdAt: { $lt: appointment.createdAt } }],
  });
  return aheadCount;
}

module.exports = { generateQueueNumber, recomputeQueue, queuePosition };
