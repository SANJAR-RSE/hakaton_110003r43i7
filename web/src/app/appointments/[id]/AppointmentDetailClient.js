'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Building2, Clock3, MapPin, XCircle } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { StatusBadge } from '@/components/StatusBadge';
import { QueueVisual, buildPatientQueueItems } from '@/components/QueueVisual';
import { appointmentsApi, apiErrorMessage } from '@/lib/api';
import { useRequireAuth } from '@/lib/useRequireAuth';

const CANCELLABLE = ['PENDING', 'CONFIRMED', 'WAITING', 'NEAR'];

export function AppointmentDetailClient({ appointmentId }) {
  const { ready } = useRequireAuth('patient');
  const queryClient = useQueryClient();
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const { data: appointment, isLoading, isError, refetch } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => appointmentsApi.get(appointmentId),
    enabled: ready,
    refetchInterval: 10000,
  });

  const cancelMutation = useMutation({
    mutationFn: () => appointmentsApi.cancel(appointmentId),
    onSuccess: () => {
      toast.success('Navbat bekor qilindi');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', appointmentId] });
      setConfirmingCancel(false);
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err));
      setConfirmingCancel(false);
    },
  });

  if (!ready) return null;

  return (
    <AppShell title="Navbat tafsilotlari">
      <div className="mx-auto max-w-2xl space-y-6">
        {isLoading && <LoadingState label="Yuklanmoqda..." />}
        {isError && <ErrorState onRetry={refetch} />}

        {appointment && (
          <>
            <Card className="overflow-hidden">
              <div className="border-b border-border bg-primary-soft/50 px-6 py-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted">Navbat raqami</span>
                  <StatusBadge status={appointment.status} />
                </div>
                <p className="mt-1 text-4xl font-bold text-primary">{appointment.queueNumber}</p>
              </div>
              <div className="space-y-4 px-6 py-5">
                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <span className="flex items-center gap-2 text-muted"><Building2 className="h-4 w-4" /> {appointment.clinic?.name}</span>
                  <span className="flex items-center gap-2 text-muted"><Clock3 className="h-4 w-4" /> {appointment.date} · {appointment.time}</span>
                  <span className="col-span-full flex items-center gap-2 text-muted">
                    <MapPin className="h-4 w-4" /> {appointment.department?.name} - Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                  </span>
                </div>

                {!['COMPLETED', 'CANCELLED'].includes(appointment.status) && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Navbat holati</p>
                    <div className="overflow-x-auto pb-1">
                      <QueueVisual items={buildPatientQueueItems(appointment.queueNumber, appointment.queuePosition, appointment.status)} />
                    </div>
                    {appointment.queuePosition != null && (
                      <p className="mt-2 text-sm text-muted">Oldingizda <b className="text-foreground">{appointment.queuePosition}</b> kishi qoldi.</p>
                    )}
                  </div>
                )}

                {appointment.status === 'CANCELLED' && appointment.cancelReason && (
                  <p className="rounded-xl bg-error-soft px-3 py-2 text-sm text-error">Bekor qilindi: {appointment.cancelReason}</p>
                )}
              </div>
            </Card>

            {CANCELLABLE.includes(appointment.status) && (
              <Card className="p-5">
                {!confirmingCancel ? (
                  <Button variant="danger" className="w-full" onClick={() => setConfirmingCancel(true)}>
                    <XCircle className="h-4 w-4" /> Navbatni bekor qilish
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm">Rostdan ham bu navbatni bekor qilmoqchimisiz?</p>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setConfirmingCancel(false)}>
                        Yo&apos;q
                      </Button>
                      <Button variant="danger" className="flex-1" loading={cancelMutation.isPending} onClick={() => cancelMutation.mutate()}>
                        Ha, bekor qilish
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
