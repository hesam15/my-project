'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowRight, Loader2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { use } from 'react';
import Image from 'next/image';

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

interface EditCoursePageProps {
  params: {
    id: string
  }
}

export default function EditCoursePage({ params }: EditCoursePageProps) {
  // Unwrap the params Promise with React.use()
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.id;
  
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newThumbnail, setNewThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}`, {
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
    fetchCourse();
  }, [courseId]);

  // Handle thumbnail file change
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewThumbnail(file);
    
    // Create preview URL for the new thumbnail
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
      
      // Clean up the object URL when component unmounts or when the file changes
      return () => URL.revokeObjectURL(previewUrl);
    } else {
      setThumbnailPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    setSaving(true);
    try {
      // Use FormData to handle file uploads
      const formData = new FormData();
      formData.append('title', course.title);
      formData.append('description', course.description);
      formData.append('duration', course.duration);
      formData.append('is_premium', course.is_premium ? '1' : '0');
      
      // Add _method field for Laravel to handle it as PUT/PATCH
      formData.append('_method', 'PUT');
      
      // Add new thumbnail if selected
      if (newThumbnail) {
        formData.append('thumbnail_path', newThumbnail);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}`, {
        method: 'POST', // Using POST with _method=PUT for file uploads
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('خطا در بروزرسانی دوره');
      }

      router.push('/courses');
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
    <div className="space-y-6 w-full px-0">
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
              <Label htmlFor="thumbnail_path">تصویر دوره</Label>
              <div className="mt-2 mb-4">
                {thumbnailPreview ? (
                  <div className="relative w-48 h-32 overflow-hidden rounded-md">
                    <Image
                      src={thumbnailPreview}
                      alt="پیش‌نمایش تصویر"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : course.thumbnail_path ? (
                  <div className="relative w-48 h-32 overflow-hidden rounded-md">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${course.thumbnail_path}`}
                      alt="تصویر دوره"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-48 h-32 bg-gray-100 rounded-md">
                    <p className="text-gray-500 text-sm">بدون تصویر</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <label 
                  htmlFor="thumbnail_path" 
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>انتخاب تصویر</span>
                </label>
                <input
                  type="file"
                  id="thumbnail_path"
                  name="thumbnail_path"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
                {newThumbnail && (
                  <span className="text-sm text-green-600">
                    {newThumbnail.name}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_premium">پریمیوم</Label>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="is_premium"
                  checked={course.is_premium}
                  onCheckedChange={(checked) => setCourse({ ...course, is_premium: checked })}
                />
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