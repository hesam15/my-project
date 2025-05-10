'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { consultationReservations } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAlert } from '@/contexts/AlertContext';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, User, Phone, MessageSquare } from 'lucide-react';

interface User {
  id: number;
  name: string;
  phone: string;
}

interface Consultation {
  id: number;
  title: string;
  consultant: string;
}

interface Reservation {
  id: number;
  date: string;
  time: string;
  user_id: number;
  consultation_id: number;
  created_at: string;
  updated_at: string;
  user: User;
  consultation: Consultation;
  status: string;
  status_label: string;
}

// Mapping between Persian labels and English values
const statusMapping = {
  'در انتظار': 'pending',
  'انجام شده': 'done',
  'لغو شده': 'canceled'
} as const;

// Reverse mapping for display
const reverseStatusMapping = {
  'pending': 'در انتظار',
  'done': 'انجام شده',
  'canceled': 'لغو شده'
} as const;

export default function ReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [statusLoading, setStatusLoading] = useState<number | null>(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await consultationReservations.getAll();
      setReservations(response.data);
    } catch {
      showAlert('خطا در دریافت لیست رزروها', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    try {
      await consultationReservations.delete(selectedId);
      setReservations(reservations.filter(reservation => reservation.id !== selectedId));
      showAlert('رزرو با موفقیت حذف شد', 'success');
    } catch {
      showAlert('خطا در حذف رزرو', 'danger');
    } finally {
      setConfirmOpen(false);
      setSelectedId(null);
    }
  };

  const handleStatusChange = async (reservationId: number, newStatusLabel: string) => {
    if (statusLoading === reservationId) return;
    
    setStatusLoading(reservationId);
    try {
      const newStatus = statusMapping[newStatusLabel as keyof typeof statusMapping];
      await consultationReservations.updateStatus(reservationId, newStatus);
      setReservations(reservations.map(reservation => 
        reservation.id === reservationId 
          ? { ...reservation, status: newStatus, status_label: newStatusLabel }
          : reservation
      ));
      showAlert('وضعیت رزرواسیون با موفقیت بروزرسانی شد', 'success');
    } catch (error) {
      showAlert('خطا در بروزرسانی وضعیت رزرواسیون', 'danger');
    } finally {
      setStatusLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-6">
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right p-4">کاربر</th>
                <th className="text-right p-4">مشاوره</th>
                <th className="text-right p-4">تاریخ</th>
                <th className="text-right p-4">ساعت</th>
                <th className="text-right p-4">وضعیت</th>
                <th className="text-right p-4">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8">
                    <div className="flex flex-col items-center gap-4 text-gray-500">
                      <Calendar className="w-12 h-12" />
                      <div className="space-y-2">
                        <p className="text-lg font-medium">هیچ رزروی ثبت نشده است</p>
                        <p className="text-sm">کاربران می‌توانند از طریق صفحه مشاوره‌ها، زمان مشاوره خود را رزرو کنند.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                reservations.map((reservation) => (
                  <tr key={reservation.id} className="border-b">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="font-medium">{reservation.user.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {reservation.user.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        {reservation.consultation.title}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {new Date(reservation.date).toLocaleDateString('fa-IR')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        {reservation.time}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        reservation.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : reservation.status === 'done'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {reservation.status_label}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {reservation.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(reservation.id, 'done')}
                            >
                              انجام شده
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(reservation.id, 'canceled')}
                            >
                              لغو شده
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedId(reservation.id);
                            setConfirmOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        message="آیا از حذف این رزرو اطمینان دارید؟"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      <Button
        className="fixed bottom-20 left-4 w-12 h-12 rounded-full shadow-lg"
        onClick={() => router.push('/admin/consultations/reservations/new')}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
} 