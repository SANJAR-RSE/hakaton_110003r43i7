'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { LoadingState } from '@/components/ui/LoadingState';

export default function RootPage() {
  const router = useRouter();
  const { token, user, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token) router.replace('/login');
    else router.replace(user?.role === 'doctor' ? '/doctor' : '/dashboard');
  }, [hasHydrated, token, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingState label="Yuklanmoqda..." />
    </div>
  );
}
