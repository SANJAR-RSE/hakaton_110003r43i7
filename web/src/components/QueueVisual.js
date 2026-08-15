import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

// Renders the "A-20 ✓ A-21 ✓ A-22 ✓ A-23 → Hozir A-24 → Siz A-25 A-26" style
// visual queue strip. `items` is an ordered array of
// { label, state: 'done' | 'current' | 'you' | 'upcoming' }.
export function QueueVisual({ items }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item, i) => (
        <div key={`${item.label}-${i}`} className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition-colors',
              item.state === 'done' && 'border-success/20 bg-success-soft text-success',
              item.state === 'current' && 'border-warning/30 bg-warning-soft text-warning',
              item.state === 'you' && 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-110',
              item.state === 'upcoming' && 'border-border bg-surface text-muted'
            )}
          >
            {item.state === 'done' ? <Check className="h-4 w-4" /> : item.label}
          </div>
          {item.caption && (
            <span
              className={cn(
                'text-xs font-medium',
                item.state === 'you' ? 'text-primary' : 'text-muted'
              )}
            >
              {item.caption}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// Builds a patient-facing queue strip from just their own queue number and
// how many people are ahead of them - we never expose other patients'
// identities, only an approximate position, which is enough to visualize.
export function buildPatientQueueItems(queueNumber, position, status) {
  const [prefix, numStr] = String(queueNumber).split('-');
  const num = Number(numStr);
  if (Number.isNaN(num)) return [{ label: queueNumber, state: 'you', caption: 'Siz' }];

  const items = [];
  const ahead = Math.max(0, Math.min(position ?? 0, 4));
  for (let i = ahead; i >= 1; i -= 1) {
    items.push({ label: `${prefix}-${num - i}`, state: 'done' });
  }

  if (status === 'CALLED') {
    items.push({ label: queueNumber, state: 'current', caption: 'Sizni chaqirishmoqda' });
  } else if (status === 'COMPLETED') {
    items.push({ label: queueNumber, state: 'done', caption: 'Yakunlandi' });
  } else {
    items.push({ label: queueNumber, state: 'you', caption: 'Siz' });
  }

  items.push({ label: `${prefix}-${num + 1}`, state: 'upcoming' });
  items.push({ label: `${prefix}-${num + 2}`, state: 'upcoming' });

  return items;
}
