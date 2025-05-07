'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, Pencil, Trash2, Star, Crown, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail_path?: string;
  duration: string;
  students_count: number;
  is_special: boolean;
  is_premium: boolean;
  created_at: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت دوره‌ها');
      }

      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت دوره‌ها');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setConfirmOpen(false);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('خطا در حذف دوره');
      }

      fetchCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف دوره');
    } finally {
      setLoading(false);
    }
  };

  const handleSpecialToggle = async (id: number, isSpecial: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${id}/special`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ is_special: !isSpecial }),
      });

      if (!response.ok) {
        throw new Error('خطا در تغییر وضعیت دوره');
      }

      fetchCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در تغییر وضعیت دوره');
    } finally {
      setLoading(false);
    }
  };

  const handlePremiumToggle = async (id: number, isPremium: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${id}/premium`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ is_premium: !isPremium }),
      });

      if (!response.ok) {
        throw new Error('خطا در تغییر وضعیت دوره');
      }

      fetchCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در تغییر وضعیت دوره');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-6">
        <p>در حال بارگذاری...</p>
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

  return (
    <div className="space-y-6">
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right p-4">تصویر</th>
                <th className="text-right p-4">عنوان</th>
                <th className="text-right p-4">مدت زمان</th>
                <th className="text-right p-4">تعداد دانشجو</th>
                <th className="text-right p-4">وضعیت</th>
                <th className="text-right p-4">تاریخ انتشار</th>
                <th className="text-right p-4">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-4 text-gray-500">
                    هیچ دوره‌ای یافت نشد
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="border-b">
                    <td className="p-4">
                      {course.thumbnail_path && (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${course.thumbnail_path}`}
                          alt={course.title}
                          className="w-20 h-12 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="p-4">{course.title}</td>
                    <td className="p-4">{course.duration}</td>
                    <td className="p-4">{course.students_count}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSpecialToggle(course.id, course.is_special)}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              course.is_special ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePremiumToggle(course.id, course.is_premium)}
                        >
                          <Crown
                            className={`h-4 w-4 ${
                              course.is_premium ? 'text-purple-500 fill-purple-500' : 'text-gray-400'
                            }`}
                          />
                        </Button>
                      </div>
                    </td>
                    <td className="p-4">{new Date(course.created_at).toLocaleDateString('fa-IR')}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/courses/${course.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/courses/edit/${course.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(course.id)}
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
        message="آیا از حذف این دوره اطمینان دارید؟"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      <Button
        className="fixed bottom-20 left-4 w-12 h-12 rounded-full shadow-lg"
        onClick={() => router.push('/admin/courses/new')}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}