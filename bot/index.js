require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const { linkTelegramAccount, authed, extractApiError } = require('./src/api');
const { getSession, resetWizard } = require('./src/session');

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('[bot] BOT_TOKEN is not set in .env');
  process.exit(1);
}

const bot = new Telegraf(token);

const MAIN_MENU = Markup.keyboard([
  ['🏥 Yangi navbat olish'],
  ['📋 Navbatlarim', '👤 Profil'],
]).resize();

const DAY_LABELS = ['Bugun', 'Ertaga', 'Indinga'];

function requireAuth(ctx, next) {
  const session = getSession(ctx.chat.id);
  if (!session.token) {
    ctx.reply(
      "Avval telefon raqamingizni ulashing - shu orqali sizni Web ilovadagi hisobingiz bilan bog'laymiz.",
      Markup.keyboard([Markup.button.contactRequest("📱 Raqamni yuborish")]).resize()
    );
    return;
  }
  return next(session);
}

// ---- /start -----------------------------------------------------------
bot.start((ctx) => {
  const session = getSession(ctx.chat.id);
  if (session.token) {
    ctx.reply(`Xush kelibsiz, ${session.user.fullName}! Nima qilamiz?`, MAIN_MENU);
    return;
  }
  ctx.reply(
    "Salom! MedQueue Tashkent botiga xush kelibsiz 👋\n\n" +
      "Bu bot orqali navbat olishingiz, navbat holatini kuzatishingiz va uni bekor qilishingiz mumkin.\n\n" +
      "Boshlash uchun telefon raqamingizni yuboring - agar Web saytda ro'yxatdan o'tgan bo'lsangiz, shu bot ham xuddi o'sha hisobingizga ulanadi.",
    Markup.keyboard([Markup.button.contactRequest('📱 Raqamni yuborish')]).resize()
  );
});

// ---- contact share -> link account -------------------------------------
bot.on('contact', async (ctx) => {
  const contact = ctx.message.contact;
  if (contact.user_id && contact.user_id !== ctx.from.id) {
    ctx.reply("Iltimos, faqat o'zingizning raqamingizni yuboring.");
    return;
  }
  try {
    const { token: jwt, user } = await linkTelegramAccount({
      phone: contact.phone_number,
      telegramChatId: ctx.chat.id,
      telegramUsername: ctx.from.username,
      fullName: `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || undefined,
    });
    const session = getSession(ctx.chat.id);
    session.token = jwt;
    session.user = user;
    ctx.reply(
      `Hisobingiz ulandi ✅\n\nSalom, ${user.fullName}!\nEndi Web saytdagi navbatlaringizni shu yerda ham ko'rasiz, va bu yerda olgan navbat Web'da ham ko'rinadi.`,
      MAIN_MENU
    );
  } catch (err) {
    console.error('[bot] link failed:', err.response?.data || err.message);
    ctx.reply(extractApiError(err));
  }
});

// ---- Main menu -----------------------------------------------------------
bot.hears('🏥 Yangi navbat olish', (ctx) =>
  requireAuth(ctx, async (session) => {
    resetWizard(ctx.chat.id);
    try {
      const clinics = await authed(session.token).getClinics();
      if (!clinics.length) return ctx.reply('Hozircha klinikalar mavjud emas.');
      ctx.reply(
        "Qaysi klinikani tanlaysiz?",
        Markup.inlineKeyboard(clinics.map((c) => [Markup.button.callback(`${c.name} (${c.district || ''})`, `clinic:${c._id}`)]))
      );
    } catch (err) {
      ctx.reply(extractApiError(err));
    }
  })
);

bot.hears('📋 Navbatlarim', (ctx) =>
  requireAuth(ctx, async (session) => {
    try {
      const appointments = await authed(session.token).myAppointments();
      const active = appointments.filter((a) => !['COMPLETED', 'CANCELLED'].includes(a.status));
      if (!active.length) {
        return ctx.reply("Hozircha faol navbatingiz yo'q.", MAIN_MENU);
      }
      for (const a of active) {
        const text =
          `🎫 <b>${a.queueNumber}</b>\n` +
          `${a.department?.name} - Dr. ${a.doctor?.firstName} ${a.doctor?.lastName}\n` +
          `${a.clinic?.name}\n` +
          `📅 ${a.date} ⏰ ${a.time}\n` +
          `Status: ${a.status}${a.queuePosition != null ? `\nOldingizda ${a.queuePosition} kishi` : ''}`;
        await ctx.reply(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback('❌ Bekor qilish', `cancel:${a._id}`)]]) });
      }
    } catch (err) {
      ctx.reply(extractApiError(err));
    }
  })
);

bot.hears('👤 Profil', (ctx) =>
  requireAuth(ctx, async (session) => {
    ctx.reply(`👤 ${session.user.fullName}\n📱 ${session.user.phone}\n\nWeb saytda ham shu hisob bilan kirishingiz mumkin.`);
  })
);

// ---- Booking wizard callbacks ---------------------------------------------
bot.action(/^clinic:(.+)$/, async (ctx) => {
  const clinicId = ctx.match[1];
  const session = getSession(ctx.chat.id);
  if (!session.token) return ctx.answerCbQuery();
  session.wizard.clinicId = clinicId;
  await ctx.answerCbQuery();
  try {
    const departments = await authed(session.token).getDepartments(clinicId);
    if (!departments.length) return ctx.editMessageText("Bu klinikada bo'limlar topilmadi.");
    await ctx.editMessageText(
      "Qaysi bo'lim kerak?",
      Markup.inlineKeyboard(departments.map((d) => [Markup.button.callback(d.name, `dept:${d._id}`)]))
    );
  } catch (err) {
    ctx.reply(extractApiError(err));
  }
});

