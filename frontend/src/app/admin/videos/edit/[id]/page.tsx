'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Video {
  id: number;
  title: string;
  description: string;
  thumbnail_path?: string;
  video_path: string;
  duration: string;
  views_count: number;
  created_at: string;
  course_id: number;
  is_premium?: boolean;
}

interface Course {
  id: number;
  title: string;
}

export default function EditVideoPage() {
  const params = useParams();
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // دریافت اطلاعات ویدیو
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${params.id}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('خطا در دریافت اطلاعات ویدیو');
      const data = await res.json();
      setVideo(data);

      // دریافت لیست دوره‌ها
      const resCourses = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`, {
        credentials: 'include',
      });
      if (!resCourses.ok) throw new Error('خطا در دریافت لیست دوره‌ها');
      const coursesData = await resCourses.json();
      setCourses(coursesData);
    } catch (err) {
      setError('خطا در دریافت اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
  
    try {
      const formData = new FormData();
  
      // اضافه کردن مقادیر فرم به FormData
      const title = e.currentTarget.title.value;
      const description = e.currentTarget.description.value;
      const courseId = e.currentTarget.course_id.value;
      const videoFile = e.currentTarget.video_path.files[0];
      const thumbnailFile = e.currentTarget.thumbnail_path.files[0];
  
      // اضافه کردن مقادیر به FormData
      formData.append('title', title); // همیشه مقدار فعلی رو بفرست، حتی اگه خالی باشه
      formData.append('description', description);
      formData.append('course_id', courseId);
      formData.append('is_premium', video?.is_premium?.toString() || 'false');
  
      // مدیریت فایل‌ها
      if (videoFile) {
        formData.append('video_path', videoFile);
      } else {
        formData.append('video_path', video?.video_path || '');
      }
  
      if (thumbnailFile) {
        formData.append('thumbnail_path', thumbnailFile);
      } else {
        formData.append('thumbnail_path', video?.thumbnail_path || '');
      }
  
      formData.append('_method', 'PUT');
  
      // لاگ برای دیباگ
      console.log([...formData.entries()]);
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${params.id}`, {
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
            setFormError(messages);
          } else {
            setFormError(data.message || 'خطا در اعتبارسنجی اطلاعات');
          }
          return;
        }
        if (response.status === 409) {
          const data = await response.json();
          setFormError(data.message || 'فایل ویدیویی تکراری است');
          return;
        }
        const data = await response.json();
        setFormError(data.message || 'خطا در ویرایش ویدیو');
        return;
      }
  
      router.push('/admin/videos');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'خطا در ویرایش ویدیو');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">در حال بارگذاری...</div>;
  }

  if (error || !video) {
    return <div className="p-6 text-center text-red-500">{error || 'ویدیو یافت نشد'}</div>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">ویرایش ویدیو</h1>
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        {formError && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            {formError}
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
            defaultValue={video.title}
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
            defaultValue={video.description}
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ویدیوی فعلی
          </label>
          <video src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${video.video_path}`} controls className="w-full mb-2" />
          <input
            type="file"
            id="video_path"
            name="video_path"
            accept="video/*"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <input
            type="hidden"
            name="current_video_path"
            value={video.video_path || ''}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            تصویر بندانگشتی فعلی
          </label>
          {video.thumbnail_path && (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${video.thumbnail_path}`}
              alt="thumbnail"
              className="w-32 h-20 object-cover rounded mb-2"
            />
          )}
          <input
            type="file"
            id="thumbnail_path"
            name="thumbnail_path"
            accept="image/*"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <input
            type="hidden"
            name="current_thumbnail_path"
            value={video.thumbnail_path || ''}
          />
        </div>

        <div>
          <label htmlFor="course_id" className="block text-sm font-medium text-gray-700 mb-1">
            دوره مربوطه
          </label>
          <select
            id="course_id"
            name="course_id"
            defaultValue={video.course_id}
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
          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch
              id="is_premium"
              checked={video.is_premium || false}
              onCheckedChange={(checked) => setVideo({ ...video, is_premium: checked })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                video.is_premium ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  video.is_premium ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </Switch>
            <span className={video.is_premium ? 'text-green-500' : 'text-gray-500'}>
              {video.is_premium ? 'فعال' : 'غیرفعال'}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={formLoading}
          className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
        >
          {formLoading ? 'در حال ثبت تغییرات...' : 'ثبت تغییرات'}
        </button>
      </form>
    </div>
  );
}