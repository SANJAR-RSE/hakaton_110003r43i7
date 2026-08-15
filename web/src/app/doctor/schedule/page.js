'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { CalendarClock, Plus, Trash2, Lock } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LoadingState, Skeleton } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { schedulesApi, apiErrorMessage } from '@/lib/api';
import { useRequireAuth } from '@/lib/useRequireAuth';

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Sanani tanlang'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Vaqtni kiriting'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Vaqtni kiriting'),
});

export default function DoctorSchedulePage() {
  const { ready } = useRequireAuth('doctor');
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: schedules, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-schedules'],
    queryFn: () => schedulesApi.mine(),
    enabled: ready,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const createMutation = useMutation({
    mutationFn: schedulesApi.create,
    onSuccess: () => {
      toast.success("Yangi vaqt qo'shildi");
      reset();
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['my-schedules'] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const removeMutation = useMutation({
    mutationFn: schedulesApi.remove,
    onSuccess: () => {
      toast.success("Vaqt o'chirildi");
      queryClient.invalidateQueries({ queryKey: ['my-schedules'] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  if (!ready) return null;

  const grouped = (schedules || []).reduce((acc, s) => {
    (acc[s.date] ||= []).push(s);
    return acc;
  }, {});

  return (
    <AppShell title="Ish jadvali">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Ish jadvalim</h2>
            <p className="text-sm text-muted">Bemorlar band qilishi uchun bo&apos;sh vaqt qo&apos;shing.</p>
          </div>
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" /> Vaqt qo&apos;shish
          </Button>
        </div>

        {showForm && (
          <Card className="p-5">
            <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input id="date" type="date" label="Sana" error={errors.date?.message} {...register('date')} />
              <Input id="startTime" type="time" label="Boshlanish" error={errors.startTime?.message} {...register('startTime')} />
              <Input id="endTime" type="time" label="Tugash" error={errors.endTime?.message} {...register('endTime')} />
              <Button type="submit" className="sm:col-span-3" loading={isSubmitting}>
                Qo&apos;shish
              </Button>
            </form>
          </Card>
        )}

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
          </div>
        )}
        {isError && <ErrorState onRetry={refetch} />}
        {!isLoading && !isError && !schedules?.length && (
          <EmptyState icon={CalendarClock} title="Hali vaqt qo'shilmagan" description="Yuqoridagi tugma orqali bo'sh vaqt qo'shing." />
        )}

        {!isLoading && !isError && Object.entries(grouped).map(([date, slots]) => (
          <div key={date}>
            <p className="mb-2 text-sm font-medium text-muted">{date}</p>
            <div className="flex flex-wrap gap-2">
              {slots.map((s) => (
                <div key={s._id} className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-sm">
                  {s.startTime}-{s.endTime}
                  {s.isBooked ? (
                    <Badge tone="info"><Lock className="h-3 w-3" /> band</Badge>
                  ) : (
                    <button onClick={() => removeMutation.mutate(s._id)} aria-label="O'chirish" className="text-muted hover:text-error">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
