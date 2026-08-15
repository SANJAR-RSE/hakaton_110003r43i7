# MedQueue Tashkent — to'liq loyihani tushuntiruvchi AI prompt

Bu fayl — istalgan AI taqdimot/slayd generatoriga (Gamma, Tome, Beautiful.ai,
Canva AI, ChatGPT/Claude va h.k.) to'g'ridan-to'g'ri nusxalab joylashtirish
uchun tayyorlangan **to'liq** prompt. `PROMPT.md`dagi audio-narratsiya
promptidan farqi — bu yerda loyihaning **har bir qismi** (arxitektura, data
model, foydalanuvchi oqimlari, AI yordamchi, deploy) to'liq va batafsil
tushuntiriladi, shunda AI generator to'liq, texnik jihatdan aniq slaydlar
qurishi mumkin.

---

## PROMPT (xizmatga nusxalash uchun)

```
Sen tajribali product va texnik taqdimot muallifisan. Quyidagi ma'lumotlar
asosida "MedQueue Tashkent" nomli hackathon loyihasi uchun to'liq, professional
slayd-taqdimot (10-14 slayd) tayyorla. Auditoriya — hackathon jyurisi
(texnik va biznes fon aralash). Til — o'zbek tili. Ohang — ishonchli, aniq,
ortiqcha marketing bo'rttirishisiz, lekin muammoni his qildiradigan.

Har bir slaydda: qisqa sarlavha, 3-5 ta bullet yoki vizual blok, kerak bo'lsa
diagram/screenshot uchun joy belgisi. Kod parchalarini ko'rsatma — faqat
tushunarli, vizual tildagi izoh.

=== LOYIHA HAQIDA UMUMIY MA'LUMOT ===

Nomi: MedQueue Tashkent
Bir jumlada: Toshkentdagi shifoxona/poliklinika/xususiy klinikalarda
bemorlarning navbatda uzoq va noaniq kutish muammosini hal qiluvchi platforma
— onlayn navbat + real-vaqt kuzatuv + Telegram bildirishnoma + raqamli tibbiy
tarix + AI yordamchi.
Slogan: "Kamroq kutish + Raqamli navbat + Bir joydagi tibbiy tarix + AI yordamchi"

=== 1. MUAMMO ===

Toshkent poliklinikalarida:
- Bemorlar navbat uchun 2-4 soat, aniq vaqtsiz kutadi (navbat raqami bor,
  lekin "qachon chaqirilaman" noma'lum).
- Navbatda birjoyda 30+ kishi bo'lishi odatiy holat.
- Tibbiy tarix (tashxis, tahlil natijalari, retseptlar) klinikadan klinikaga
  tarqoq — har safar yangi klinikada hamma narsa noldan boshlanadi.
- Bemor bilan klinika o'rtasida real-vaqtli aloqa yo'q — navbat yaqinlashsa
  ham hech kim ogohlantirmaydi.

=== 2. YECHIM — MedQueue Tashkent nima qiladi ===

Bitta platformada:
1. Onlayn navbat olish — bemor klinika, bo'lim (masalan Kardiologiya,
   Stomatologiya, Pediatriya) va aniq shifokorni tanlab, bo'sh vaqt oralig'ini
   ko'rib, bir necha bosishda navbat oladi.
2. Real-vaqt navbat kuzatuvi — navbat holati avtomatik quyidagi bosqichlardan
   o'tadi: CONFIRMED (tasdiqlangan) → WAITING (kutmoqda) → NEAR (yaqinlashmoqda,
   oldinda ≤2 kishi qolganda avtomatik qo'yiladi) → CALLED (chaqirildi) →
   COMPLETED (yakunlandi) / CANCELLED (bekor qilindi).
3. Telegram bot orqali avtomatik bildirishnoma — navbat NEAR statusiga
   o'tganda bemorga darhol Telegram xabari boradi, u klinikada zerikib
   kutmasdan, aynan kerakli vaqtda kelishi mumkin.
4. Raqamli tibbiy tarix — har bir yakunlangan qabuldan so'ng shifokor
   ko'rik xulosasi, tavsiyalar va laboratoriya natijalarini (test nomi,
   qiymati, normal oralig'i) tizimga kiritadi; bemor buni istalgan vaqt
   bitta joydan — "Tibbiy tarix" bo'limidan — ko'radi, boshqa klinikaga
   borganda ham shu tarix saqlanib qoladi.
5. AI yordamchi — bemor savol bersa ("navbatim qachon?", "qaysi shifokor
   bo'sh?", "oxirgi tahlilim natijasi qanday?"), tizim avval MongoDB'dan
   REAL ma'lumotni yig'adi (o'sha bemorning haqiqiy navbati, klinikasi,
   tarixi), so'ng shu asosda javob shakllantiradi — hech qachon o'ylab
   topilgan klinika/shifokor/natija aytmaydi.

=== 3. FOYDALANUVCHI OQIMLARI (User Flows) ===

BEMOR (patient) oqimi:
  Ro'yxatdan o'tish (telefon raqami + parol) → Klinikalar ro'yxatini ko'rish
  → Klinika tanlash → Bo'lim tanlash → Shifokor tanlash (reyting, tajriba
  yili bilan) → Bo'sh vaqt oralig'ini (schedule slot) tanlash → Navbat
  tasdiqlash (queueNumber avtomatik beriladi, masalan "A-24") → Dashboard'da
  navbat holatini kuzatish → Telegram botni ulash (raqamni tasdiqlash) →
  navbat NEAR bo'lganda Telegram orqali xabar olish → qabuldan so'ng
  "Tibbiy tarix"da yozuvni ko'rish.

SHIFOKOR (doctor) oqimi:
  Login → O'z jadvali (schedule)ni ko'rish/boshqarish → Kunlik navbatdagi
  bemorlar ro'yxatini ko'rish → Bemorni "chaqirish" (CALLED) → Qabulni
  yakunlab (COMPLETED), ko'rik xulosasi + tavsiya + lab natijalarini
  tibbiy tarixga yozish → faqat o'zi davolagan bemorlarning tarixiga
  kirish huquqiga ega (boshqa shifokor bemorlarini ko'ra olmaydi).

TELEGRAM BOT oqimi:
  /start → "Raqamni yuborish" tugmasi → backend shu telefon raqamiga ega
  User hujjatini topib, botning telegramChatId'sini unga bog'laydi → endi
  bot orqali o'sha hisobning barcha navbatlari va bildirishnomalari
  ko'rinadi — web'da ochilgan navbat botda ham, bot orqali qilingan
  amal web'da ham darhol aks etadi (bitta backend, bitta baza).

=== 4. ARXITEKTURA (texnik qism) ===

Monorepo, 4 mustaqil qism, bitta GitHub repo, har biri alohida deploy:

  repo/
  ├── backend/     Express + Mongoose API server — yagona data-access qatlami
  ├── web/         Next.js (App Router) — bemor + shifokor uchun asosiy ilova
  ├── landing/     Next.js — marketing/tanishtiruv sayti
  └── bot/         Node.js + Telegraf — Telegram bot

Muhim arxitektura printsipi: WEB va BOT — ikkalasi ham mustaqil klientlar,
lekin ikkalasi ham AYNAN BITTA backend API va BITTA MongoDB bazasidan
foydalanadi. Alohida "sinxronizatsiya jarayoni" yo'q — chunki ikkalasi ham
bir xil ma'lumotlar to'plamiga yozadi/o'qiydi.

  WEB ──┐
        ├──► BACKEND API (Express + Mongoose) ──► MongoDB (Atlas)
  BOT ──┘                    │
                              └──► AI Service (Claude, ixtiyoriy)

Bog'lovchi kalit — foydalanuvchining TELEFON RAQAMI (User.phone, unique,
har doim normalizePhone() orqali +998XXXXXXXXX formatiga keltiriladi).

Backend qatlamlari:
- models/  — Mongoose sxemalar (pastga qarang)
- routes/  — REST endpointlar (auth, clinics, departments, doctors,
  schedules, appointments, medicalRecords, notifications, ai, users)
- services/ — biznes-mantiq (queue.service — navbat pozitsiyasi va
  status o'tishlarini hisoblash; telegram.service — botga xabar yuborish;
  ai.service — AI yordamchi uchun real kontekst yig'ish)
- middleware/ — JWT auth va role-based ruxsat (patient / doctor)

=== 5. MA'LUMOTLAR MODELI (Data Model) ===

- User — phone (unique, yagona identifikator), passwordHash, fullName,
  role (patient/doctor), telegramChatId (bot bilan bog'lash uchun)
- Clinic — nomi, manzili, telefon, ish vaqti, reyting
- Department — klinikaga tegishli bo'lim (masalan Kardiologiya)
- Doctor — ism, mutaxassislik, tajriba yili, o'z klinika/bo'limiga bog'liq,
  ixtiyoriy ravishda User hisobiga bog'lanadi (login qila olishi uchun)
- Schedule — shifokorning bitta bron qilinadigan vaqt oralig'i (sana,
  boshlanish/tugash vaqti, band yoki bo'shligi)
- Appointment — navbatning o'zi: bemor, shifokor, schedule, navbat raqami
  (masalan "A-24"), status (PENDING→CONFIRMED→WAITING→NEAR→CALLED→
  COMPLETED/CANCELLED), qaysi klient orqali ochilgani (web/bot)
- MedicalRecord — yakunlangan qabuldan keyingi yozuv: ko'rik xulosasi,
  tavsiya, laboratoriya natijalari ro'yxati (test nomi, qiymat, normal
  oralig'i) — appointmentga 1:1 bog'langan
- Notification — bemorga yuboriladigan bildirishnoma (navbat tasdiqlandi /
  yaqinlashmoqda / chaqirildi / yakunlandi / bekor qilindi)

=== 6. AI YORDAMCHI QANDAY ISHLAYDI ===

Ikki bosqichli, kalitsiz ham to'liq ishlaydigan dizayn:
1. Backend har doim avval REAL MongoDB ma'lumotlaridan (o'sha foydalanuvchining
   klinikasi, navbati, tibbiy tarixi, bo'sh shifokorlar) tegishli kontekstni
   yig'adi (kalit so'z va bo'lim moslashtirish orqali).
2. Agar backend/.env'da ANTHROPIC_API_KEY bo'lsa — shu kontekst asosida
   Claude orqali tabiiy tildagi javob generatsiya qilinadi; bo'lmasa — xuddi
   shu real ma'lumotlar asosida qoidaviy (rule-based) shablon javob
   qaytariladi. Ikkala holatda ham javob faqat bazadagi haqiqiy ma'lumotga
   asoslanadi — hech qachon fake klinika/shifokor/natija o'ylab topilmaydi.

=== 7. TEXNOLOGIYALAR (Tech Stack) ===

| Qism | Stack |
|---|---|
| Backend | Node.js, Express, Mongoose, JWT, bcrypt, Zod |
| Web | Next.js (App Router), Tailwind CSS, TanStack Query, Zustand, React Hook Form + Zod, lucide-react, sonner |
| Landing | Next.js, Tailwind CSS |
| Bot | Node.js, Telegraf, Axios |
| Baza | MongoDB (Atlas) |
| AI | Anthropic Claude API (ixtiyoriy, kalitsiz ham ishlaydi) |
| Deploy | Backend + Bot — Render; Web + Landing — Vercel |

=== 8. XAVFSIZLIK ===

- Barcha sirlar (.env) git'ga tushmaydi (.gitignore)
- JWT authentication + role-based middleware (patient / doctor)
- Bemor faqat o'z navbati/tarixini, shifokor faqat o'zi davolagan
  bemorlar tarixini ko'radi
- Parollar bcrypt bilan hash qilinadi
- MongoDB/Bot/AI kalitlari hech qachon frontendga yuborilmaydi

=== 9. LIVE DEMO / NATIJALAR ===

Jonli linklar:
- Web (asosiy ilova) — https://web-sanjar2.vercel.app
- Landing — https://landing-sanjar2.vercel.app
- Backend API — https://medqueue-backend-e8o3.onrender.com
- Telegram bot — https://t.me/hakatontest_bot
- Taqdimot (animatsiyali, ovozli) — https://presentation-sanjar2.vercel.app
- GitHub repo — https://github.com/SANJAR-RSE/hakaton_110003r43i7

Demo hisoblar:
- Bemor: +998901234567 / patient123
- Shifokor: +998907654321 / doctor123

Natija (impact):
- Bemorlar uchun — kamroq kutish, aniq vaqt, bitta joyda to'liq tibbiy tarix
- Klinikalar uchun — tartibli navbat boshqaruvi, band bo'lmagan qabulxona
- Texnik natija — bitta backend + bitta baza + 2 mustaqil klient (web, bot)
  + AI yordamchi, ikkalasi ham real-vaqtda avtomatik sinxron

=== SLAYD TUZILISHI BO'YICHA TAVSIYA (agar generator so'rasa) ===

1. Sarlavha (loyiha nomi, slogan, jamoa)
2. Muammo (statistika/hikoya bilan)
3. Yechim — umumiy ko'rinish (4 ta asosiy xususiyat)
4. Foydalanuvchi oqimi — bemor tomoni (bosqichma-bosqich)
5. Foydalanuvchi oqimi — shifokor tomoni
6. Telegram bot — web bilan real-vaqt sinxronizatsiya
7. Arxitektura diagrammasi
8. Ma'lumotlar modeli (asosiy modellar)
9. AI yordamchi qanday ishlaydi
10. Tech stack
11. Xavfsizlik
12. Live demo / linklar / QR kod taklif qilinadi
13. Natija va kelajak rejalar (masalan: to'lov integratsiyasi, ko'p tilli
    qo'llab-quvvatlash, klinikalar uchun analitika paneli)
14. Rahmat / savollar
```

---

## Foydalanish bo'yicha eslatma

Bu prompt istalgan AI slayd-generator (Gamma.app, Tome.app, Beautiful.ai,
Canva AI, yoki oddiy ChatGPT/Claude — undan slayd matnlarini olib PowerPoint/
Google Slides'ga qo'lda joylashtirish uchun) ga to'liq nusxalanadi. Agar
generator qisqaroq versiya (masalan 6-8 slayd) so'rasa, yuqoridagi 1-2-3-7-9-12
bo'limlariga ustuvorlik bering — bular loyihaning yadrosini eng qisqa yo'l
bilan tushuntiradi.

Ovozli, tayyor HTML taqdimot uchun esa `PROMPT.md` (qisqa 3-4 daqiqalik
narratsiya) va `index.html`dan foydalaning — ular alohida, mustaqil
deliverable.
