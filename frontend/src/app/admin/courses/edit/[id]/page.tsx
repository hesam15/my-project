'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail_path?: string;
  duration: string;
  students_count: number;
  is_premium: boolean;
  created_at: string;
}

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourse();
  }, [params.id]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${params.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت اطلاعات دوره');
      }

      const data = await response.json();
      setCourse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات دوره');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    setSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: course.title,
          description: course.description,
          duration: course.duration,
          is_premium: course.is_premium,
        }),
      });

      if (!response.ok) {
        throw new Error('خطا در بروزرسانی دوره');
      }

      router.push('/admin/courses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بروزرسانی دوره');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-6">
        <p>{error}</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center p-6">
        <p>دوره مورد نظر یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ویرایش دوره</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">عنوان دوره</Label>
              <Input
                id="title"
                value={course.title}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">توضیحات</Label>
              <Textarea
                id="description"
                value={course.description}
                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                required
                rows={5}
              />
            </div>

            <div>
              <Label htmlFor="duration">مدت زمان</Label>
              <Input
                id="duration"
                value={course.duration}
                onChange={(e) => setCourse({ ...course, duration: e.target.value })}
                required
                placeholder="مثال: 2 ساعت"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_premium">پریمیوم</Label>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="is_premium"
                  checked={course.is_premium}
                  onCheckedChange={(checked) => setCourse({ ...course, is_premium: checked })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                    course.is_premium ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                      course.is_premium ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </Switch>
                <span className={course.is_premium ? 'text-green-500' : 'text-gray-500'}>
                  {course.is_premium ? 'فعال' : 'غیرفعال'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  ذخیره تغییرات
                  <ArrowRight className="mr-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}