import Link from 'next/link';
import { MapPin, Star, Building2, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function ClinicCard({ clinic }) {
  return (
    <Link href={`/clinics/${clinic._id}`}>
      <Card className="flex h-full flex-col gap-3 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-1 rounded-full bg-warning-soft px-2 py-1 text-xs font-semibold text-warning">
            <Star className="h-3.5 w-3.5 fill-current" /> {clinic.rating}
          </div>
        </div>
        <div>
          <h3 className="font-semibold">{clinic.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> {clinic.address}
          </p>
        </div>
        <p className="line-clamp-2 text-sm text-muted">{clinic.description}</p>
        <div className="mt-auto flex items-center gap-4 border-t border-border pt-3 text-xs text-muted">
          <span>{clinic.departmentsCount} bo&apos;lim</span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {clinic.doctorsCount} shifokor
          </span>
        </div>
      </Card>
    </Link>
  );
}
