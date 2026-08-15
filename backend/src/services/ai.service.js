const axios = require('axios');
const Clinic = require('../models/Clinic');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const { queuePosition } = require('./queue.service');

const MEDICAL_DIAGNOSIS_HINTS = ['tashxis', 'og\'ri', 'kasal', 'dori', 'davolash', 'nima kasallik'];

// Pulls only what's relevant and REAL from the database, based on very
// lightweight keyword matching on the user's message. This context is what
// grounds every AI reply - whether or not an LLM key is configured - so the
// assistant never invents a clinic, doctor or appointment that doesn't exist.
async function gatherContext(user, message) {
  const lower = message.toLowerCase();

  const departments = await Department.find().populate('clinic', 'name').lean();
  const matchedDept = departments.find((d) => lower.includes(d.name.toLowerCase()));

  const deptKeywordMap = {
    yurak: 'Kardiologiya',
    kardiolog: 'Kardiologiya',
    tish: 'Stomatologiya',
    lor: 'LOR',
    quloq: 'LOR',
    teri: 'Dermatologiya',
    bola: 'Pediatriya',
    "ko'z": 'Oftalmologiya',
    nerv: 'Nevrologiya',
  };
  let impliedDeptName = null;
  for (const [kw, deptName] of Object.entries(deptKeywordMap)) {
    if (lower.includes(kw)) {
      impliedDeptName = deptName;
      break;
    }
  }

  const targetDeptName = matchedDept?.name || impliedDeptName;

  let doctors = [];
  if (targetDeptName) {
    doctors = await Doctor.find()
      .populate({ path: 'department', match: { name: targetDeptName } })
      .populate('clinic', 'name')
      .lean();
    doctors = doctors.filter((d) => d.department);
  }

  const clinics = await Clinic.find().limit(8).lean();

  let myAppointment = null;
  let myAppointmentPosition = null;
  let myHistory = [];
  if (user) {
    myAppointment = await Appointment.findOne({
      patient: user._id,
      status: { $in: Appointment.ACTIVE_QUEUE_STATUSES.concat('CALLED') },
    })
      .sort({ createdAt: -1 })
      .populate('doctor', 'firstName lastName specialty')
      .populate('clinic', 'name')
      .populate('department', 'name')
      .lean();
    if (myAppointment) {
      myAppointmentPosition = await queuePosition(myAppointment);
    }
    myHistory = await MedicalRecord.find({ patient: user._id })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('department', 'name')
      .lean();
  }

  return {
    clinics,
    doctors: doctors.slice(0, 6),
    targetDeptName,
    myAppointment,
    myAppointmentPosition,
    myHistory,
  };
}

function buildActions(intent, ctx) {
  const actions = [];
  if (intent.wantsDoctor || intent.wantsDepartment || ctx.targetDeptName) {
    actions.push({ label: "Klinikalarni ko'rish", route: '/clinics' });
  }
  if (intent.wantsMyAppointment) actions.push({ label: 'Navbatimni ko\'rish', route: '/appointments' });
  if (intent.wantsHistory) actions.push({ label: 'Tibbiy tarixim', route: '/medical-history' });
  if (intent.wantsBooking) actions.push({ label: 'Navbat olish', route: '/clinics' });
  return actions;
}

