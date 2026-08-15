'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  CalendarClock,
  Building2,
  Stethoscope,
  FileText,
  Bell,
  User,
  Sparkles,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { notificationsApi } from '@/lib/api';
import { cn } from '@/lib/cn';

const PATIENT_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/appointments', label: 'Navbatlarim', icon: CalendarClock },
  { href: '/clinics', label: 'Klinikalar', icon: Building2 },
  { href: '/doctors', label: 'Shifokorlar', icon: Stethoscope },
  { href: '/medical-history', label: 'Tibbiy tarix', icon: FileText },
  { href: '/ai', label: 'AI yordamchi', icon: Sparkles },
  { href: '/notifications', label: 'Bildirishnomalar', icon: Bell },
  { href: '/profile', label: 'Profil', icon: User },
];

const DOCTOR_NAV = [
  { href: '/doctor', label: 'Navbat', icon: LayoutDashboard },
  { href: '/doctor/schedule', label: 'Jadval', icon: CalendarClock },
  { href: '/profile', label: 'Profil', icon: User },
];

const MOBILE_NAV = [
  { href: '/dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
  { href: '/appointments', label: 'Navbat', icon: CalendarClock },
  { href: '/ai', label: 'AI', icon: Sparkles },
  { href: '/medical-history', label: 'Tarix', icon: FileText },
  { href: '/profile', label: 'Profil', icon: User },
];

export function AppShell({ children, title }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDoctor = user?.role === 'doctor';
  const nav = isDoctor ? DOCTOR_NAV : PATIENT_NAV;

  const { data: notifData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsApi.mine,
    enabled: !isDoctor,
    refetchInterval: 20000,
  });

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="flex h-16 items-center gap-2 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">M</div>
          <span className="font-semibold">MedQueue</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/doctor' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  active ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-black/[0.03] hover:text-foreground'
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.label}
                {item.href === '/notifications' && notifData?.unreadCount > 0 && (
                  <span className="ml-auto rounded-full bg-error px-1.5 text-xs font-semibold text-white">
                    {notifData.unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-error-soft hover:text-error"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Chiqish
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">M</div>
          <span className="font-semibold text-sm">MedQueue</span>
        </div>
        <button onClick={() => setMobileOpen(true)} aria-label="Menyu" className="p-2">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-surface p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold">Menyu</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Yopish" className="p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-black/[0.03]"
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-error hover:bg-error-soft"
              >
                <LogOut className="h-[18px] w-[18px]" />
                Chiqish
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col pb-20 pt-14 md:pb-0 md:pt-0">
        {title && (
          <header className="hidden h-16 shrink-0 items-center border-b border-border bg-surface px-6 md:flex">
            <h1 className="text-lg font-semibold">{title}</h1>
          </header>
        )}
        <main className="flex-1 px-4 py-5 md:px-8 md:py-8">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      {!isDoctor && (
        <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border bg-surface md:hidden">
          {MOBILE_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn('flex flex-col items-center gap-0.5 text-[11px] font-medium', active ? 'text-primary' : 'text-muted')}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
