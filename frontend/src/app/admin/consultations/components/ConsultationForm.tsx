'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTimeStart, setActiveTimeStart] = useState<string>(consultation?.active_times?.split('-')[0]?.trim() || '');
  const [activeTimeEnd, setActiveTimeEnd] = useState<string>(consultation?.active_times?.split('-')[1]?.trim() || '');
  const [consultationTime, setConsultationTime] = useState<number>(consultation?.consultation_time || 30);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
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

      await onSubmit(data);
      toast.success(consultation ? 'مشاوره با موفقیت بروزرسانی شد' : 'مشاوره با موفقیت ایجاد شد');
      router.push('/admin/consultations');
    } catch (error) {
      toast.error('خطا در ذخیره اطلاعات مشاوره');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">
          عنوان مشاوره
        </label>
        <input
          type="text"
          name="title"
          id="title"
          defaultValue={consultation?.title}
          required
          className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-150"
        />
      </div>

      <div>
        <label htmlFor="consultant" className="block text-sm font-bold text-gray-700 mb-2">
          نام مشاور
        </label>
        <input
          type="text"
          name="consultant"
          id="consultant"
          defaultValue={consultation?.consultant}
          required
          className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-150"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">
          توضیحات
        </label>
        <textarea
          name="description"
          id="description"
          rows={3}
          defaultValue={consultation?.description}
          required
          className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-150"
        />
      </div>

      <div>
        <label htmlFor="license" className="block text-sm font-bold text-gray-700 mb-2">
          شماره پروانه
        </label>
        <input
          type="text"
          name="license"
          id="license"
          defaultValue={consultation?.license}
          required
          className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-150"
        />
      </div>

      <div>
        <label htmlFor="consultation_time" className="block text-sm font-bold text-gray-700 mb-2">
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
          className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-150"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="active_time_start" className="block text-sm font-bold text-gray-700 mb-2">
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
            className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-150"
          />
        </div>
        <div>
          <label htmlFor="active_time_end" className="block text-sm font-bold text-gray-700 mb-2">
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
            className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-150"
          />
        </div>
      </div>

      <div>
        <label htmlFor="thursdays_open" className="block text-sm font-bold text-gray-700 mb-2">
          باز بودن پنجشنبه‌ها
        </label>
        <select
          name="thursdays_open"
          id="thursdays_open"
          defaultValue={consultation?.thursdays_open}
          required
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white shadow-sm px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-150"
        >
          <option value="1">بله</option>
          <option value="0">خیر</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-lg border border-transparent bg-blue-600 py-2 px-6 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors duration-150 disabled:opacity-60"
        >
          {loading ? 'در حال ذخیره...' : consultation ? 'بروزرسانی' : 'ایجاد'}
        </button>
      </div>
    </form>
  );
} 