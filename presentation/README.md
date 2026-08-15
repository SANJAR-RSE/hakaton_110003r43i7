# MedQueue Tashkent — Taqdimot

**Live:** https://presentation-sanjar2.vercel.app

Gapiradigan, yuqori-animatsiyali taqdimot sahifasi. Custom cursor, slaydlarning
audio vaqtiga sinxronlashgan navbatma-navbat paydo bo'lishi, arxitektura
diagrammasi va real-vaqt "waveform" — hammasi bitta `index.html` faylida.

## Tarkib

- `index.html` — taqdimot sahifasi (HTML/CSS/JS, tashqi kutubxonasiz)
- `audio/narration.mp3` — ElevenLabs orqali generatsiya qilingan ovozli nutq (~3:09)
- `PROMPT.md` — nutq matni va AI ovoz generatoriga berilgan to'liq prompt

## Qanday ochish

Audio Web Audio API (`fetch` + `decodeAudioData`) orqali yuklanadi — shu sabab
faylni **to'g'ridan-to'g'ri ikki marta bosib ochmang** (`file://`), chunki
brauzerlar `file://` protokolida `fetch()`ni CORS tufayli bloklaydi. O'rniga
istalgan oddiy local server orqali oching:

```bash
cd presentation
python -m http.server 8080
# yoki: npx serve .
```

So'ng brauzerda `http://localhost:8080` oching. Demo/taqdimot paytida ham xuddi
shu tarzda (yoki Vercel/Netlify'ga statik sifatida deploy qilib) oching.

Agar audio fayl topilmasa yoki yuklanmasa, sahifa avtomatik ravishda
**vizual demo rejimi**ga o'tadi (yuqori o'ng burchakda ogohlantirish chiqadi) —
animatsiyalar taxminiy vaqt bo'yicha (soniyalarda) davom etadi, shunda hatto
audio bo'lmasa ham taqdimotni ko'rsatish mumkin.

## Boshqarish

- Pastdagi ▶ tugma yoki sahifaning istalgan joyiga bosish — play/pause
- Progress bar ustiga bosish — istalgan joyga o'tish (scrub)
- Pastdagi nuqtalar — slaydlar orasida to'g'ridan-to'g'ri sakrash
- Klaviatura: `Space` — play/pause, `→` / `←` — keyingi/oldingi slayd

## Audio'ni qayta generatsiya qilish

`PROMPT.md`dagi "PROMPT (xizmatga nusxalash uchun)" bo'limidagi matnni istalgan
TTS xizmatiga (ElevenLabs va h.k.) joylashtirib, natijani
`audio/narration.mp3` sifatida saqlang. Fayl nomi va joylashuvi o'zgarmasa,
`index.html`da hech narsani o'zgartirish shart emas — slaydlar va cursor
harakatlari audio davomiyligining **foizi** bo'yicha hisoblanadi, shuning
uchun boshqa uzunlikdagi audio bilan ham avtomatik moslashadi.
