import { Calendar, Send } from 'lucide-react';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || 'https://web-sanjar2.vercel.app';
const BOT_URL = process.env.NEXT_PUBLIC_BOT_URL || 'https://t.me/hakatontest_bot';

export function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.15),transparent_60%)]" />
        <h2 className="text-3xl font-semibold sm:text-4xl">Navbatda kutishni hoziroq to&apos;xtating</h2>
        <p className="mx-auto mt-4 max-w-xl text-primary-foreground/85">
          Bir necha soniyada ro&apos;yxatdan o&apos;ting va birinchi navbatingizni oling.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={`${WEB_URL}/register`}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-medium text-primary hover:bg-white/90"
          >
            <Calendar className="h-4 w-4" /> Navbat olish
          </a>
          <a
            href={BOT_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 font-medium hover:bg-white/10"
          >
            <Send className="h-4 w-4" /> Telegram bot
          </a>
        </div>
      </div>
    </section>
  );
}
