'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi, apiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const schema = z.object({
  phone: z.string().min(7, "Telefon raqamni to'liq kiriting"),
  password: z.string().min(1, 'Parolni kiriting'),
});

export default function LoginPage() {
  const router = useRouter();
  const { token, hasHydrated, setAuth } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (hasHydrated && token) router.replace('/dashboard');
  }, [hasHydrated, token, router]);

  async function onSubmit(values) {
    try {
      const { token: jwt, user } = await authApi.login(values);
      setAuth(jwt, user);
      toast.success('Xush kelibsiz!');
      router.replace(user.role === 'doctor' ? '/doctor' : '/dashboard');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Stethoscope className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold">MedQueue Tashkent</h1>
          <p className="text-sm text-muted">Hisobingizga kiring</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <Input
            id="phone"
            label="Telefon raqam"
            placeholder="+998 90 123 45 67"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            id="password"
            type="password"
            label="Parol"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Kirish
          </Button>
          <p className="text-center text-sm text-muted">
            Hisobingiz yo&apos;qmi?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Ro&apos;yxatdan o&apos;tish
            </Link>
          </p>
        </form>

        <div className="mt-4 rounded-xl border border-dashed border-border bg-surface/60 p-4 text-xs text-muted">
          <p className="font-medium text-foreground">Demo hisoblar:</p>
          <p>Bemor: +998901234567 / patient123</p>
          <p>Shifokor: +998907654321 / doctor123</p>
        </div>
      </div>
    </div>
  );
}
