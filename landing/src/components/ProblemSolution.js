import { Hourglass, HelpCircle, EyeOff, FolderX, CheckCircle2 } from 'lucide-react';

const PROBLEMS = [
  { icon: Hourglass, text: 'Bemorlar jonli navbatda soatlab kutadi' },
  { icon: HelpCircle, text: 'Navbati qachon kelishini bilmaydi' },
  { icon: EyeOff, text: "Klinikaga borishdan oldin bo'sh vaqtlarni ko'ra olmaydi" },
  { icon: FolderX, text: 'Tibbiy tarix va tahlil natijalari tarqoq holda saqlanadi' },
];

const SOLUTIONS = [
  'Klinika, bo\'lim va shifokorni tanlab onlayn navbat olish',
  'Navbat holatini real vaqtda kuzatish',
  'Navbat yaqinlashganda Telegram orqali xabar olish',
  'Tibbiy tarixni bitta joydan ko\'rish',
];

export function ProblemSolution() {
  return (
    <section id="muammo" className="mx-auto max-w-6xl px-5 py-20">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-surface p-8">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Muammo</span>
          <h2 className="mt-2 text-2xl font-semibold">Navbat — vaqtingizni yeydi</h2>
          <ul className="mt-6 space-y-4">
            {PROBLEMS.map((p) => (
              <li key={p.text} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-error-soft text-error">
                  <p.icon className="h-[18px] w-[18px]" />
                </span>
                <span className="pt-1.5 text-sm text-muted">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-primary/20 bg-primary-soft/40 p-8">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">Yechim</span>
          <h2 className="mt-2 text-2xl font-semibold">MedQueue bilan hammasi oson</h2>
          <ul className="mt-6 space-y-4">
            {SOLUTIONS.map((s) => (
              <li key={s} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <CheckCircle2 className="h-[18px] w-[18px]" />
                </span>
                <span className="pt-1.5 text-sm font-medium">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
