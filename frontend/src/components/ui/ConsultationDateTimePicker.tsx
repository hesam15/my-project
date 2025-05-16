import { useState, useEffect } from 'react';
import JalaliDateInput from './JalaliDateInput';
import dayjs from 'dayjs';
import jalaliday from 'jalaliday';
import { ClockIcon } from '@heroicons/react/24/solid';
import '@majidh1/jalalidatepicker/dist/jalalidatepicker.min.css';
import { Alert } from './Alert';
dayjs.extend(jalaliday);

export interface ConsultationDateTimePickerProps {
  consultantId: number;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedTime: string | null;
  setSelectedTime: (time: string | null) => void;
  minDate?: string;
  maxDate?: string;
  onTimeReserved?: (time: string) => void;
  thursdays_open?: number;
}

const ConsultationDateTimePicker = ({
  consultantId,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  minDate = 'today',
  maxDate = dayjs().add(1, 'month').calendar('jalali').format('YYYY/MM/DD'),
  onTimeReserved,
  thursdays_open = 0,
}: ConsultationDateTimePickerProps) => {
  const [timeButtons, setTimeButtons] = useState<{ time: string; disabled: boolean }[]>([]);
  const [reservedTimes, setReservedTimes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setAlertVisible(true);
    }
  }, [error]);

  useEffect(() => {
    setSelectedTime(null);
    setError(null);
    setAlertVisible(false);
  }, [selectedDate, setSelectedTime]);

  useEffect(() => {
    const fetchAvailableTimes = async () => {
      if (!consultantId || !selectedDate) {
        setTimeButtons([]);
        setReservedTimes([]);
        return;
      }

      // Check if the selected date is Friday or a closed Thursday
      const [year, month, day] = selectedDate.split('/').map(Number);
      const selectedJalaliDate = dayjs()
        .calendar('jalali')
        .year(year)
        .month(month - 1)
        .date(day);
      
      const weekDay = selectedJalaliDate.day();

      // Friday is 5, Thursday is 4 in dayjs
      if (weekDay === 4 || (weekDay === 3 && thursdays_open === 0)) {
        setTimeButtons([]);
        setReservedTimes([]);
        setSelectedTime(null);
        setError('این روز تعطیل است');
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
        if (!response.ok) {
          setError('خطا در دریافت ساعات آزاد');
          throw new Error('خطا در دریافت ساعات آزاد');
        }
        const result = await response.json();
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
          setError('هیچ ساعت آزادی برای این تاریخ وجود ندارد');
        } else {
          setError(null);
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
        if (error instanceof Error && !error.message.includes('ساعات آزاد')) {
          setError('خطا در دریافت اطلاعات');
        }
      }
    };
    fetchAvailableTimes();
  }, [consultantId, selectedDate, setSelectedTime]);

  const updateReservedTimes = (reservedTime: string) => {
    setReservedTimes(prev => [...prev, reservedTime]);
    setTimeButtons(prev => 
      prev.map(button => 
        button.time === reservedTime 
          ? { ...button, disabled: true }
          : button
      )
    );
  };

  const handleTimeSelect = (time: string, disabled: boolean) => {
    if (disabled) return;
    setSelectedTime(time);
    if (onTimeReserved) {
      updateReservedTimes(time);
      onTimeReserved(time);
    }
  };

  const handleAlertClose = () => {
    setAlertVisible(false);
    setError(null);
  };

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
          thursdays_open={thursdays_open}
        />
      </div>

      {error && (
        <div className="mb-4">
          <Alert 
            variant="error" 
            visible={alertVisible} 
            onClose={handleAlertClose}
          >
            {error}
          </Alert>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-4">
          <ClockIcon className="h-5 w-5 text-blue-500" />
          <h3 className="text-base font-bold text-gray-900">ساعت مراجعه</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {!consultantId ? (
            <div className="col-span-3 text-center text-blue-500 bg-blue-50 p-4 rounded-lg border border-blue-200">
              لطفاً ابتدا مشاور را انتخاب کنید
            </div>
          ) : error === 'این روز تعطیل است' ? (
            <div className="col-span-3 text-center text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-200">
              <span className="block mb-1 font-semibold">این روز تعطیل است</span>
              <span className="text-sm">لطفاً روز دیگری را انتخاب کنید</span>
            </div>
          ) : timeButtons.length > 0 ? (
            timeButtons.map(({ time, disabled }) => (
              <button
                type="button"
                key={time}
                onClick={() => handleTimeSelect(time, disabled)}
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
            <div className="col-span-3 text-center text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
              <span className="block mb-1 font-semibold">ساعت مراجعه‌ای موجود نیست</span>
              <span className="text-sm">لطفاً تاریخ دیگری را انتخاب کنید</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationDateTimePicker;