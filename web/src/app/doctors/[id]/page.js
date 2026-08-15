import { DoctorDetailClient } from './DoctorDetailClient';

export default async function DoctorDetailPage({ params }) {
  const { id } = await params;
  return <DoctorDetailClient doctorId={id} />;
}
