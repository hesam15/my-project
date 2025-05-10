'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { consultationReservations } from '@/lib/api';
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

export default function ConsultationReservationsPage() {
  const params = useParams();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await consultationReservations.getByConsultation(params.id as string);
      setReservations(response.data);
    } catch {
      showAlert('خطا در دریافت لیست رزروها', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      await consultationReservations.update(id.toString(), { status });
      setReservations(reservations.map(reservation => 
        reservation.id === id ? { ...reservation, status } : reservation
      ));
      showAlert('وضعیت رزرو با موفقیت تغییر کرد', 'success');
    } catch {
      showAlert('خطا در تغییر وضعیت رزرو', 'danger');
    }
  };

  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">رزرواسیون‌های مشاوره</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                نام کاربر
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                شماره تماس
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                تاریخ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ساعت
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                وضعیت
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {reservation.user_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {reservation.user_phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(reservation.reservation_date).toLocaleDateString('fa-IR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {reservation.reservation_time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {reservation.status === 'pending' && 'در انتظار تایید'}
                  {reservation.status === 'confirmed' && 'تایید شده'}
                  {reservation.status === 'cancelled' && 'لغو شده'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {reservation.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                        className="text-green-600 hover:text-green-900"
                      >
                        تایید
                      </button>
                      <button
                        onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                        className="text-red-600 hover:text-red-900"
                      >
                        لغو
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 