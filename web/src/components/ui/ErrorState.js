import { AlertCircle, RotateCw } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({ message = "Ma'lumotlarni yuklab bo'lmadi.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-error/20 bg-error-soft px-6 py-12 text-center">
      <AlertCircle className="h-8 w-8 text-error" />
      <p className="text-sm font-medium text-error">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw className="h-4 w-4" />
          Qayta urinish
        </Button>
      )}
    </div>
  );
}
