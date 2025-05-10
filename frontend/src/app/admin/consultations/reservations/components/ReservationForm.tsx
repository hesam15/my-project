'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { consultations, consultationReservations } from '@/lib/api';
import ConsultationDateTimePicker from '@/components/ui/ConsultationDateTimePicker';
import { useAlert } from '@/contexts/AlertContext';

interface Reservation {
  id: number;
  consultation_id: number;
  user_id: number;
  user_name: string;
  user_phone: string;
  reservation_date: string;
  reservation_time: string;
  status: string;
  status_label: string;
  created_at: string;
  updated_at: string;
}

interface Consultation {
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

interface ReservationFormProps {
  reservation?: Reservation;
  onSubmit: (data: any) => Promise<void>;
  userInfo?: {
    id: number;
    name: string;
    phone: string;
  };
}

// Mapping between Persian labels and English values
const statusMapping = {
  'در انتظار': 'pending',
  'انجام شده': 'done',
  'لغو شده': 'canceled'
} as const;

export default function ReservationForm({ reservation, onSubmit, userInfo }: ReservationFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [consultationsList, setConsultationsList] = useState<any[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [statusLabel, setStatusLabel] = useState<string>(reservation?.status_label || 'در انتظار تایید');
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const response = await consultations.getAll();
      setConsultationsList(response.data);
      if (reservation) {
        const consultation = response.data.find((c: any) => c.id === reservation.consultation_id);
        if (consultation) {
          setSelectedConsultation(consultation);
        }
      }
    } catch {
      showAlert('خطا در دریافت لیست مشاوره‌ها', 'danger');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!userInfo) throw new Error('کاربر انتخاب نشده است');
      if (!selectedConsultation) throw new Error('مشاوره انتخاب نشده است');
      if (!selectedDate) throw new Error('تاریخ انتخاب نشده است');
      if (!selectedTime) throw new Error('ساعت انتخاب نشده است');
      const data = {
        user_id: userInfo.id,
        consultation_id: selectedConsultation.id,
        date: selectedDate,
        time: selectedTime,
        status: statusLabel === 'تایید شده' ? 'confirmed' : statusLabel === 'لغو شده' ? 'cancelled' : 'pending',
      };
      await onSubmit(data);
      showAlert(reservation ? 'رزرو با موفقیت بروزرسانی شد' : 'رزرو با موفقیت ایجاد شد', 'success');
      router.push('/admin/consultations/reservations');
    } catch (error: any) {
      showAlert(error.message || 'خطا در ذخیره اطلاعات رزرو', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">کاربر</label>
        <input
          type="text"
          value={userInfo ? `${userInfo.name} - ${userInfo.phone}` : ''}
          readOnly
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-100 shadow-sm px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white transition-colors duration-150"
        />
      </div>
      <div>
        <label htmlFor="consultation_id" className="block text-sm font-bold text-gray-700 mb-2">مشاوره</label>
        <select
          name="consultation_id"
          id="consultation_id"
          value={selectedConsultation?.id || ''}
          onChange={e => {
            const c = consultationsList.find(c => c.id === Number(e.target.value));
            setSelectedConsultation(c || null);
          }}
          required
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white shadow-sm px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-150"
        >
          <option value="">انتخاب مشاوره</option>
          {consultationsList.map((consultation) => (
            <option key={consultation.id} value={consultation.id}>
              {consultation.title} - {consultation.consultant}
            </option>
          ))}
        </select>
      </div>
      <div>
        <ConsultationDateTimePicker
          consultantId={selectedConsultation?.id || 0}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
        />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-bold text-gray-700 mb-2">وضعیت</label>
        <select
          id="status"
          value={statusLabel}
          onChange={(e) => setStatusLabel(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white shadow-sm px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-150"
        >
          <option value="در انتظار تایید">در انتظار تایید</option>
          <option value="تایید شده">تایید شده</option>
          <option value="لغو شده">لغو شده</option>
        </select>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-lg border border-transparent bg-blue-600 py-2 px-6 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors duration-150 disabled:opacity-60"
        >
          {loading ? 'در حال ذخیره...' : reservation ? 'بروزرسانی' : 'ایجاد'}
        </button>
      </div>
    </form>
  );
} 