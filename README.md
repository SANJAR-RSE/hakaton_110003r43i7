# MedQueue Tashkent

Toshkentdagi shifoxona, poliklinika va xususiy klinikalarda bemorlarning
navbatda uzoq kutish muammosini hal qiluvchi platforma.

**"KAMROQ KUTISH + RAQAMLI NAVBAT + BIR JOYDAGI TIBBIY TARIX + AI YORDAMCHI"**

Bemor klinika, bo'lim va shifokorni tanlab onlayn navbat oladi, navbat holatini
real vaqtda kuzatadi, navbat yaqinlashganda Telegram orqali xabar oladi va
tibbiy tarixini bitta joydan ko'radi. AI yordamchi shu jarayonning har bir
qadamida yordam beradi.

---

## Loyiha tuzilishi

Bitta repo, 4 ta mustaqil qism — har biri o'z `package.json`iga ega,
alohida deploy qilinadi:

```
repo/
├── backend/    Express + Mongoose API server (yagona data-access qatlami)
├── web/        Next.js — asosiy funksional ilova (bemor + shifokor)
├── landing/    Next.js — marketing/tanishtiruv sayti
├── bot/        Node.js + Telegraf — Telegram bot
└── README.md   (shu fayl)
```

Web, Telegram bot va AI yordamchi **bitta backend va bitta MongoDB**
bazasidan foydalanadi:

```
WEB ──┐
      ├──► BACKEND API (Express) ──► MONGODB
BOT ──┘
```

### Web ↔ Bot sinxronizatsiyasi (telefon raqami orqali)

Tizimdagi yagona identifikator — **telefon raqami** (`User.phone`, unique,
har doim `backend/src/utils/normalizePhone.js` orqali `+998XXXXXXXXX`
formatiga normalizatsiya qilinadi). Web'da ro'yxatdan o'tgan raqam bilan
Telegram botda "Raqamni yuborish" tugmasi bosilsa, backend xuddi shu
`User` hujjatini topib botning `telegramChatId`sini unga bog'laydi — ikkala
klient ham bitta backend'dagi bitta ma'lumotlar to'plamiga yozadi, shuning
uchun alohida "sync" jarayoni shart emas: Web'dan olingan navbat botda,
bot orqali olingan navbat Web'da darhol ko'rinadi.

---

## Texnologiyalar

| Qism | Stack |
|---|---|
| Backend | Node.js, Express, Mongoose, JWT, bcrypt, Zod |
| Web | Next.js (App Router), Tailwind CSS, TanStack Query, Zustand, React Hook Form + Zod, lucide-react, sonner |
| Landing | Next.js, Tailwind CSS |
| Bot | Node.js, Telegraf, Axios (backend API orqali) |
| Database | MongoDB (Atlas) |
| AI | Backend orqali (Anthropic API, ixtiyoriy — pastga qarang) |

---

## Tezkor ishga tushirish (lokal)

Har bir qism alohida terminalda ishga tushiriladi.

### 1. Backend

```bash
cd backend
cp .env.example .env      # keyin .env ichidagi qiymatlarni to'ldiring
npm install
npm run seed               # demo ma'lumotlar bilan bazani to'ldiradi
npm run dev                 # http://localhost:5000
```

`.env` da kerakli qiymatlar:

```
PORT=5000
MONGO_URI=<MongoDB Atlas connection string>
JWT_SECRET=<random uzun matn>
BOT_TOKEN=<Telegram bot token>
ANTHROPIC_API_KEY=          # ixtiyoriy, pastga qarang
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 2. Web (asosiy ilova)

```bash
cd web
cp .env.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

**Demo hisoblar** (`npm run seed` orqali yaratiladi):

| Rol | Telefon | Parol |
|---|---|---|
| Bemor | `+998901234567` | `patient123` |
| Shifokor | `+998907654321` | `doctor123` |

### 3. Landing

```bash
cd landing
cp .env.example .env.local
npm install
npm run dev                 # http://localhost:3001 (yoki -p bilan boshqa port)
```

### 4. Telegram bot

```bash
cd bot
cp .env.example .env
npm install
npm run dev
```

Botni Telegram'da oching, `/start` bosing, "Raqamni yuborish" orqali
bemorning telefon raqamini ulang (masalan demo bemor `+998901234567`) —
shu hisobning barcha navbatlari botda ham ko'rinadi.

