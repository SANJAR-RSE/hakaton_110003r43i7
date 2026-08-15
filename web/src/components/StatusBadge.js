import { CheckCircle2, Clock, Bell, PhoneCall, XCircle, Hourglass } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

// Status is always shown as icon + text + color together (never color alone) -
// keeps it accessible for colorblind users and clearer at a glance.
const STATUS_CONFIG = {
  PENDING: { label: 'Kutilmoqda', tone: 'neutral', icon: Hourglass },
  CONFIRMED: { label: 'Tasdiqlangan', tone: 'info', icon: CheckCircle2 },
  WAITING: { label: 'Navbatda', tone: 'info', icon: Clock },
  NEAR: { label: 'Yaqinlashmoqda', tone: 'warning', icon: Bell },
  CALLED: { label: 'Chaqirildi', tone: 'warning', icon: PhoneCall },
  COMPLETED: { label: 'Yakunlandi', tone: 'success', icon: CheckCircle2 },
  CANCELLED: { label: 'Bekor qilindi', tone: 'error', icon: XCircle },
};

export function StatusBadge({ status, className }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;
  return (
    <Badge tone={config.tone} className={className}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}
