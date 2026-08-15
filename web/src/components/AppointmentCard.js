import Link from 'next/link';
import { Building2, Clock3, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/StatusBadge';

export function AppointmentCard({ appointment }) {
  return (
    <Link href={`/appointments/${appointment._id}`}>
      <Card className="flex flex-col gap-3 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">{appointment.queueNumber}</span>
          <StatusBadge status={appointment.status} />
        </div>
        <div className="space-y-1.5 text-sm text-muted">
          <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {appointment.department?.name} - Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}</p>
          <p className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" /> {appointment.clinic?.name}</p>
          <p className="flex items-center gap-2"><Clock3 className="h-3.5 w-3.5" /> {appointment.date} · {appointment.time}</p>
        </div>
      </Card>
    </Link>
  );
}
