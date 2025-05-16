
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { consultations, consultationReservations } from '@/lib/api';
import ConsultationDateTimePicker from '@/components/ui/ConsultationDateTimePicker';
import { useAlert } from '@/contexts/AlertContext';
import { Button } from '@/components/ui/button';

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

// تعریف نوع کامل برای کاربر دریافتی از API
interface FetchedUser {
  id: number;
  name: string;
  phone: string;
  avatar_path: string | null;
  role: string;
  is_premium: number;
  created_at: string | null;
  updated_at: string | null;
  balance?: {
    user_id: number;
    amount: string;
  };
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
  'در ��نتظار': 'pending',
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
  const [selectedTime, setSelectedTime] = useState<string | null>('');
  const [statusLabel, setStatusLabel] = useState<string>(reservation?.status_label || 'در انتظار تایید');
  
  // Get user_phone from URL query parameters if available
  const userPhoneFromQuery = searchParams.get('user_phone');
  
  const [userPhone, setUserPhone] = useState<string>(
    reservation?.user_phone || userInfo?.phone || userPhoneFromQuery || ''
  );
  
  // بروزرسانی نوع داده
  const [fetchedUser, setFetchedUser] = useState<FetchedUser | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(!reservation);
  const [fetchingUser, setFetchingUser] = useState<boolean>(false);
  const { showAlert } = useAlert();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchConsultations();
  }, []);

  // Effect to automatically fetch user data when phone number is provided via URL
  useEffect(() => {
    if (userPhoneFromQuery && userPhoneFromQuery.length === 11 && !fetchedUser) {
      fetchUserData(userPhoneFromQuery);
    }
  }, [userPhoneFromQuery]);

  useEffect(() => {
    if (userPhone && isEditing) {
      // Only fetch user data when phone number has exactly 11 digits
      if (userPhone.length === 11) {
        // Debounce the API call to avoid too many requests
        if (debounceTimeout.current) {
          clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
          fetchUserData(userPhone);
        }, 500);
      } else {
        // Clear fetched user data if phone number is incomplete
        setFetchedUser(null);
      }
    }
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [userPhone, isEditing]);

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

  const fetchUserData = async (phone: string) => {
    try {
      // Set loading state to true when starting the fetch
      setFetchingUser(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/getUser?user_phone=${encodeURIComponent(phone)}`);
      if (response.ok) {
        const customer = await response.json();
        console.log('User data received:', customer); // برای دیباگ
        
        if (customer && customer.id) {
          setFetchedUser(customer);
          // در حالت ویرایش، پس از یافتن کاربر، حالت ویرایش را به پایان می‌رسانیم
          if (isEditing) {
            setIsEditing(false);
          }
        } else {
          setFetchedUser(null);
          showAlert('کاربری با این شماره تلفن یافت نشد', 'warning');
        }
      } else {
        setFetchedUser(null);
        showAlert('خطا در دریافت اطلاعات کاربر', 'danger');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setFetchedUser(null);
      showAlert('خطا در دریافت اطلاعات کاربر', 'danger');
    } finally {
      // Always set loading state to false when fetch completes
      setFetchingUser(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!userPhone) throw new Error('شماره موبایل وارد نشده است');
      if (!selectedConsultation) throw new Error('مشاوره انتخاب نشده است');
      if (!selectedDate) throw new Error('تاریخ انتخاب نشده است');
      if (!selectedTime) throw new Error('ساعت انتخاب نشده است');
      
      const data = {
        user_phone: userPhone,
        consultation_id: selectedConsultation.id,
        date: selectedDate,
        time: selectedTime,
        status: statusLabel === 'تایید شده' ? 'confirmed' : statusLabel === 'لغو شده' ? 'cancelled' : 'pending',
      };
      await onSubmit(data);
      showAlert(reservation ? 'رزرو با موفقیت بروزرسانی شد' : 'رزرو با موفقیت ایجاد شد', 'success');
      router.push('/reservations');
    } catch (error: any) {
      showAlert(error.message || 'خطا در ذخیره اطلاعات رزرو', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  // تبدیل وضعیت کاربر به فارسی
  const getUserRoleLabel = (role: string): string => {
    switch (role) {
      case 'admin': return 'مدیر';
      case 'customer': return 'مشتری';
      default: return role;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-8">
        <p className="text-gray-500 text-sm">لطفاً اطلاعات رزرو را با دقت وارد کنید.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">اطلاعات کاربر</label>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="phone" className="block text-xs text-gray-500 mb-1">شماره موبایل</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                readOnly={!!reservation && !isEditing}
                required
                className={`block w-full rounded-lg px-4 py-2.5 text-gray-900 text-sm ${
                  (reservation && !isEditing)
                    ? 'bg-gray-50 border-0 ring-1 ring-inset ring-gray-300'
                    : 'bg-white border border-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500'
                }`}
              />
              {userPhone && userPhone.length > 0 && userPhone.length < 11 && isEditing && (
                <p className="mt-1 text-xs text-amber-600">برای جستجوی اطلاعات کاربر، شماره موبایل باید ۱۱ رقم باشد.</p>
              )}
            </div>
            
            {/* نمایش وضعیت در حال بارگذاری */}
            {fetchingUser && (
              <div className="flex items-center space-x-2 space-x-reverse">
                <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs text-gray-500">در حال جستجوی اطلاعات کاربر...</span>
              </div>
            )}
            
            {/* نمایش اطلاعات کاربر - بخش بهبود یافته */}
            {fetchedUser && !isEditing && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {fetchedUser.avatar_path ? (
                      <img 
                        src={fetchedUser.avatar_path} 
                        alt={fetchedUser.name} 
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                        {fetchedUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800">{fetchedUser.name}</p>
                      <p className="text-xs text-gray-500">{fetchedUser.phone}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    ویرایش
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2 rounded border border-gray-100">
                    <span className="text-gray-500">نوع کاربر:</span>
                    <span className="mr-1 font-medium">{getUserRoleLabel(fetchedUser.role)}</span>
                  </div>
                  
                  <div className="bg-white p-2 rounded border border-gray-100">
                    <span className="text-gray-500">وضعیت:</span>
                    <span className="mr-1 font-medium">
                      {fetchedUser.is_premium ? 'پریمیوم' : 'عادی'}
                    </span>
                  </div>
                  
                  {fetchedUser.balance && (
                    <div className="bg-white p-2 rounded border border-gray-100 col-span-2">
                      <span className="text-gray-500">موجودی:</span>
                      <span className="mr-1 font-medium">
                        {Number(fetchedUser.balance.amount).toLocaleString()} تومان
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="consultation_id" className="block text-sm font-medium text-gray-700 mb-1">انتخاب مشاوره</label>
          <select
            name="consultation_id"
            id="consultation_id"
            value={selectedConsultation?.id || ''}
            onChange={e => {
              const c = consultationsList.find(c => c.id === Number(e.target.value));
              setSelectedConsultation(c || null);
            }}
            required
            className="mt-1 block w-full rounded-lg border-0 bg-white py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
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
            consultantId={selectedConsultation?.id}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            thursdays_open={selectedConsultation?.thursdays_open}
          />
        </div>

        <div className="pt-6 mt-6 border-t border-gray-200">
          <Button type="submit" variant="default" loading={loading}>
            ذخیره تغییرات
          </Button>
        </div>
      </div>
    </form>
  );
}