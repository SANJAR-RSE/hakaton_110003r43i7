# MedQueue Tashkent — AI ovoz/video generatsiya prompti

Bu fayl AI ovoz yoki avatar-video generator (ElevenLabs, HeyGen, Lovo.ai, InVideo AI va h.k.)
xizmatiga to'g'ridan-to'g'ri kiritish uchun tayyorlangan. Pastdagi "PROMPT (xizmatga nusxalash uchun)"
qismini AI generatorning "script" / "text" maydoniga joylashtiring, "Ovoz sozlamalari" qismidagi
parametrlarni (til, jins, temp, ohang) mavjud bo'lsa moslang.

---

## Ovoz sozlamalari (generator UI'sida tanlash uchun)

- **Til:** O'zbek (agar mavjud bo'lmasa — Rus yoki Turk aksentidagi neytral ovoz, "Uzbek" so'zini
  promptga aniq yozib qo'yish orqali AI'ga imlo/talaffuzni moslashtirish so'raladi)
- **Ovoz turi:** Ayol yoki erkak — professional, ishonchli, iliq (issiq bo'lmagan, sovuq robot ovoz emas)
- **Ohang (tone):** Ishonchli, do'stona, energik — startup/hackathon taqdimotiga xos entuziazm bilan
- **Tempo (pace):** O'rtacha — shoshilmasdan, lekin dinamik; texnik qismlarda (Arxitektura) biroz
  sekinroq va aniqroq, muammo/natija qismlarida tezroq va his-hayajonli
- **Pauza:** Har bir bo'lim orasida ~1 soniyalik tabiiy pauza
- **Davomiylik:** ~3.5–4 daqiqa (taxminan 480-550 so'z, o'zbek tilida o'rtacha nutq tezligi ~140 so'z/daqiqa)

---

## PROMPT (xizmatga nusxalash uchun)

```
Sen professional o'zbek tilida so'zlovchi AI diktor/avatarsan. Quyidagi matnni
hackathon taqdimoti uchun tabiiy, ishonchli va energik ohangda o'qib ber.

OVOZ YO'NALTIRISHI:
- Til: sof o'zbek tili (lotin yozuvi), tabiiy talaffuz, robot ohangsiz
- Umumiy ohang: professional, ishonchli, iliq — go'yo yosh IT-startup asoschisi
  jamoasi oldida g'oyasini himoya qilyapti
- Tempo: o'rtacha tezlik, lekin har bir bo'lim boshida qisqa pauza (~1s) qo'y
- "Muammo" bo'limida: ovozga bir oz tashvish va empatiya bering — odamlarning
  azobini his qildiring (sekinroq, bosh chayqagandek ohang)
- "Yechim" bo'limida: ohang keskin optimistik va energik bo'lsin — yorug' kelajak
  taqdim etilayotgani sezilsin
- "Arxitektura" bo'limida: aniq, ishonchli, biroz sekinroq va texnik — mutaxassisga
  xos ravon tushuntirish
- "Live Demo" bo'limida: qiziqarli, taklif qiluvchi ohang — "keling, ko'ramiz" kayfiyati
- "Natija" bo'limida: g'ururli, ilhomlantiruvchi, kuchli yakunlovchi urg'u bilan tugating

MATN:

[MUAMMO]
Assalomu alaykum! Tasavvur qiling: ertalab soat yettida onangiz Toshkentdagi
poliklinikaga yetib boradi. Navbat raqami — qirq uch. Oldinda esa — o'ttiz besh
kishi. U yerda ikki, uch, ba'zan to'rt soatlab, hech qanday aniqlik yo'q holda
kutib o'tiradi. Telefoniga qarab, vaqtini behuda sarflab. Va eng achinarlisi —
uning avvalgi tashxislari, tahlillari boshqa klinikada, qog'ozlarda qolib ketgan.
Har safar — noldan boshlash. Bu — Toshkentdagi millionlab bemorning kundalik
haqiqati.

[YECHIM]
Biz MedQueue Tashkent — shu muammoni hal qilish uchun yaratdik. Bu — onlayn
navbat, raqamli tibbiy tarix va sun'iy intellekt yordamchisini bitta platformada
birlashtirgan tizim. Bemor endi klinikaga bormasdan turib, telefonidan klinika,
bo'lim va shifokorni tanlab, onlayn navbat oladi. Navbat holatini real vaqtda
kuzatadi. Va navbati yaqinlashganda — Telegram bot orqali avtomatik xabar oladi.
Endi soatlab bekorchi kutish shart emas — kerak paytida kelsa, yetarli.

[ARXITEKTURA]
Endi arxitekturaga qisqacha nazar tashlaymiz. Tizimning yuragida — yagona
Express va Mongoose'ga asoslangan backend API va bitta MongoDB baza turibdi.
Ikkita mustaqil klient — Next.js'da qurilgan veb-ilova va Telegraf asosidagi
Telegram bot — aynan shu bitta backendga ulanadi. Bog'lovchi element esa —
oddiy va ishonchli: foydalanuvchining telefon raqami. Veb'da ro'yxatdan o'tgan
bemor Telegram botda shu raqamni tasdiqlasa — ikkala tizim bitta ma'lumotlar
to'plamiga ishlaydi, alohida sinxronizatsiya kerak emas. Ustiga — sun'iy
intellekt yordamchi qo'shilgan: u bazadagi haqiqiy klinik, shifokor va navbat
ma'lumotlariga asoslanib, Claude orqali tabiiy tilda javob beradi — hech qachon
o'ylab topilgan ma'lumot bermaydi.

[LIVE DEMO]
Keling, amalda ko'ramiz. Bemor ilovaga kiradi, klinikani va shifokorni tanlaydi,
bir necha bosishda navbat oladi. Status darhol — "tasdiqlangan"dan "kutmoqda"ga
o'tadi. Navbat oldida ikki kishi qolganda, tizim buni avtomatik his qiladi va
Telegram orqali "navbatingiz yaqinlashmoqda" degan xabar yuboradi. Shu daqiqada
bemor Telegram botni ochadi — va aynan shu navbatni, aynan shu holatda u yerda
ham ko'radi. Hech qanday kechikish, hech qanday qo'lda yangilash — hammasi
jonli.

[NATIJA]
Natijada nima olamiz? Bemorlar uchun — kamroq kutish, ko'proq aniqlik va bitta
joyda saqlanadigan to'liq tibbiy tarix. Klinikalar uchun — tartibli navbat
boshqaruvi va band bo'lmagan qabulxona. Va bularning barchasi — bitta backend,
bitta baza, ikkita ulangan klient va sun'iy intellekt yordamida ishlaydi. Biz
ishonamizki, MedQueue Tashkent — Toshkent tibbiyotidagi navbat muammosini hal
qiladigan real, ishlaydigan qadam. Diqqat bilan tinglaganingiz uchun rahmat!
```

---

## Subtitle/UI matni uchun bo'limlarga ajratilgan versiya

Quyidagi bo'linish `presentation/index.html` ichidagi slaydlar va cursor/reveal
sinxronizatsiyasi uchun ishlatiladi (har bir bo'lim umumiy audio davomiyligining
taxminiy foizini egallaydi, so'z soniga mutanosib):

| Bo'lim | Taxminiy % (davomiylikdan) | Kalit fokus elementlar |
|---|---|---|
| 0. Sarlavha/kirish | 0–4% | Logo, nom, tagline |
| 1. Muammo | 4–24% | Soat, navbat raqami, statistika kartochkalari |
| 2. Yechim | 24–42% | 3 ta xususiyat kartochkasi (navbat, tarix, AI) |
| 3. Arxitektura | 42–66% | Diagram: Web + Bot → Backend → MongoDB |
| 4. Live Demo | 66–86% | Status oqimi: CONFIRMED → WAITING → NEAR → CALLED |
| 5. Natija | 86–100% | Yakuniy statistikalar, CTA, live linklar |
