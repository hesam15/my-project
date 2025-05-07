'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { posts } from '@/lib/api';
import { toast } from 'sonner';

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData(e.currentTarget);
      formData.append('is_premium', isPremium.toString());
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      toast.success('مقاله با موفقیت ایجاد شد');
      router.push('/admin/articles');
    } catch (error) {
      setError('خطا در ایجاد مقاله');
      toast.error('خطا در ایجاد مقاله');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>ایجاد مقاله جدید</CardTitle>
        </CardHeader>
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
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
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

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/articles')}
              >
                انصراف
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'در حال ذخیره...' : 'ذخیره'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}