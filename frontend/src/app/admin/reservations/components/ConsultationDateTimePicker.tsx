import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { ClockIcon } from '@heroicons/react/outline';
import JalaliDateInput from './JalaliDateInput';
import { useAlert } from './useAlert';

interface ConsultationDateTimePickerProps {
  consultantId: string | null;
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  selectedTime: string | null;
  setSelectedTime: (time: string | null) => void;
  minDate?: string;
  maxDate?: string;
  onTimeReserved?: (time: string) => void;
}

const ConsultationDateTimePicker = ({
  consultantId,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  minDate = 'today',
  maxDate = '1403/12/29',
  onTimeReserved,
}: ConsultationDateTimePickerProps) => {
  const [timeButtons, setTimeButtons] = useState<{ time: string; disabled: boolean }[]>([]);
  const [reservedTimes, setReservedTimes] = useState<string[]>([]);
  const { showAlert } = useAlert();

  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDate, setSelectedTime]);

  useEffect(() => {
    const fetchAvailableTimes = async () => {
      if (!consultantId || !selectedDate) {
        setTimeButtons([]);
        setReservedTimes([]);
        return;
      }
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/reservations/available-times/${consultantId}?date=${selectedDate}`;
        const response = await fetch(url, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();
        
        if (!response.ok) {
          showAlert(result.message || 'خطا در دریافت ساعات آزاد', 'danger');
          setTimeButtons([]);
          setReservedTimes([]);
          setSelectedTime(null);
          return;
        }

        if (result.message) {
          showAlert(result.message, response.ok ? 'success' : 'danger');
        }

        let times: string[] = [];
        const [jy, jm, jd] = selectedDate.split('/').map(Number);
        const todayJalali = dayjs().calendar('jalali');
        const isToday = jy === todayJalali.year() && jm === todayJalali.month() + 1 && jd === todayJalali.date();

        if (isToday) {
          times = [
            ...(Array.isArray(result.lastTimes) ? result.lastTimes : []),
            ...(Array.isArray(result.availabelTimes)
              ? result.availabelTimes
              : Object.values(result.availabelTimes || {})),
          ];
        } else {
          times = Array.isArray(result.availabelTimes)
            ? result.availabelTimes
            : Object.values(result.availabelTimes || {});
        }

        if (times.length === 0) {
          showAlert('هیچ ساعت آزادی برای این تاریخ وجود ندارد', 'info');
        }

        setTimeButtons(
          times.map((time: string) => ({
            time,
            disabled: (result.reservedTimes || []).includes(time),
          }))
        );
        setReservedTimes(result.reservedTimes || []);
        setSelectedTime(null);
      } catch (error) {
        showAlert('خطا در دریافت اطلاعات ساعات رزرو', 'danger');
        setTimeButtons([]);
        setReservedTimes([]);
        setSelectedTime(null);
      }
    };
    fetchAvailableTimes();
  }, [consultantId, selectedDate, setSelectedTime, showAlert]);

  return (
    <>
      <div className="relative mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ مراجعه</label>
        <JalaliDateInput
          value={selectedDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)}
          minDate={minDate}
          maxDate={maxDate}
          onlyDate
        />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ClockIcon className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">ساعت مراجعه</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {!consultantId ? (
            <div className="col-span-3 text-center text-blue-500 bg-blue-50 p-4 rounded-lg border border-blue-200">
              لطفاً ابتدا مشاور را انتخاب کنید
            </div>
          ) : timeButtons.length > 0 ? (
            timeButtons.map(({ time, disabled }) => (
              <button
                type="button"
                key={time}
                onClick={() => {
                  if (!disabled) {
                    setSelectedTime(time);
                    if (onTimeReserved) onTimeReserved(time);
                  }
                }}
                disabled={disabled}
                className={`w-full py-2 rounded-lg border text-center transition-colors ${
                  selectedTime === time
                    ? 'bg-blue-500 text-white border-blue-500'
                    : disabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-blue-50'
                }`}
              >
                {time}
              </button>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-400">زمانی موجود نیست</div>
          )}
        </div>
      </div>
    </>
  );
};

export default ConsultationDateTimePicker;