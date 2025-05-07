'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';

interface Article {
  id: number;
  title: string;
  content: string;
  is_special: boolean;
  thumbnail_path?: string;
}

export default function EditArticlePage({ params }: { params: { id: string } }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchArticle();
  }, [params.id]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${params.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت مقاله');
      }

      const data = await response.json();
      setArticle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت مقاله');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    // is_premium checkbox handling
    if (!formData.has('is_premium')) {
      formData.set('is_premium', 'off');
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${params.id}`, {
        method: 'POST', // اگر بک‌اند PATCH یا PUT می‌خواهد، اینجا تغییر بده
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        throw new Error('خطا در بروزرسانی مقاله');
      }

      router.push('/admin/articles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بروزرسانی مقاله');
    } finally {
      setSaving(false);
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

  if (!article) {
    return (
      <div className="text-center text-gray-500 p-6">
        <p>مقاله مورد نظر یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ویرایش مقاله</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان</Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={article.title}
              placeholder="عنوان مقاله را وارد کنید"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">محتوا</Label>
            <Textarea
              id="content"
              name="content"
              required
              defaultValue={article.content}
              placeholder="محتوا مقاله را وارد کنید"
              className="min-h-[200px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail_path">تصویر بندانگشتی</Label>
            {article.thumbnail_path && (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${article.thumbnail_path}`}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="is_premium">پریمیوم</Label>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="is_premium"
                name="is_premium"
                checked={article.is_special}
                onCheckedChange={(checked) => setArticle({ ...article, is_special: checked })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  article.is_special ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    article.is_special ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </Switch>
              <span className={article.is_special ? 'text-green-500' : 'text-gray-500'}>
                {article.is_special ? 'فعال' : 'غیرفعال'}
              </span>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              انصراف
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}