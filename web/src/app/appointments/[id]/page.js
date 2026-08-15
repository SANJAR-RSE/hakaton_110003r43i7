import { AppointmentDetailClient } from './AppointmentDetailClient';

export default async function AppointmentDetailPage({ params }) {
  const { id } = await params;
  return <AppointmentDetailClient appointmentId={id} />;
}
