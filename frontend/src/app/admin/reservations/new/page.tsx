'use client';

import { consultationReservations } from '@/lib/api';
import ReservationForm from '../components/ReservationForm';

export default function NewReservationPage() {
  return (
    <div className="container mx-auto py-6">
      <ReservationForm onSubmit={(data) => consultationReservations.create(data)} />
    </div>
  );
} 