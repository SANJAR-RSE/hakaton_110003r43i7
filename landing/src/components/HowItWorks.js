import { Building2, Stethoscope, CalendarClock, BellRing } from 'lucide-react';

const STEPS = [
  { icon: Building2, title: 'Klinika va bo\'limni tanlang', text: 'Toshkentdagi 8+ klinikadan birini va kerakli bo\'limni tanlang.' },
  { icon: Stethoscope, title: 'Shifokorni tanlang', text: 'Reyting va tajribasiga qarab mos shifokorni toping.' },
  { icon: CalendarClock, title: "Bo'sh vaqtni band qiling", text: "Sizga qulay kun va vaqtni tanlab, bir tugma bilan navbat oling." },
  { icon: BellRing, title: 'Navbatni kuzating', text: 'Navbat holatini ilovada ko\'ring, yaqinlashganda Telegram orqali xabar oling.' },
];

export function HowItWorks() {
  return (
    <section id="qanday-ishlaydi" className="bg-surface py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">Qanday ishlaydi</span>
          <h2 className="mt-2 text-3xl font-semibold">4 ta oddiy qadam</h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative rounded-2xl border border-border bg-background p-6">
              <span className="absolute -top-3 left-6 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