---

## AI yordamchi haqida

AI yordamchi **kalitsiz ham to'liq ishlaydi**: backend har doim avval real
MongoDB ma'lumotlaridan (klinika/bo'lim/shifokor/o'z navbati/tibbiy tarixi)
tegishli kontekstni yig'adi, so'ng:

- agar `backend/.env` da `ANTHROPIC_API_KEY` bo'lsa — shu kontekst asosida
  Claude orqali tabiiy tildagi javob generatsiya qilinadi;
- bo'lmasa — xuddi shu real ma'lumotlar asosida qoidaviy (rule-based)
  shablon javob qaytariladi.

Ikkala holatda ham javob **faqat bazadagi haqiqiy ma'lumotlarga** asoslanadi
— fake klinika/shifokor/navbat hech qachon o'ylab topilmaydi. Kalitni
qo'shish uchun `backend/.env` da `ANTHROPIC_API_KEY=...` yozib backendni
qayta ishga tushirish kifoya, kod o'zgarishi shart emas.

---

## Deploy

- **Backend** → Render (Root Directory: `backend`, Build: `npm install`,
  Start: `npm start`). Env: `MONGO_URI`, `JWT_SECRET`, `BOT_TOKEN`,
  `ANTHROPIC_API_KEY` (ixtiyoriy), `CORS_ORIGINS` (web va landing domenlari).
- **Bot** → Render Web Service (Root Directory: `bot`). Env: `BOT_TOKEN`,
  `API_URL` (backend'ning live URL'i + `/api`), `WEBHOOK_DOMAIN` (botning
  o'zining live URL'i, masalan `https://medqueue-bot.onrender.com`).
  **Muhim:** `WEBHOOK_DOMAIN` bo'lmasa bot long-polling'ga o'tadi — bu
  Render bepul tarifida ishlamaydi, chunki HTTP trafiksiz xizmat ~15
  daqiqada "uxlab qoladi" va polling loop hech narsa uni uyg'otmagani
  uchun jimgina to'xtaydi. `WEBHOOK_DOMAIN` bilan Telegram xabarlarni
  to'g'ridan-to'g'ri HTTP POST sifatida yuboradi — bu ham xabarni
  yetkazadi, ham uxlab qolgan xizmatni uyg'otadi.
- **Web** → Vercel (Root Directory: `web`). Env: `NEXT_PUBLIC_API_URL`
  (backend'ning live URL'i + `/api`).
- **Landing** → Vercel (Root Directory: `landing`). Env:
  `NEXT_PUBLIC_WEB_URL`, `NEXT_PUBLIC_BOT_URL`.

Har bir Render/Vercel service shu GitHub repo'ga ulanadi — keyingi
`git push`larda hammasi avtomatik qayta deploy bo'ladi.

Live linklar:

- Web — https://web-sanjar2.vercel.app
- Landing — https://landing-sanjar2.vercel.app
- Backend API — https://medqueue-backend-e8o3.onrender.com
- Telegram bot — https://t.me/hakatontest_bot

> Render'ning bepul tarifida backend cold-start bo'lishi mumkin (birinchi
> so'rov 20-30 soniya cho'zilishi mumkin) — demo oldidan bir marta
> `/health` endpointiga so'rov yuborib "isitib qo'ying".

---

## Navbat statuslari

```
CONFIRMED → WAITING → NEAR → CALLED → COMPLETED / CANCELLED
```

`NEAR` — navbat oldida ≤2 kishi qolganda avtomatik qo'yiladi va bemorga
Telegram orqali "yaqinlashmoqda" xabari yuboriladi. Status o'zgarishi
backend orqali ikkala klientda (Web + Bot) darhol aks etadi.

## Xavfsizlik

- Barcha secretlar `.env` orqali, `.gitignore`da (`.env`, `.env.local`).
- JWT authentication + role-based middleware (`patient` / `doctor`).
- Bemor faqat o'z navbati/tibbiy tarixini ko'radi; shifokor faqat o'zi
  davolagan bemorlar tarixiga kira oladi.
- MongoDB credential, Bot token, AI API key hech qachon frontendga
  yuborilmaydi — faqat backend `.env`da.
- Parollar bcrypt bilan hash qilinadi.
- Telefon raqamlari doim `normalizePhone()` orqali solishtiriladi.
