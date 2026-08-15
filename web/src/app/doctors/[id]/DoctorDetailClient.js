'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Star, Briefcase, Building2, MapPin, CalendarDays, Clock3 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';
import { doctorsApi, appointmentsApi, apiErrorMessage } from '@/lib/api';
import { useRequireAuth } from '@/lib/useRequireAuth';

const DAY_LABELS = ['Bugun', 'Ertaga', 'Indinga'];

function nextDays(count) {
  return Array.from({ length: count }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export function DoctorDetailClient({ doctorId }) {
  const { ready } = useRequireAuth('patient');
  const router = useRouter();
  const queryClient = useQueryClient();
  const days = useMemo(() => nextDays(5), []);
  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const { data: doctor, isLoading, isError, refetch } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: () => doctorsApi.get(doctorId),
    enabled: ready,
  });

  const { data: schedules, isLoading: schedulesLoading } = useQuery({
    queryKey: ['schedules', doctorId, selectedDate],
    queryFn: () => doctorsApi.schedules(doctorId, selectedDate),
    enabled: ready,
  });

  const bookMutation = useMutation({
    mutationFn: () => appointmentsApi.create(selectedSlot._id),
    onSuccess: (appointment) => {
      toast.success('Navbat muvaffaqiyatli olindi ✓');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      router.push(`/appointments/${appointment._id}`);
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  if (!ready) return null;

  const freeSlots = (schedules || []).filter((s) => !s.isBooked);

  return (
    <AppShell title="Shifokor">
      <div className="mx-auto max-w-3xl space-y-6">
        {isLoading && <LoadingState label="Shifokor ma'lumotlari yuklanmoqda..." />}
        {isError && <ErrorState onRetry={refetch} />}

        {doctor && (
          <>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-xl font-semibold text-primary">
                  {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Dr. {doctor.firstName} {doctor.lastName}</h2>
                  <p className="text-sm text-muted">{doctor.specialty}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="warning"><Star className="h-3.5 w-3.5 fill-current" /> {doctor.rating}</Badge>
                <Badge tone="neutral"><Briefcase className="h-3.5 w-3.5" /> {doctor.experienceYears} yil tajriba</Badge>
              </div>
              {doctor.bio && <p className="mt-3 text-sm text-muted">{doctor.bio}</p>}
              <div className="mt-4 grid grid-cols-1 gap-2 border-t border-border pt-4 text-sm text-muted sm:grid-cols-2">
                <span className="flex items-center gap-2"><Building2 className="h-4 w-4" /> {doctor.clinic?.name}</span>
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {doctor.clinic?.address}</span>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-3 flex items-center gap-2 font-medium"><CalendarDays className="h-4 w-4" /> Kunni tanlang</h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {days.map((date, i) => (
                  <button
                    key={date}
                    onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                    className={cn(
                      'shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-colors',
                      selectedDate === date ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-surface hover:bg-black/[0.03]'
                    )}
                  >
                    {DAY_LABELS[i] || date} {i >= DAY_LABELS.length && `(${date.slice(5)})`}
                  </button>
                ))}
              </div>

              <h3 className="mb-3 mt-6 flex items-center gap-2 font-medium"><Clock3 className="h-4 w-4" /> Bo&apos;sh vaqtni tanlang</h3>
              {schedulesLoading && <LoadingState label="Vaqtlar yuklanmoqda..." />}
              {!schedulesLoading && !freeSlots.length && (
                <EmptyState icon={Clock3} title="Bu kunga bo'sh vaqt yo'q" description="Boshqa kunni tanlab ko'ring." />
              )}
              {!schedulesLoading && Boolean(freeSlots.length) && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {freeSlots.map((slot) => (
                    <button
                      key={slot._id}
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        'rounded-xl border py-2.5 text-sm font-medium transition-colors',
                        selectedSlot?._id === slot._id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-surface hover:bg-black/[0.03]'
                      )}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {selectedSlot && (
              <div className="sticky bottom-4 z-30">
                <Card className="flex flex-wrap items-center justify-between gap-3 border-primary/30 bg-surface p-4 shadow-lg">
                  <div className="text-sm">
                    <p className="font-medium">{selectedDate} · {selectedSlot.startTime}</p>
                    <p className="text-muted">Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialty}</p>
                  </div>
                  <Button onClick={() => bookMutation.mutate()} loading={bookMutation.isPending}>
                    Navbatni tasdiqlash
                  </Button>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
