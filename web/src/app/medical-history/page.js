'use client';

import { useQuery } from '@tanstack/react-query';
import { FileText, FlaskConical, Stethoscope } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Card } from '@/components/ui/Card';
import { LoadingState, Skeleton } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { medicalRecordsApi } from '@/lib/api';
import { useRequireAuth } from '@/lib/useRequireAuth';

export default function MedicalHistoryPage() {
  const { ready } = useRequireAuth('patient');
  const { data: records, isLoading, isError, refetch } = useQuery({
    queryKey: ['medical-records', 'me'],
    queryFn: medicalRecordsApi.mine,
    enabled: ready,
  });

  if (!ready) return null;

  return (
    <AppShell title="Tibbiy tarix">
      <div className="mx-auto max-w-2xl space-y-5">
        <div>
          <h2 className="text-xl font-semibold">Tibbiy tarixingiz</h2>
          <p className="text-sm text-muted">Barcha o&apos;tgan ko&apos;riklar va tahlil natijalari bitta joyda.</p>
        </div>

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        )}
        {isError && <ErrorState onRetry={refetch} />}
        {!isLoading && !isError && !records?.length && (
          <EmptyState icon={FileText} title="Tibbiy tarix hali mavjud emas" description="Birinchi ko'rikdan so'ng bu yerda ko'rinadi." actionLabel="Navbat olish" actionHref="/clinics" />
        )}

        {!isLoading && !isError && Boolean(records?.length) && (
          <ol className="relative space-y-6 border-l border-border pl-6">
            {records.map((record) => (
              <li key={record._id} className="relative">
                <span className="absolute -left-[29px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-primary bg-surface" />
                <Card className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-muted">{record.date}</p>
                    <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary">{record.department?.name}</span>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium">
                    <Stethoscope className="h-4 w-4 text-muted" /> Dr. {record.doctor?.firstName} {record.doctor?.lastName} · {record.clinic?.name}
                  </p>
                  <div className="mt-3 space-y-2 text-sm">
                    <p><span className="font-medium">Ko&apos;rik:</span> {record.examination}</p>
                    {record.recommendation && <p><span className="font-medium">Tavsiya:</span> {record.recommendation}</p>}
                  </div>
                  {Boolean(record.labResults?.length) && (
                    <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                        <FlaskConical className="h-3.5 w-3.5" /> Tahlil natijalari
                      </p>
                      {record.labResults.map((lab, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-muted">{lab.name}</span>
                          <span className="font-medium">{lab.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </li>
            ))}
          </ol>
        )}
      </div>
    </AppShell>
  );
}