bot.action(/^dept:(.+)$/, async (ctx) => {
  const departmentId = ctx.match[1];
  const session = getSession(ctx.chat.id);
  if (!session.token) return ctx.answerCbQuery();
  session.wizard.departmentId = departmentId;
  await ctx.answerCbQuery();
  try {
    const doctors = await authed(session.token).getDoctors(session.wizard.clinicId, departmentId);
    if (!doctors.length) return ctx.editMessageText("Bu bo'limda shifokor topilmadi.");
    await ctx.editMessageText(
      'Shifokorni tanlang:',
      Markup.inlineKeyboard(
        doctors.map((d) => [Markup.button.callback(`Dr. ${d.firstName} ${d.lastName} ⭐${d.rating}`, `doc:${d._id}`)])
      )
    );
  } catch (err) {
    ctx.reply(extractApiError(err));
  }
});

bot.action(/^doc:(.+)$/, async (ctx) => {
  const doctorId = ctx.match[1];
  const session = getSession(ctx.chat.id);
  if (!session.token) return ctx.answerCbQuery();
  session.wizard.doctorId = doctorId;
  await ctx.answerCbQuery();
  const days = [0, 1, 2].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  });
  await ctx.editMessageText(
    'Qaysi kunga navbat olamiz?',
    Markup.inlineKeyboard(days.map((date, i) => [Markup.button.callback(`${DAY_LABELS[i]} (${date})`, `date:${date}`)]))
  );
});

bot.action(/^date:(.+)$/, async (ctx) => {
  const date = ctx.match[1];
  const session = getSession(ctx.chat.id);
  if (!session.token) return ctx.answerCbQuery();
  await ctx.answerCbQuery();
  try {
    const schedules = await authed(session.token).getSchedules(session.wizard.doctorId, date);
    const free = schedules.filter((s) => !s.isBooked);
    if (!free.length) {
      return ctx.editMessageText("Bu kunga bo'sh vaqt yo'q. Boshqa kunni tanlang yoki /start orqali qayta boshlang.");
    }
    const rows = [];
    for (let i = 0; i < free.length; i += 3) {
      rows.push(free.slice(i, i + 3).map((s) => Markup.button.callback(s.startTime, `slot:${s._id}`)));
    }
    await ctx.editMessageText(`${date} kuni bo'sh vaqtlar:`, Markup.inlineKeyboard(rows));
  } catch (err) {
    ctx.reply(extractApiError(err));
  }
});

bot.action(/^slot:(.+)$/, async (ctx) => {
  const scheduleId = ctx.match[1];
  const session = getSession(ctx.chat.id);
  if (!session.token) return ctx.answerCbQuery();
  await ctx.answerCbQuery('Navbat olinmoqda...');
  try {
    const appointment = await authed(session.token).bookAppointment(scheduleId);
    resetWizard(ctx.chat.id);
    await ctx.editMessageText(
      `✅ Navbat muvaffaqiyatli olindi!\n\n🎫 <b>${appointment.queueNumber}</b>\n${appointment.department?.name} - Dr. ${appointment.doctor?.firstName} ${appointment.doctor?.lastName}\n${appointment.clinic?.name}\n📅 ${appointment.date} ⏰ ${appointment.time}\n\nBu navbat Web ilovada ham ko'rinadi.`,
      { parse_mode: 'HTML' }
    );
    await ctx.reply('Yana nima qilamiz?', MAIN_MENU);
  } catch (err) {
    ctx.reply(extractApiError(err));
  }
});

bot.action(/^cancel:(.+)$/, async (ctx) => {
  const appointmentId = ctx.match[1];
  const session = getSession(ctx.chat.id);
  if (!session.token) return ctx.answerCbQuery();
  await ctx.answerCbQuery();
  try {
    await authed(session.token).cancelAppointment(appointmentId);
    await ctx.editMessageText("Navbat bekor qilindi. ❌ Bu o'zgarish Web ilovada ham ko'rinadi.");
  } catch (err) {
    ctx.reply(extractApiError(err));
  }
});

bot.catch((err, ctx) => {
  console.error(`[bot] unhandled error for update ${ctx.updateType}:`, err);
  ctx.reply("Kutilmagan xatolik yuz berdi. Iltimos, /start bosib qayta urinib ko'ring.").catch(() => {});
});

const PORT = process.env.PORT || 3000;
// WEBHOOK_DOMAIN is this service's own public HTTPS URL, e.g.
// https://medqueue-bot.onrender.com (set as an env var on the host).
const WEBHOOK_DOMAIN = process.env.WEBHOOK_DOMAIN;

if (WEBHOOK_DOMAIN) {
  // Webhook mode: Telegram pushes updates to us as real HTTP requests.
  // This is required on free-tier hosts (Render, etc.) that spin an idle
  // Web Service down after ~15 min of no HTTP traffic - long-polling would
  // silently die on sleep since it never receives inbound traffic to wake
  // the service back up, while a webhook POST both delivers the update AND
  // wakes the service.
  bot
    .launch({ webhook: { domain: WEBHOOK_DOMAIN, port: PORT } })
    .then(() => console.log(`[bot] MedQueue Telegram bot started (webhook @ ${WEBHOOK_DOMAIN})`))
    .catch((err) => console.error('[bot] failed to launch webhook:', err));
} else {
  // Local development: plain long-polling, no public URL needed.
  bot
    .launch()
    .then(() => console.log('[bot] MedQueue Telegram bot started (polling)'))
    .catch((err) => console.error('[bot] failed to launch polling:', err));
}

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
