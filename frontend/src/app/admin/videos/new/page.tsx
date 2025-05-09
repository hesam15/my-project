'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'react-hot-toast';


interface Course {
  id: number;
  title: string;
}

export default function NewVideo() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // دریافت لیست دوره‌ها
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        });
        if (!response.ok) throw new Error('خطا در دریافت لیست دوره‌ها');
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError('خطا در دریافت لیست دوره‌ها');
      }
    };
    fetchCourses();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      formData.append('is_premium', isPremium.toString());

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 422) {
          const data = await response.json();
          if (data.details) {
            const messages = Object.values(data.details)
              .flat()
              .join('، ');
            setError(messages);
          } else {
            setError(data.message || 'خطا در اعتبارسنجی اطلاعات');
          }
          return;
        }
        if (response.status === 409) {
          const data = await response.json();
          setError(data.message || 'فایل ویدیویی تکراری است');
          return;
        }
        const data = await response.json();
        setError(data.message || 'خطا در ایجاد ویدیو');
        return;
      }

      toast.success('ویدیو با موفقیت ایجاد شد');
      router.push('/admin/videos');
    } catch {
      toast.error('خطا در ایجاد ویدیو');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            عنوان ویدیو
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            توضیحات
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="video_file" className="block text-sm font-medium text-gray-700 mb-1">
            آپلود ویدیو
          </label>
          <input
            type="file"
            id="video_file"
            name="video_path"
            accept="video/*"
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="thumbnail_path" className="block text-sm font-medium text-gray-700 mb-1">
            آپلود تصویر بندانگشتی
          </label>
          <input
            type="file"
            id="thumbnail_path"
            name="thumbnail_path"
            accept="image/*"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="course_id" className="block text-sm font-medium text-gray-700 mb-1">
            دوره مربوطه
          </label>
          <select
            id="course_id"
            name="course_id"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">انتخاب دوره</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="is_premium">پریمیوم</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_premium"
              name="is_premium"
              checked={isPremium}
              onCheckedChange={setIsPremium}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                isPremium ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  isPremium ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </Switch>
            <span className={isPremium ? 'text-green-500' : 'text-gray-500'}>
              {isPremium ? 'فعال' : 'غیرفعال'}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'در حال ثبت...' : 'ثبت ویدیو'}
        </button>
      </form>
    </div>
  );
}