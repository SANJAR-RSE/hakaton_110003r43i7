'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from './store';

// Guards a client page: waits for the persisted auth store to hydrate, then
// redirects to /login if there's no session, or to /dashboard if the role
// doesn't match (e.g. a patient opening a /doctor/* page).
export function useRequireAuth(role) {
  const router = useRouter();
  const { token, user, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token) {
      router.replace('/login');
      return;
    }
    if (role && user?.role !== role) {
      router.replace(user?.role === 'doctor' ? '/doctor' : '/dashboard');
    }
  }, [hasHydrated, token, user, role, router]);

  const ready = hasHydrated && Boolean(token) && (!role || user?.role === role);
  return { ready, user };
}
