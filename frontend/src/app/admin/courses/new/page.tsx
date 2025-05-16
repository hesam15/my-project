'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { ArrowRight, Loader2, Upload } from 'lucide-react';
import Image from 'next/image';

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Clean up the object URL when component unmounts or when the thumbnail changes
  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  // Handle thumbnail file change
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    // Clean up previous preview URL if it exists
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    
    if (file) {
      setThumbnail(file);
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
    } else {
      setThumbnail(null);
      setThumbnailPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('is_premium', isPremium ? '1' : '0');
      
      if (thumbnail) {
        formData.append('thumbnail_path', thumbnail);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در ایجاد دوره');
      }

      router.push('/courses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ایجاد دوره');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full px-0">
      <Card className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">عنوان دوره</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">توضیحات</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
              />
            </div>

            <div>
              <Label htmlFor="thumbnail_path">تصویر دوره</Label>
              
              {/* Only show the preview if a thumbnail has been selected */}
              {thumbnailPreview && (
                <div className="mt-2 mb-4">
                  <div className="relative w-48 h-32 overflow-hidden rounded-md">
                    <Image
                      src={thumbnailPreview}
                      alt="پیش‌نمایش تصویر"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-2">
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
                {thumbnail && (
                  <span className="text-sm text-green-600">
                    {thumbnail.name}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_premium">پریمیوم</Label>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="is_premium"
                  checked={isPremium}
                  onCheckedChange={setIsPremium}
                />
                <span className={isPremium ? 'text-green-500' : 'text-gray-500'}>
                  {isPremium ? 'فعال' : 'غیرفعال'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  ایجاد دوره
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