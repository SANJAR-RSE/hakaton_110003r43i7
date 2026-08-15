'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { PhoneCall, CheckCircle2, Plus, Trash2, Users } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { LoadingState, Skeleton } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { appointmentsApi, medicalRecordsApi, apiErrorMessage } from '@/lib/api';
import { useRequireAuth } from '@/lib/useRequireAuth';

const recordSchema = z.object({
  examination: z.string().min(3, "Ko'rik xulosasini kiriting"),
  recommendation: z.string().optional(),
  labResults: z.array(z.object({ name: z.string().min(1), value: z.string().min(1) })).optional(),
});

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function DoctorQueuePage() {
  const { ready } = useRequireAuth('doctor');
  const queryClient = useQueryClient();
  const [date] = useState(todayStr());
  const [completingAppointment, setCompletingAppointment] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['doctor-queue', date],
    queryFn: () => appointmentsApi.doctorQueue(date),
    enabled: ready,
    refetchInterval: 10000,
  });

  const callMutation = useMutation({
    mutationFn: (id) => appointmentsApi.setStatus(id, 'CALLED'),
    onSuccess: () => {
      toast.success('Bemor chaqirildi');
      queryClient.invalidateQueries({ queryKey: ['doctor-queue'] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  if (!ready) return null;
  const appointments = (data?.appointments || []).filter((a) => a.status !== 'CANCELLED');

  return (
    <AppShell title="Bugungi navbat">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Bugungi navbat</h2>
            <p className="text-sm text-muted">{date}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-sm font-medium text-primary">
            <Users className="h-4 w-4" /> {appointments.length} bemor
          </div>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        )}
        {isError && <ErrorState onRetry={refetch} />}
        {!isLoading && !isError && !appointments.length && (
          <EmptyState icon={Users} title="Bugun navbat yo'q" description="Bemorlar navbat olganda bu yerda ko'rinadi." />
        )}

        {!isLoading && !isError && appointments.map((a) => (
          <Card key={a._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">{a.queueNumber}</span>
                <StatusBadge status={a.status} />
              </div>
              <p className="mt-1 text-sm font-medium">{a.patient?.fullName}</p>
              <p className="text-xs text-muted">{a.patient?.phone} · {a.time}</p>
            </div>
            <div className="flex gap-2">
              {['CONFIRMED', 'WAITING', 'NEAR'].includes(a.status) && (
                <Button size="sm" variant="outline" loading={callMutation.isPending} onClick={() => callMutation.mutate(a._id)}>
                  <PhoneCall className="h-4 w-4" /> Chaqirish
                </Button>
              )}
              {a.status === 'CALLED' && (
                <Button size="sm" onClick={() => setCompletingAppointment(a)}>
                  <CheckCircle2 className="h-4 w-4" /> Ko&apos;rildi deb belgilash
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <CompleteVisitModal
        appointment={completingAppointment}
        onClose={() => setCompletingAppointment(null)}
        onDone={() => {
          setCompletingAppointment(null);
          queryClient.invalidateQueries({ queryKey: ['doctor-queue'] });
        }}
      />
    </AppShell>
  );
}

function CompleteVisitModal({ appointment, onClose, onDone }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(recordSchema),
    defaultValues: { examination: '', recommendation: '', labResults: [] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'labResults' });

  async function onSubmit(values) {
    try {
      await medicalRecordsApi.create({ appointmentId: appointment._id, ...values });
      toast.success("Ko'rik yakunlandi, tibbiy yozuv qo'shildi");
      reset();
      onDone();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <Modal open={Boolean(appointment)} onClose={onClose} title={appointment ? `${appointment.patient?.fullName} - ${appointment.queueNumber}` : ''}>
      {appointment && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Textarea id="examination" label="Ko'rik xulosasi" placeholder="Bemor holati, shikoyatlar, xulosa..." error={errors.examination?.message} {...register('examination')} />
          <Textarea id="recommendation" label="Tavsiya" placeholder="Davolash tavsiyasi..." rows={2} {...register('recommendation')} />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Tahlil natijalari (ixtiyoriy)</span>
              <button type="button" onClick={() => append({ name: '', value: '' })} className="flex items-center gap-1 text-xs font-medium text-primary">
                <Plus className="h-3.5 w-3.5" /> Qo&apos;shish
              </button>
            </div>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Input placeholder="Tahlil nomi" {...register(`labResults.${index}.name`)} />
                  <Input placeholder="Natija" {...register(`labResults.${index}.value`)} />
                  <button type="button" onClick={() => remove(index)} aria-label="O'chirish" className="p-2 text-muted hover:text-error">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Bekor qilish</Button>
            <Button type="submit" className="flex-1" loading={isSubmitting}>Yakunlash</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
