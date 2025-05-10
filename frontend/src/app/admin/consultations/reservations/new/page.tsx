'use client';

import { consultationReservations } from '@/lib/api';
import ReservationForm from '../components/ReservationForm';

export default function NewReservationPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">افزودن رزرواسیون جدید</h1>
      <ReservationForm onSubmit={(data) => consultationReservations.create(data)} />
    </div>
  );
} 