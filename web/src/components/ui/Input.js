import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export const Input = forwardRef(function Input({ label, error, className, id, ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={cn(
          'h-11 w-full rounded-xl border bg-surface px-3.5 text-sm outline-none transition-colors',
          'placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20',
          error ? 'border-error' : 'border-border',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
});
