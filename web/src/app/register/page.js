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
  fullName: z.string().min(2, 'Ism familiyangizni kiriting'),
  phone: z.string().min(7, "Telefon raqamni to'liq kiriting"),
  password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak"),
});

export default function RegisterPage() {
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
      const { token: jwt, user } = await authApi.register(values);
      setAuth(jwt, user);
      toast.success("Ro'yxatdan muvaffaqiyatli o'tdingiz!");
      router.replace('/dashboard');
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
          <h1 className="text-xl font-semibold">Ro&apos;yxatdan o&apos;tish</h1>
          <p className="text-sm text-muted">Bir necha soniyada hisob oching</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <Input id="fullName" label="Ism familiya" placeholder="Sanjar Rasulberdiyev" error={errors.fullName?.message} {...register('fullName')} />
          <Input id="phone" label="Telefon raqam" placeholder="+998 90 123 45 67" error={errors.phone?.message} {...register('phone')} />
          <Input id="password" type="password" label="Parol" placeholder="Kamida 6 belgi" error={errors.password?.message} {...register('password')} />
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Ro&apos;yxatdan o&apos;tish
          </Button>
          <p className="text-center text-sm text-muted">
            Hisobingiz bormi?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Kirish
            </Link>
          </p>
        </form>

        <p className="mt-4 text-center text-xs text-muted">
          Shu telefon raqam bilan Telegram botni ham ulasangiz, navbatlaringiz ikkalasida ham bir xil ko&apos;rinadi.
        </p>
      </div>
    </div>
  );
}
