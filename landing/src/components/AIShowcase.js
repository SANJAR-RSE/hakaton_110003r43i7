import { Sparkles, Bot, User } from 'lucide-react';

export function AIShowcase() {
  return (
    <section id="ai" className="mx-auto max-w-6xl px-5 py-20">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI yordamchi
          </span>
          <h2 className="mt-4 text-3xl font-semibold">Savolingizga darhol javob</h2>
          <p className="mt-4 text-muted">
            &quot;Qaysi klinikada LOR shifokoriga bugun bo&apos;sh joy bor?&quot;, &quot;Navbatim
            qachon?&quot; kabi savollarga AI yordamchi real ma&apos;lumotlar asosida javob
            beradi va sizni to&apos;g&apos;ri sahifaga yo&apos;naltiradi.
          </p>
          <ul className="mt-6 space-y-2.5 text-sm">
            {['Klinika va shifokor topish', 'Navbat olish jarayonini boshqarish', 'Navbat holati haqida ma\'lumot', "Tibbiy tarixni topishga yordam"].map((t) => (
              <li key={t} className="flex items-center gap-2 text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5 shadow-xl shadow-primary/5">
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">MedQueue AI</p>
              <p className="text-xs text-muted">Sizga qanday yordam beray?</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-end gap-2">
              <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                Menga LOR shifokori kerak
              </div>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><User className="h-3.5 w-3.5" /></span>
            </div>
            <div className="flex gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"><Bot className="h-3.5 w-3.5" /></span>
              <div className="rounded-2xl rounded-tl-sm border border-border bg-background px-4 py-2.5 text-sm">
                Bugun 4 ta LOR shifokorida bo&apos;sh vaqt mavjud. Birini tanlab, darhol navbat olishingiz mumkin.
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                Navbatim qachon?
              </div>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><User className="h-3.5 w-3.5" /></span>
            </div>
            <div className="flex gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"><Bot className="h-3.5 w-3.5" /></span>
              <div className="rounded-2xl rounded-tl-sm border border-border bg-background px-4 py-2.5 text-sm">
                Navbatingiz A-24. Oldingizda 0 kishi qoldi - tez orada chaqirilasiz.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
