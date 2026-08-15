import Link from 'next/link';
import { Button } from './Button';
import { cn } from '@/lib/cn';

const linkButtonClass =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors';

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-14 text-center">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <div>
        <p className="font-medium text-foreground">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      </div>
      {actionLabel && actionHref && (
        <Link href={actionHref} className={cn('mt-1', linkButtonClass)}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <Button size="sm" className="mt-1" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
