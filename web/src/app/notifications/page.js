'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState, Skeleton } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';
import { notificationsApi } from '@/lib/api';
import { useRequireAuth } from '@/lib/useRequireAuth';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'hozirgina';
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  return `${Math.floor(hours / 24)} kun oldin`;
}

export default function NotificationsPage() {
  const { ready } = useRequireAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsApi.mine,
    enabled: ready,
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markOneMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (!ready) return null;
  const notifications = data?.notifications || [];

  return (
    <AppShell title="Bildirishnomalar">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Bildirishnomalar</h2>
          {Boolean(data?.unreadCount) && (
            <Button variant="outline" size="sm" onClick={() => markAllMutation.mutate()} loading={markAllMutation.isPending}>
              <CheckCheck className="h-4 w-4" /> Barchasini o&apos;qilgan deb belgilash
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
          </div>
        )}
        {isError && <ErrorState onRetry={refetch} />}
        {!isLoading && !isError && !notifications.length && (
          <EmptyState icon={Bell} title="Bildirishnoma yo'q" description="Yangi bildirishnomalar shu yerda ko'rinadi." />
        )}

        {!isLoading && !isError && notifications.map((n) => (
          <Card
            key={n._id}
            onClick={() => !n.isRead && markOneMutation.mutate(n._id)}
            className={cn('flex cursor-pointer items-start gap-3 p-4', !n.isRead && 'border-primary/30 bg-primary-soft/30')}
          >
            <div className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', !n.isRead ? 'bg-primary' : 'bg-transparent')} />
            <div className="flex-1">
              <p className="text-sm font-medium">{n.title}</p>
              <p className="mt-0.5 text-sm text-muted">{n.message}</p>
              <p className="mt-1 text-xs text-muted">{timeAgo(n.createdAt)}</p>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
