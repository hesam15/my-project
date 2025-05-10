'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, Pencil, Trash2, Crown, Plus, ArrowUpDown } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { courses } from '@/lib/api';

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail_path?: string;
  created_at: string;
  updated_at: string;
  is_premium: number;
  user_id: number;
  comments: any[];
  likes: any[];
}

export default function CoursesPage() {
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCourses = useCallback(async () => {
    try {
      console.log('Fetching courses...');
      const response = await courses.getAll();
      console.log('Response:', response);
      
      if (response.data) {
        console.log('Courses data:', response.data);
        setCoursesList(response.data);
      } else {
        console.log('No courses data found in response');
        setCoursesList([]);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      toast.error('خطا در دریافت لیست دوره‌ها');
      setCoursesList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleDelete = async (id: string) => {
    try {
      await courses.delete(id);
      setCoursesList(coursesList.filter(course => course.id !== parseInt(id)));
      toast.success('دوره با موفقیت حذف شد');
    } catch (err) {
      toast.error('خطا در حذف دوره');
    }
  };

  const handlePremiumToggle = async (id: number, isPremium: boolean) => {
    setLoading(true);
    try {
      await courses.update(id.toString(), { is_premium: isPremium ? 0 : 1 });
      fetchCourses();
    } catch (err) {
      toast.error('خطا در تغییر وضعیت دوره');
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

  return (
    <div className="space-y-6">
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right p-4">تصویر</th>
                <th className="text-right p-4">عنوان</th>
                <th className="text-right p-4">توضیحات</th>
                <th className="text-right p-4">وضعیت</th>
                <th className="text-right p-4">تاریخ انتشار</th>
                <th className="text-right p-4">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {coursesList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-500">
                    هیچ دوره‌ای یافت نشد
                  </td>
                </tr>
              ) : (
                coursesList.map((course) => (
                  <tr key={course.id} className="border-b">
                    <td className="p-4">
                      {course.thumbnail_path && (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${course.thumbnail_path}`}
                          alt={course.title}
                          width={80}
                          height={48}
                          className="w-20 h-12 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="p-4">{course.title}</td>
                    <td className="p-4">{course.description}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePremiumToggle(course.id, course.is_premium === 1)}
                        >
                          <Crown
                            className={`h-4 w-4 ${
                              course.is_premium === 1 ? 'text-purple-500 fill-purple-500' : 'text-gray-400'
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
                          onClick={() => router.push(`/admin/courses/${course.id}/videos/sort`)}
                          title="مرتب‌سازی ویدیوها"
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
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
                          onClick={() => handleDelete(course.id.toString())}
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
        open={false}
        message="آیا از حذف این دوره اطمینان دارید؟"
        onConfirm={() => handleDelete('0')}
        onCancel={() => {}}
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