"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { Wallet, Star, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ConsultationReservation {
  id: number;
  date: string;
  time: string;
  status_label: string;
  consultation: {
    id: number;
    title: string;
    consultant: string;
  };
}

interface ReservationGroup {
  pending: ConsultationReservation[];
  done: ConsultationReservation[];
  canceled: ConsultationReservation[];
}

export default function CustomerDashboard() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    pending: false,
    done: false,
    canceled: false
  });

  if (!user || user.role !== 'customer') {
    return <div className="text-center p-8">شما به این بخش دسترسی ندارید.</div>;
  }

  const isPremium = (user as any).is_premium;
  const balanceAmount = (user as any).balance?.amount ?? user.balance ?? 0;

  // مقدار پیش‌فرض برای groupedReservations
  const defaultGroupedReservations: ReservationGroup = {
    pending: [],
    done: [],
    canceled: []
  };

  // گروه‌بندی رزروها براساس وضعیت با بررسی وجود consultation_reservations
  const groupedReservations = user.consultation_reservations 
    ? user.consultation_reservations.reduce((acc: ReservationGroup, reservation) => {
        if (reservation.status_label === 'در انتظار') {
          acc.pending.push(reservation);
        } else if (reservation.status_label === 'انجام شده') {
          acc.done.push(reservation);
        } else if (reservation.status_label === 'لغو شده') {
          acc.canceled.push(reservation);
        }
        return acc;
      }, { pending: [], done: [], canceled: [] })
    : defaultGroupedReservations;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // کامپوننت نمایش یک رزرو
  const ReservationItem = ({ reservation }: { reservation: ConsultationReservation }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="space-y-1">
        <p className="font-semibold">{reservation.consultation.title}</p>
        <p className="text-sm text-gray-600">مشاور: {reservation.consultation.consultant}</p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{reservation.date}</span>
          <span>ساعت {reservation.time}</span>
        </div>
      </div>
      <div className={`px-3 py-1 rounded-full text-sm ${
        reservation.status_label === 'در انتظار'
          ? 'bg-blue-100 text-blue-800'
          : reservation.status_label === 'انجام شده'
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}>
        {reservation.status_label}
      </div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto py-10 space-y-8">
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold">{user.name}</span>
            <span className="text-gray-500 text-sm">{user.phone}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Wallet className="w-5 h-5 text-green-500" />
          <span>موجودی کیف پول:</span>
          <span className="font-bold">{balanceAmount} تومان</span>
          <Button 
            size="sm" 
            className="mr-auto bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 shadow-md transition-all duration-200 ease-in-out transform hover:scale-105"
            onClick={() => router.push('/wallet/charge')}
          >
            شارژ کیف پول
          </Button>
        </div>
      </Card>

      <Card className="p-6 flex items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
          <Star className={isPremium ? 'w-6 h-6 text-yellow-400' : 'w-6 h-6 text-gray-400'} />
          <span className="font-semibold">اشتراک پریمیوم:</span>
          <span className={isPremium ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
            {isPremium ? 'فعال' : 'غیرفعال'}
          </span>
        </div>
        {!isPremium && (
          <Button 
            className="whitespace-nowrap bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-md transition-all duration-200 ease-in-out transform hover:scale-105"
            onClick={() => router.push('/premium/buy')}
          >
            خرید اشتراک
          </Button>
        )}
      </Card>

      <div className="space-y-4">
        {/* رزروهای در انتظار */}
        {groupedReservations.pending.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold">رزروهای در انتظار</h2>
            </div>
            <div className="space-y-4">
              <ReservationItem reservation={groupedReservations.pending[0]} />
              {expandedSections.pending && groupedReservations.pending.slice(1).map(reservation => (
                <ReservationItem key={reservation.id} reservation={reservation} />
              ))}
            </div>
            {groupedReservations.pending.length > 1 && (
              <Button
                variant="ghost"
                className="w-full mt-4 border-t pt-4"
                onClick={() => toggleSection('pending')}
              >
                {expandedSections.pending ? 'بستن' : 'مشاهده همه'}
                {expandedSections.pending ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
              </Button>
            )}
          </Card>
        )}

        {/* رزروهای انجام شده */}
        {groupedReservations.done.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold">رزروهای انجام شده</h2>
            </div>
            <div className="space-y-4">
              <ReservationItem reservation={groupedReservations.done[0]} />
              {expandedSections.done && groupedReservations.done.slice(1).map(reservation => (
                <ReservationItem key={reservation.id} reservation={reservation} />
              ))}
            </div>
            {groupedReservations.done.length > 1 && (
              <Button
                variant="ghost"
                className="w-full mt-4 border-t pt-4"
                onClick={() => toggleSection('done')}
              >
                {expandedSections.done ? 'بستن' : 'مشاهده همه'}
                {expandedSections.done ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
              </Button>
            )}
          </Card>
        )}

        {/* رزروهای لغو شده */}
        {groupedReservations.canceled.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold">رزروهای لغو شده</h2>
            </div>
            <div className="space-y-4">
              <ReservationItem reservation={groupedReservations.canceled[0]} />
              {expandedSections.canceled && groupedReservations.canceled.slice(1).map(reservation => (
                <ReservationItem key={reservation.id} reservation={reservation} />
              ))}
            </div>
            {groupedReservations.canceled.length > 1 && (
              <Button
                variant="ghost"
                className="w-full mt-4 border-t pt-4"
                onClick={() => toggleSection('canceled')}
              >
                {expandedSections.canceled ? 'بستن' : 'مشاهده همه'}
                {expandedSections.canceled ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
              </Button>
            )}
          </Card>
        )}

        {(!groupedReservations.pending.length && !groupedReservations.done.length && !groupedReservations.canceled.length) && (
          <Card className="p-6">
            <div className="text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2" />
              <p>هیچ مشاوره‌ای رزرو نشده است</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}