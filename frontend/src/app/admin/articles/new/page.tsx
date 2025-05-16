'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAlert } from '@/contexts/AlertContext';

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const { showAlert } = useAlert();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.append('is_premium', isPremium.toString());
      if (thumbnail) {
        formData.append('thumbnail_path', thumbnail);
      }
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      showAlert('مقاله با موفقیت ایجاد شد', 'success');
      router.push('/articles');
    } catch {
      showAlert('خطا در ایجاد مقاله', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Suspense fallback={<div>در حال بارگذاری...</div>}>
      <div className="space-y-6 w-full px-0 py-6">
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان</Label>
                <Input
                  id="title"
                  name="title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">محتوا</Label>
                <Textarea
                  id="content"
                  name="content"
                  required
                  className="min-h-[200px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail_path">تصویر بندانگشتی</Label>
                <input
                  type="file"
                  id="thumbnail_path"
                  name="thumbnail_path"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {thumbnail && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(thumbnail)}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
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

              <div className="pt-6 mt-6 border-t border-gray-200">
              <Button type="submit" variant="default">
                ذخیره تغییرات
              </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Suspense>
  );
}