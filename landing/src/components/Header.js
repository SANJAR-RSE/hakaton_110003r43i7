'use client';

import { Stethoscope, Menu, X } from 'lucide-react';
import { useState } from 'react';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || 'https://web-sanjar2.vercel.app';

const LINKS = [
  { href: '#muammo', label: 'Muammo' },
  { href: '#qanday-ishlaydi', label: 'Qanday ishlaydi' },
  { href: '#ai', label: 'AI yordamchi' },
  { href: '#bot', label: 'Telegram bot' },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Stethoscope className="h-[18px] w-[18px]" />
          </span>
          MedQueue
        </a>

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a href={`${WEB_URL}/login`} className="text-sm font-medium text-muted hover:text-foreground">
            Kirish
          </a>
          <a
            href={`${WEB_URL}/register`}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Navbat olish
          </a>
        </div>

        <button onClick={() => setOpen((v) => !v)} className="p-2 md:hidden" aria-label="Menyu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-surface px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm font-medium">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
                {l.label}
              </a>
            ))}
            <a href={`${WEB_URL}/login`} className="text-muted hover:text-foreground">Kirish</a>
            <a href={`${WEB_URL}/register`} className="rounded-xl bg-primary px-4 py-2.5 text-center font-medium text-primary-foreground">
              Navbat olish
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
