import { Loader2 } from 'lucide-react';

export function LoadingState({ label = 'Yuklanmoqda...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-muted">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={`animate-pulse rounded-xl bg-black/[0.06] ${className || ''}`} />;
}
