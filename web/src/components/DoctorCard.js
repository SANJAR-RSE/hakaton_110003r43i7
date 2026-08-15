import Link from 'next/link';
import { Star, Briefcase, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function DoctorCard({ doctor }) {
  return (
    <Link href={`/doctors/${doctor._id}`}>
      <Card className="flex h-full flex-col gap-3 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-lg font-semibold text-primary">
            {doctor.firstName?.[0]}
            {doctor.lastName?.[0]}
          </div>
          <div>
            <h3 className="font-semibold">Dr. {doctor.firstName} {doctor.lastName}</h3>
            <p className="text-sm text-muted">{doctor.specialty}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="warning">
            <Star className="h-3.5 w-3.5 fill-current" /> {doctor.rating}
          </Badge>
          <Badge tone="neutral">
            <Briefcase className="h-3.5 w-3.5" /> {doctor.experienceYears} yil tajriba
          </Badge>
        </div>
        {doctor.clinic?.name && (
          <p className="mt-auto flex items-center gap-1.5 border-t border-border pt-3 text-sm text-muted">
            <Building2 className="h-3.5 w-3.5" /> {doctor.clinic.name}
          </p>
        )}
      </Card>
    </Link>
  );
}
