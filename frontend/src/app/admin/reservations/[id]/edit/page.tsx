'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { consultationReservations } from '@/lib/api';
import ReservationForm from '../../components/ReservationForm';
import { useAlert } from '@/contexts/AlertContext';

interface Reservation {
  id: number;
  consultation_id: number;
  user_id: number;
  user_name: string;
  user_phone: string;
  reservation_date: string;
  reservation_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export default function EditReservationPage() {
  const params = useParams();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchReservation();
  }, []);

  const fetchReservation = async () => {
    try {
      const response = await consultationReservations.get(params.id as string);
      setReservation(response.data);
    } catch {
      showAlert('خطا در دریافت اطلاعات رزرو', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      await consultationReservations.update(params.id as string, data);
      showAlert('رزرو با موفقیت بروزرسانی شد', 'success');
    } catch {
      showAlert('خطا در بروزرسانی رزرو', 'danger');
    }
  };

  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  if (!reservation) {
    return <div>رزرواسیون مورد نظر یافت نشد</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">ویرایش رزرواسیون</h1>
      <ReservationForm
        reservation={reservation}
        onSubmit={handleSubmit}
      />
    </div>
  );
} 