// ./src/app/admin/consultations/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAlert } from '@/contexts/AlertContext';
import { consultations, consultationReservations } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, User, Phone } from 'lucide-react';

interface Consultant {
  id: number;
  title: string;
  consultant: string;
  description: string;
  license: string;
  consultation_time: number;
  active_times: string;
  thursdays_open: number;
  created_at: string;
  updated_at: string;
}

interface Reservation {
  id: number;
  date: string;
  time: string;
  user_id: number;
  consultation_id: number;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    phone: string;
  };
  status: string;
  status_label: string;
}

export default function ConsultantPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params; // گرفتن id از مسیر داینامیک
  const [consultantData, setConsultantData] = useState<Consultant | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  // دریافت اطلاعات مشاور و رزروها
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        // دریافت اطلاعات مشاور
        const consultantResponse = await consultations.getOne(Number(id));
        setConsultantData(consultantResponse.data);

        // دریافت رزروهای مربوط به این مشاور
        const reservationsResponse = await consultationReservations.getAll();
        const consultantReservations = reservationsResponse.data.filter(
          (reservation: Reservation) => reservation.consultation_id === Number(id)
        );
        setReservations(consultantReservations);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'خطا در دریافت اطلاعات';
        setError(errorMessage);
        showAlert(errorMessage, 'danger');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, showAlert]);

  if (loading) {
    return (
      <div className="text-center p-6">
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (error || !consultantData) {
    return (
      <div className="text-center p-6">
        <p className="text-red-600">{error || 'مشاور یافت نشد'}</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* نمایش اطلاعات مشاور */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{consultantData.title}</h1>
        <p className="text-gray-600 mt-2">مشاور: {consultantData.consultant}</p>
        <p className="text-gray-500 mt-2">{consultantData.description}</p>
        <div className="mt-4 space-y-2 text-gray-600">
          <p>مدت زمان مشاوره: {consultantData.consultation_time} دقیقه</p>
          <p>زمان‌های فعال: {consultantData.active_times}</p>
          <p>پنج‌شنبه‌های باز: {consultantData.thursdays_open}</p>
          {consultantData.license && <p>مجوز: {consultantData.license}</p>}
          <p>ایجاد شده در: {new Date(consultantData.created_at).toLocaleDateString('fa-IR')}</p>
          <p>به‌روزرسانی شده در: {new Date(consultantData.updated_at).toLocaleDateString('fa-IR')}</p>
        </div>
      </div>

      {/* نمایش رزروها */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">رزروهای این مشاوره</h2>
        {reservations.length === 0 ? (
          <div className="text-center p-6 text-gray-500">
            <p>هیچ رزروی برای این مشاوره ثبت نشده است.</p>
          </div>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-4">کاربر</th>
                    <th className="text-right p-4">تاریخ</th>
                    <th className="text-right p-4">ساعت</th>
                    <th className="text-right p-4">وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((reservation) => (
                    <tr key={reservation.id} className="border-b">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="font-medium">
                              {reservation.user?.name || 'کاربر حذف شده'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {reservation.user?.phone || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {reservation.date}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          {reservation.time}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded ${
                            reservation.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : reservation.status === 'done'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {reservation.status_label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}