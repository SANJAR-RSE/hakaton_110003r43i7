'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Stethoscope } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { DoctorCard } from '@/components/DoctorCard';
import { LoadingState, Skeleton } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { clinicsApi, departmentsApi, doctorsApi } from '@/lib/api';
import { useRequireAuth } from '@/lib/useRequireAuth';

export default function DoctorsPage() {
  const { ready } = useRequireAuth();
  const [clinicId, setClinicId] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const { data: clinics } = useQuery({ queryKey: ['clinics'], queryFn: clinicsApi.list, enabled: ready });
  const { data: departments } = useQuery({
    queryKey: ['departments', clinicId],
    queryFn: () => departmentsApi.list(clinicId || undefined),
    enabled: ready,
  });
  const { data: doctors, isLoading, isError, refetch } = useQuery({
    queryKey: ['doctors', clinicId, departmentId],
    queryFn: () => doctorsApi.list({ clinicId: clinicId || undefined, departmentId: departmentId || undefined }),
    enabled: ready,
  });

  if (!ready) return null;

  const selectClass = 'h-11 rounded-xl border border-border bg-surface px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <AppShell title="Shifokorlar">
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="flex flex-wrap gap-3">
          <select className={selectClass} value={clinicId} onChange={(e) => { setClinicId(e.target.value); setDepartmentId(''); }}>
            <option value="">Barcha klinikalar</option>
            {clinics?.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <select className={selectClass} value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">Barcha bo&apos;limlar</option>
            {departments?.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
          </div>
        )}
        {isError && <ErrorState onRetry={refetch} />}
        {!isLoading && !isError && !doctors?.length && (
          <EmptyState icon={Stethoscope} title="Shifokor topilmadi" description="Filtrlarni o'zgartirib ko'ring." />
        )}
        {!isLoading && !isError && Boolean(doctors?.length) && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doc) => (
              <DoctorCard key={doc._id} doctor={doc} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
