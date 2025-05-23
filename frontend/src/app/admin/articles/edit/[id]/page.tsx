'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { use } from 'react';
import { useAlert } from '@/contexts/AlertContext';

interface Article {
  id: number;
  title: string;
  content: string;
  is_premium: boolean;
  thumbnail_path?: string;
}

export default function EditArticlePage({ params }: { params: { id: string } }) {
  // Unwrap the params Promise with React.use()
  const unwrappedParams = use(params);
  const articleId = unwrappedParams.id;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { showAlert } = useAlert();

  const fetchArticle = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${articleId}`, {
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
      showAlert('خطا در دریافت مقاله', 'danger');
      if (process.env.NODE_ENV !== 'production') {
        // Log error for debugging
        // eslint-disable-next-line no-console
        console.error('Error fetching article:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]); // Use unwrapped articleId instead of params.id

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    
    // Handle is_premium as a boolean value
    formData.set('is_premium', article?.is_premium ? '1' : '0');
    
    // Add _method field for Laravel to handle it as PUT/PATCH
    formData.append('_method', 'PUT');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${articleId}`, {
        method: 'POST', // Using POST with _method field for Laravel
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        throw new Error('خطا در بروزرسانی مقاله');
      }

      showAlert('مقاله با موفقیت بروزرسانی شد', 'success');
      router.push('/admin/articles');
    } catch (err) {
      showAlert('خطا در بروزرسانی مقاله', 'danger');
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('Error updating article:', err);
      }
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

  if (!article) {
    return (
      <div className="text-center text-gray-500 p-6">
        <p>مقاله مورد نظر یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full px-0">
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
              <div className="mb-2">
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${article.thumbnail_path}`}
                  alt="thumbnail"
                  width={128}
                  height={80}
                  className="w-32 h-20 object-cover rounded"
                />
              </div>
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
                checked={article.is_premium}
                onCheckedChange={(checked: boolean) => setArticle({ ...article, is_premium: checked })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  article.is_premium ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    article.is_premium ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </Switch>
              <span className={article.is_premium ? 'text-green-500' : 'text-gray-500'}>
                {article.is_premium ? 'فعال' : 'غیرفعال'}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button 
              type="submit" 
              disabled={saving} 
              variant="default"
            >
              {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}