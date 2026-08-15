import { Calendar, Send, Check, Building2, Clock3 } from 'lucide-react';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || 'https://web-sanjar2.vercel.app';
const BOT_URL = process.env.NEXT_PUBLIC_BOT_URL || 'https://t.me/hakatontest_bot';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[500px] bg-[radial-gradient(ellipse_at_top,var(--primary-soft),transparent_65%)]" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
            Toshkent uchun raqamli navbat platformasi
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Navbatda vaqt <span className="text-primary">yo&apos;qotmang</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted">
            Shifokorga oldindan navbat oling, navbatingizni real vaqtda kuzating,
            navbat yaqinlashganda Telegram orqali xabar oling va tibbiy tarixingizni
            bitta joyda saqlang.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`${WEB_URL}/register`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary-hover"
            >
              <Calendar className="h-[18px] w-[18px]" /> Navbat olish
            </a>
            <a
              href={BOT_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-3.5 font-medium transition-colors hover:bg-black/[0.03]"
            >
              <Send className="h-4 w-4" /> Telegram bot
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> 8+ klinika</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> 70+ shifokor</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> Bepul ro&apos;yxatdan o&apos;tish</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="rounded-3xl border border-border bg-surface p-1.5 shadow-2xl shadow-primary/10">
            <div className="overflow-hidden rounded-[20px] bg-surface">
              <div className="border-b border-border bg-primary-soft/60 px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted">Sizning navbatingiz</span>
                  <span className="rounded-full bg-warning-soft px-2 py-1 text-[11px] font-semibold text-warning">Yaqinlashmoqda</span>
                </div>
                <p className="mt-1 text-3xl font-bold text-primary">A-24</p>
              </div>
              <div className="space-y-3 px-5 py-4 text-sm">
                <div className="flex items-center gap-2 text-muted"><Building2 className="h-4 w-4" /> MedLine Clinic</div>
                <div className="flex items-center gap-2 text-muted"><Clock3 className="h-4 w-4" /> Bugun · 14:30</div>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {['A-21', 'A-22', 'A-23'].map((n) => (
                    <span key={n} className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-success/20 bg-success-soft px-2 text-xs font-semibold text-success">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  ))}
                  <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-primary px-2.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/30">
                    A-24
                  </span>
                  <span className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-border px-2 text-xs font-medium text-muted">A-25</span>
                </div>
                <p className="pt-1 text-xs text-muted">Oldingizda <b className="text-foreground">0</b> kishi qoldi</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-4 -top-4 flex items-center gap-1.5 rounded-2xl border border-border bg-surface px-3 py-2 text-xs font-medium shadow-lg">
            <Send className="h-3.5 w-3.5 text-primary" /> Telegram xabar keldi
          </div>
        </div>
      </div>
    </section>
  );
}
