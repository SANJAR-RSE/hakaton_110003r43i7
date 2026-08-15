import { ClinicDetailClient } from './ClinicDetailClient';

export default async function ClinicDetailPage({ params }) {
  const { id } = await params;
  return <ClinicDetailClient clinicId={id} />;
}
