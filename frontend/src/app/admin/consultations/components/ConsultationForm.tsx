'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';


interface ConsultationFormProps {
  consultation?: {
    id: number;
    title: string;
    consultant: string;
    description: string;
    license: string;
    consultation_time: number;
    active_times: string;
    thursdays_open: number;
  };
  onSubmit: (data: any) => Promise<void>;
}

export default function ConsultationForm({ consultation, onSubmit }: ConsultationFormProps) {
  const [loading, setLoading] = useState(false);
  const [consultationTime, setConsultationTime] = useState(consultation?.consultation_time || 30);
  const [activeTimeStart, setActiveTimeStart] = useState(consultation?.active_times?.split('-')[0]?.trim() || '08:00');
  const [activeTimeEnd, setActiveTimeEnd] = useState(consultation?.active_times?.split('-')[1]?.trim() || '18:00');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      consultant: formData.get('consultant'),
      description: formData.get('description'),
      license: formData.get('license'),
      consultation_time: consultationTime,
      active_times: `${activeTimeStart}-${activeTimeEnd}`,
      thursdays_open: Number(formData.get('thursdays_open')),
    };

    try {
      await onSubmit(data);
      toast.success('مشاوره با موفقیت ذخیره شد.');
      router.push('/consultations');
    } catch (error) {
      toast.error('خطا در ذخیره مشاوره.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="space-y-6">
        <div className="mb-8">
          <p className="text-gray-500 text-sm">لطفاً اطلاعات مشاوره را با دقت وارد کنید.</p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              عنوان مشاوره
            </label>
            <input
              type="text"
              name="title"
              id="title"
              defaultValue={consultation?.title}
              required
              className="mt-1 block w-full rounded-lg px-4 py-2.5 text-gray-900 text-sm border border-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="consultant" className="block text-sm font-medium text-gray-700 mb-1">
              نام مشاور
            </label>
            <input
              type="text"
              name="consultant"
              id="consultant"
              defaultValue={consultation?.consultant}
              required
              className="mt-1 block w-full rounded-lg px-4 py-2.5 text-gray-900 text-sm border border-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              توضیحات
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              defaultValue={consultation?.description}
              required
              className="mt-1 block w-full rounded-lg px-4 py-2.5 text-gray-900 text-sm border border-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="license" className="block text-sm font-medium text-gray-700 mb-1">
              مدرک یا تخصص مشاور
            </label>
            <input
              type="text"
              name="license"
              id="license"
              defaultValue={consultation?.license}
              required
              className="mt-1 block w-full rounded-lg px-4 py-2.5 text-gray-900 text-sm border border-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="consultation_time" className="block text-sm font-medium text-gray-700 mb-1">
              مدت زمان مشاوره (دقیقه)
            </label>
            <input
              type="number"
              name="consultation_time"
              id="consultation_time"
              value={consultationTime}
              onChange={e => {
                let val = Number(e.target.value);
                if (val > 120) val = 120;
                if (val < 1) val = 1;
                setConsultationTime(val);
              }}
              required
              min="1"
              max="120"
              className="mt-1 block w-full rounded-lg px-4 py-2.5 text-gray-900 text-sm border border-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="active_time_start" className="block text-sm font-medium text-gray-700 mb-1">
                ساعت شروع
              </label>
              <input
                type="time"
                name="active_time_start"
                id="active_time_start"
                value={activeTimeStart}
                onChange={e => setActiveTimeStart(e.target.value)}
                required
                placeholder="09:00"
                min="08:00"
                max="22:00"
                className="mt-1 block w-full rounded-lg px-4 py-2.5 text-gray-900 text-sm border border-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="active_time_end" className="block text-sm font-medium text-gray-700 mb-1">
                ساعت پایان
              </label>
              <input
                type="time"
                name="active_time_end"
                id="active_time_end"
                value={activeTimeEnd}
                onChange={e => setActiveTimeEnd(e.target.value)}
                required
                placeholder="18:00"
                min="08:00"
                max="22:00"
                className="mt-1 block w-full rounded-lg px-4 py-2.5 text-gray-900 text-sm border border-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="thursdays_open" className="block text-sm font-medium text-gray-700 mb-1">
              باز بودن پنجشنبه‌ها
            </label>
            <select
              name="thursdays_open"
              id="thursdays_open"
              defaultValue={consultation?.thursdays_open}
              required
              className="mt-1 block w-full rounded-lg border-0 bg-white py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
            >
              <option value="1">بله</option>
              <option value="0">خیر</option>
            </select>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-200">
            <Button type="submit" variant="default">
              ذخیره تغییرات
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}