function detectIntent(message) {
  const lower = message.toLowerCase();
  return {
    wantsDoctor: /shifokor|doktor|vrach/.test(lower),
    wantsDepartment: /bo['ʼ]?lim|mutaxassis/.test(lower),
    wantsMyAppointment: /navbat(im|img|)|qachon|nechta odam|oldimda/.test(lower),
    wantsHistory: /tibbiy tarix|ko['ʼ]?rik|tahlil|natija/.test(lower),
    wantsBooking: /navbat ol|band qil|yozil/.test(lower),
    isMedicalAdvice: MEDICAL_DIAGNOSIS_HINTS.some((kw) => lower.includes(kw)),
  };
}

// Rule-based, fully data-grounded reply generator. Used whenever no LLM key
// is configured, and also as the deterministic fallback if the LLM call
// fails for any reason - the assistant must never go silent.
function buildRuleBasedReply(user, message, ctx, intent) {
  if (intent.isMedicalAdvice) {
    return "Men tashxis qo'ya olmayman va dori tavsiya eta olmayman - bu shifokorning vazifasi. Lekin sizga mos bo'lim yoki shifokorni topishga yordam bera olaman. Xohlasangiz shifokor ko'rigiga navbat olib beraman.";
  }

  if (intent.wantsMyAppointment) {
    if (!ctx.myAppointment) {
      return "Hozircha faol navbatingiz yo'q. Klinika, bo'lim va shifokorni tanlab yangi navbat olishingiz mumkin.";
    }
    const a = ctx.myAppointment;
    const ahead = ctx.myAppointmentPosition ?? 0;
    return `Sizning navbatingiz: ${a.queueNumber} (${a.department?.name}, Dr. ${a.doctor?.firstName} ${a.doctor?.lastName}, ${a.clinic?.name}, soat ${a.time}).\nOldingizda ${ahead} kishi bor. Status: ${a.status}.`;
  }

  if (intent.wantsHistory) {
    if (!ctx.myHistory.length) {
      return "Tibbiy tarixingizda hali yozuv yo'q. Birinchi ko'rikdan so'ng bu yerda ko'rinadi.";
    }
    const lines = ctx.myHistory
      .map((h) => `• ${h.date} - ${h.department?.name}: ${h.examination}`)
      .join('\n');
    return `Sizning so'nggi tibbiy yozuvlaringiz:\n${lines}\n\nTo'liq tarixni "Tibbiy tarix" bo'limidan ko'rishingiz mumkin.`;
  }

  if (ctx.targetDeptName) {
    if (!ctx.doctors.length) {
      return `Hozircha "${ctx.targetDeptName}" bo'yicha bo'sh shifokor topilmadi. Boshqa bo'lim yoki klinikani sinab ko'ring.`;
    }
    const lines = ctx.doctors
      .map((d) => `• Dr. ${d.firstName} ${d.lastName} - ${d.clinic?.name} (reyting ${d.rating})`)
      .join('\n');
    return `Sizga "${ctx.targetDeptName}" bo'limi mos keladi. Mavjud shifokorlar:\n${lines}\n\nBirini tanlab, bo'sh vaqtni ko'rib navbat olishingiz mumkin.`;
  }

  if (intent.wantsBooking || intent.wantsDoctor || intent.wantsDepartment) {
    const clinicNames = ctx.clinics.map((c) => c.name).join(', ');
    return `Navbat olish uchun: Klinika → Bo'lim → Shifokor → Vaqt tanlang. Bizda mavjud klinikalar: ${clinicNames}. Qaysi bo'lim kerakligini ayting - masalan "Menga LOR kerak".`;
  }

  return "Salom! Men MedQueue yordamchisiman. Klinika yoki shifokor topishda, navbat olishda, navbat holatini kuzatishda va tibbiy tarixingizni topishda yordam bera olaman. Nima bilan yordam beray?";
}

async function callAnthropic(systemPrompt, message) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.AI_MODEL || 'claude-sonnet-5';
  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model,
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      timeout: 15000,
    }
  );
  return response.data?.content?.[0]?.text?.trim();
}

// Main entry point used by the /api/ai/message route.
async function generateAssistantReply(user, message) {
  const ctx = await gatherContext(user, message);
  const intent = detectIntent(message);
  const actions = buildActions(intent, ctx);
  const fallbackReply = buildRuleBasedReply(user, message, ctx, intent);

  if (!process.env.ANTHROPIC_API_KEY) {
    return { reply: fallbackReply, actions };
  }

  try {
    const systemPrompt = [
      'Siz MedQueue Tashkent platformasining yordamchisisiz. Faqat platforma haqida, klinikalar/shifokorlar/navbat/tibbiy tarix haqida yordam berasiz.',
      "Tashxis qo'ymaysiz, dori dozasini belgilamaysiz, xavfli tibbiy tavsiya bermaysiz.",
      "Faqat quyida berilgan REAL ma'lumotlardan foydalaning, hech qanday klinika/shifokor/navbatni o'zingizdan o'ylab topmang:",
      JSON.stringify(ctx, null, 2),
      'Qisqa, aniq va do\'stona javob bering (o\'zbek tilida).',
    ].join('\n\n');

    const text = await callAnthropic(systemPrompt, message);
    return { reply: text || fallbackReply, actions };
  } catch (err) {
    console.error('[ai] LLM call failed, falling back to rule-based reply:', err.response?.data || err.message);
    return { reply: fallbackReply, actions };
  }
}

module.exports = { generateAssistantReply };
