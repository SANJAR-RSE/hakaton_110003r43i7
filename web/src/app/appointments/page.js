'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarClock } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { AppointmentCard } from '@/components/AppointmentCard';
import { LoadingState, Skeleton } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { appointmentsApi } from '@/lib/api';
import { useRequireAuth } from '@/lib/useRequireAuth';

export default function AppointmentsPage() {
  const { ready } = useRequireAuth('patient');
  const { data: appointments, isLoading, isError, refetch } = useQuery({
    queryKey: ['appointments', 'me'],
    queryFn: appointmentsApi.mine,
    enabled: ready,
    refetchInterval: 15000,
  });

  if (!ready) return null;

  const active = appointments?.filter((a) => !['COMPLETED', 'CANCELLED'].includes(a.status)) || [];
  const past = appointments?.filter((a) => ['COMPLETED', 'CANCELLED'].includes(a.status)) || [];

  return (
    <AppShell title="Navbatlarim">
      <div className="mx-auto max-w-3xl space-y-8">
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
          </div>
        )}
        {isError && <ErrorState onRetry={refetch} />}

        {!isLoading && !isError && (
          <>
            <section>
              <h2 className="mb-3 font-medium">Faol navbatlar</h2>
              {!active.length ? (
                <EmptyState icon={CalendarClock} title="Faol navbat yo'q" actionLabel="Navbat olish" actionHref="/clinics" />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {active.map((a) => <AppointmentCard key={a._id} appointment={a} />)}
                </div>
              )}
            </section>

            {Boolean(past.length) && (
              <section>
                <h2 className="mb-3 font-medium">Tarix</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {past.map((a) => <AppointmentCard key={a._id} appointment={a} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
