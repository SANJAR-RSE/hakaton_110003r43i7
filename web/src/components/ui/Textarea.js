import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export const Textarea = forwardRef(function Textarea({ label, error, className, id, rows = 3, ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        className={cn(
          'w-full resize-none rounded-xl border bg-surface px-3.5 py-2.5 text-sm outline-none transition-colors',
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
