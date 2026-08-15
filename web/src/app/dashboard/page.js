'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CalendarClock, Sparkles, Building2, FileText, MapPin, Clock3 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { StatusBadge } from '@/components/StatusBadge';
import { QueueVisual, buildPatientQueueItems } from '@/components/QueueVisual';
import { appointmentsApi } from '@/lib/api';
import { useRequireAuth } from '@/lib/useRequireAuth';

export default function DashboardPage() {
  const { ready, user } = useRequireAuth('patient');

  const { data: appointments, isLoading, isError, refetch } = useQuery({
    queryKey: ['appointments', 'me'],
    queryFn: appointmentsApi.mine,
    enabled: ready,
  });

  if (!ready) return null;

  const active = appointments?.find((a) => ['CONFIRMED', 'WAITING', 'NEAR', 'CALLED'].includes(a.status));

  return (
    <AppShell title="Dashboard">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Salom, {user?.fullName?.split(' ')[0]} 👋</h2>
          <p className="text-sm text-muted">Bugungi navbatingiz haqida ma&apos;lumot shu yerda.</p>
        </div>

        {isLoading && <LoadingState label="Navbat ma'lumotlari yuklanmoqda..." />}
        {isError && <ErrorState onRetry={refetch} />}

        {!isLoading && !isError && !active && (
          <EmptyState
            icon={CalendarClock}
            title="Hozircha navbatingiz yo'q"
            description="Klinikani tanlab yangi navbat olishingiz mumkin."
            actionLabel="Navbat olish"
            actionHref="/clinics"
          />
        )}

        {active && (
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-primary-soft/50 px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted">Sizning navbatingiz</span>
                <StatusBadge status={active.status} />
              </div>
              <p className="mt-1 text-3xl font-bold text-primary">{active.queueNumber}</p>
            </div>
            <div className="space-y-4 px-5 py-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted">
                  <Building2 className="h-4 w-4" /> {active.clinic?.name}
                </div>
                <div className="flex items-center gap-2 text-muted">
                  <Clock3 className="h-4 w-4" /> {active.date} · {active.time}
                </div>
                <div className="col-span-2 flex items-center gap-2 text-muted">
                  <MapPin className="h-4 w-4" /> {active.department?.name} - Dr. {active.doctor?.firstName} {active.doctor?.lastName}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Navbat holati</p>
                <div className="overflow-x-auto pb-1">
                  <QueueVisual items={buildPatientQueueItems(active.queueNumber, active.queuePosition, active.status)} />
                </div>
                {active.queuePosition != null && (
                  <p className="mt-2 text-sm text-muted">Oldingizda <b className="text-foreground">{active.queuePosition}</b> kishi qoldi.</p>
                )}
              </div>

              <div className="flex gap-2">
                <Link href={`/appointments/${active._id}`} className="flex-1">
                  <Button variant="outline" className="w-full">Batafsil</Button>
                </Link>
                <Link href="/ai" className="flex-1">
                  <Button className="w-full">
                    <Sparkles className="h-4 w-4" /> AI yordamchi
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <QuickAction href="/clinics" icon={Building2} label="Navbat olish" />
          <QuickAction href="/medical-history" icon={FileText} label="Tibbiy tarix" />
          <QuickAction href="/appointments" icon={CalendarClock} label="Navbatlarim" />
          <QuickAction href="/ai" icon={Sparkles} label="AI yordamchi" />
        </div>
      </div>
    </AppShell>
  );
}

function QuickAction({ href, icon: Icon, label }) {
  return (
    <Link href={href}>
      <Card className="flex flex-col items-center gap-2 px-3 py-5 text-center transition-colors hover:border-primary/40 hover:bg-primary-soft/40">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-medium">{label}</span>
      </Card>
    </Link>
  );
}
