'use client';

import { useQuery } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { ClinicCard } from '@/components/ClinicCard';
import { LoadingState, Skeleton } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { clinicsApi } from '@/lib/api';
import { useRequireAuth } from '@/lib/useRequireAuth';

export default function ClinicsPage() {
  const { ready } = useRequireAuth();
  const { data: clinics, isLoading, isError, refetch } = useQuery({
    queryKey: ['clinics'],
    queryFn: clinicsApi.list,
    enabled: ready,
  });

  if (!ready) return null;

  return (
    <AppShell title="Klinikalar">
      <div className="mx-auto max-w-5xl space-y-5">
        <div>
          <h2 className="text-xl font-semibold">Klinikani tanlang</h2>
          <p className="text-sm text-muted">Navbat olish uchun avval klinikani tanlang.</p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44" />
            ))}
          </div>
        )}
        {isError && <ErrorState onRetry={refetch} />}
        {!isLoading && !isError && !clinics?.length && (
          <EmptyState icon={Building2} title="Klinikalar topilmadi" />
        )}
        {!isLoading && !isError && Boolean(clinics?.length) && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clinics.map((clinic) => (
              <ClinicCard key={clinic._id} clinic={clinic} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
