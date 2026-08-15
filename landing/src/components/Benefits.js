import { Clock3, MapPinned, FileText, Sparkles, Send, ShieldCheck } from 'lucide-react';

const BENEFITS = [
  { icon: Clock3, title: 'Kamroq kutish', text: "Navbatingiz qachon kelishini bilib, vaqtingizni tejang." },
  { icon: MapPinned, title: 'Raqamli navbat', text: 'Klinikaga bormasdan turib bo\'sh vaqtlarni ko\'ring va navbat oling.' },
  { icon: FileText, title: 'Bir joydagi tibbiy tarix', text: "Barcha ko'riklar va tahlil natijalari bitta joyda saqlanadi." },
  { icon: Sparkles, title: 'AI yordamchi', text: "Klinika topish, navbat olish va savollaringizga tezkor javob." },
  { icon: Send, title: 'Telegram bildirishnoma', text: "Navbat holati o'zgarganda avtomatik xabar olasiz." },
  { icon: ShieldCheck, title: 'Xavfsiz va ishonchli', text: "Ma'lumotlaringiz shifrlangan holda, faqat sizga tegishli." },
];

export function Benefits() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <div className="mx-auto max-w-xl text-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">Afzalliklar</span>
        <h2 className="mt-2 text-3xl font-semibold">Nega MedQueue?</h2>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map((b) => (
          <div key={b.title} className="rounded-2xl border border-border bg-surface p-6 transition-shadow hover:shadow-md">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <b.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold">{b.title}</h3>
            <p className="mt-1.5 text-sm text-muted">{b.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
