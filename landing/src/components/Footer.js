import { Stethoscope } from 'lucide-react';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || 'https://web-sanjar2.vercel.app';
const BOT_URL = process.env.NEXT_PUBLIC_BOT_URL || 'https://t.me/hakatontest_bot';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <a href="#" className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Stethoscope className="h-4 w-4" />
            </span>
            MedQueue Tashkent
          </a>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted">
            <a href={`${WEB_URL}/register`} className="hover:text-foreground">Navbat olish</a>
            <a href={`${WEB_URL}/login`} className="hover:text-foreground">Kirish</a>
            <a href={BOT_URL} target="_blank" rel="noreferrer" className="hover:text-foreground">Telegram bot</a>
          </nav>
        </div>
        <p className="mt-8 text-center text-xs text-muted">
          © {new Date().getFullYear()} MedQueue Tashkent. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </footer>
  );
}
