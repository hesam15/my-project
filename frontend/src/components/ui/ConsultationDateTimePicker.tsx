import { useState, useEffect } from 'react';
import JalaliDateInput from './JalaliDateInput';
import dayjs from 'dayjs';
import jalaliday from 'jalaliday';
import { ClockIcon } from '@heroicons/react/24/solid';
import '@majidh1/jalalidatepicker/dist/jalalidatepicker.min.css';
dayjs.extend(jalaliday);

export interface ConsultationDateTimePickerProps {
  consultantId: number;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedTime: string | null;
  setSelectedTime: (time: string | null) => void;
  minDate?: string;
  maxDate?: string;
}

const ConsultationDateTimePicker = ({
  consultantId,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  minDate = 'today',
  maxDate = '1403/12/29',
}: ConsultationDateTimePickerProps) => {
  const [timeButtons, setTimeButtons] = useState<{ time: string; disabled: boolean }[]>([]);
  const [reservedTimes, setReservedTimes] = useState<string[]>([]);

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
        if (!response.ok) throw new Error('خطا در دریافت ساعات آزاد');
        const result = await response.json();
        let times: string[] = [];
        // تشخیص امروز بودن تاریخ انتخابی
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
        setTimeButtons(
          times.map((time: string) => ({
            time,
            disabled: (result.reservedTimes || []).includes(time),
          }))
        );
        setReservedTimes(result.reservedTimes || []);
        setSelectedTime(null);
      } catch (error) {
        setTimeButtons([]);
        setReservedTimes([]);
        setSelectedTime(null);
      }
    };
    fetchAvailableTimes();
  }, [consultantId, selectedDate, setSelectedTime]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">تاریخ مراجعه</label>
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
          <h3 className="text-base font-bold text-gray-900">ساعت مراجعه</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {timeButtons.length > 0 ? (
            timeButtons.map(({ time, disabled }) => (
              <button
                type="button"
                key={time}
                onClick={() => !disabled && setSelectedTime(time)}
                disabled={disabled}
                className={`w-full py-2 rounded-lg border text-center transition-colors duration-150 font-semibold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                  ${selectedTime === time
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : disabled
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-blue-50 hover:border-blue-400'}
                `}
              >
                {time}
              </button>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-400">زمانی موجود نیست</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationDateTimePicker; 