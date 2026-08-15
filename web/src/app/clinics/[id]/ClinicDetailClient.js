'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Phone, Clock, Star, Stethoscope } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Card } from '@/components/ui/Card';
import { DoctorCard } from '@/components/DoctorCard';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';
import { clinicsApi, doctorsApi } from '@/lib/api';
import { useRequireAuth } from '@/lib/useRequireAuth';

export function ClinicDetailClient({ clinicId }) {
  const { ready } = useRequireAuth();
  const [departmentId, setDepartmentId] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['clinic', clinicId],
    queryFn: () => clinicsApi.get(clinicId),
    enabled: ready,
  });

  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ['doctors', clinicId, departmentId],
    queryFn: () => doctorsApi.list({ clinicId, departmentId: departmentId || undefined }),
    enabled: ready && Boolean(data),
  });

  if (!ready) return null;

  return (
    <AppShell title="Klinika">
      <div className="mx-auto max-w-5xl space-y-6">
        {isLoading && <LoadingState label="Klinika ma'lumotlari yuklanmoqda..." />}
        {isError && <ErrorState onRetry={refetch} />}

        {data && (
          <>
            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{data.clinic.name}</h2>
                  <p className="mt-1 text-sm text-muted">{data.clinic.description}</p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-warning-soft px-3 py-1.5 text-sm font-semibold text-warning">
                  <Star className="h-4 w-4 fill-current" /> {data.clinic.rating}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 border-t border-border pt-4 text-sm text-muted sm:grid-cols-3">
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {data.clinic.address}</span>
                <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> {data.clinic.phone}</span>
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {data.clinic.workingHours}</span>
              </div>
            </Card>

            <div>
              <h3 className="mb-3 font-medium">Bo&apos;limlar</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setDepartmentId(null)}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                    !departmentId ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-surface hover:bg-black/[0.03]'
                  )}
                >
                  Barchasi
                </button>
                {data.departments.map((d) => (
                  <button
                    key={d._id}
                    onClick={() => setDepartmentId(d._id)}
                    className={cn(
                      'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                      departmentId === d._id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-surface hover:bg-black/[0.03]'
                    )}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-medium">Shifokorlar</h3>
              {doctorsLoading && <LoadingState label="Shifokorlar yuklanmoqda..." />}
              {!doctorsLoading && !doctors?.length && (
                <EmptyState icon={Stethoscope} title="Shifokor topilmadi" description="Boshqa bo'limni tanlab ko'ring." />
              )}
              {!doctorsLoading && Boolean(doctors?.length) && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {doctors.map((doc) => (
                    <DoctorCard key={doc._id} doctor={doc} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
