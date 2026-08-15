'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Send, Phone, Shield } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { usersApi, apiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useRequireAuth } from '@/lib/useRequireAuth';

const schema = z.object({ fullName: z.string().min(2, 'Ism familiyani kiriting') });

export default function ProfilePage() {
  const { ready, user } = useRequireAuth();
  const { setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({ resolver: zodResolver(schema), values: { fullName: user?.fullName || '' } });

  const mutation = useMutation({
    mutationFn: usersApi.updateMe,
    onSuccess: (updated) => {
      setUser(updated);
      queryClient.invalidateQueries();
      toast.success('Profil yangilandi');
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  if (!ready) return null;

  return (
    <AppShell title="Profil">
      <div className="mx-auto max-w-lg space-y-5">
        <Card className="flex items-center gap-4 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-2xl font-semibold text-primary">
            {user?.fullName?.[0]}
          </div>
          <div>
            <p className="text-lg font-semibold">{user?.fullName}</p>
            <p className="text-sm text-muted">{user?.phone}</p>
            <Badge tone={user?.role === 'doctor' ? 'info' : 'success'} className="mt-1">
              {user?.role === 'doctor' ? 'Shifokor' : 'Bemor'}
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-medium">Shaxsiy ma&apos;lumotlar</h3>
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <Input id="fullName" label="Ism familiya" error={errors.fullName?.message} {...register('fullName')} />
            <Button type="submit" disabled={!isDirty} loading={mutation.isPending}>
              Saqlash
            </Button>
          </form>
        </Card>

        <Card className="space-y-3 p-6 text-sm">
          <p className="flex items-center gap-2 text-muted"><Phone className="h-4 w-4" /> Telefon: <span className="font-medium text-foreground">{user?.phone}</span></p>
          <p className="flex items-center gap-2 text-muted">
            <Send className="h-4 w-4" /> Telegram bot:{' '}
            <span className={`font-medium ${user?.telegramConnected ? 'text-success' : 'text-muted'}`}>
              {user?.telegramConnected ? 'Ulangan ✓' : 'Ulanmagan'}
            </span>
          </p>
          {!user?.telegramConnected && (
            <p className="rounded-xl bg-primary-soft px-3 py-2 text-xs text-primary">
              Botni oching va shu telefon raqamingiz bilan &quot;Raqamni yuborish&quot; tugmasini bosing - hisobingiz avtomatik ulanadi.
            </p>
          )}
          <p className="flex items-center gap-2 text-muted"><Shield className="h-4 w-4" /> Ma&apos;lumotlaringiz shifrlangan holda saqlanadi.</p>
        </Card>
      </div>
    </AppShell>
  );
}
