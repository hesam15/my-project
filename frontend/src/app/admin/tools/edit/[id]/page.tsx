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

interface Tool {
  id: number;
  name: string;
  description: string;
  thumbnail_path?: string;
  is_premium: boolean;
}

export default function EditToolPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTool();
  }, [params.id]);

  const fetchTool = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tools/${params.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت اطلاعات ابزار');
      }

      const data = await response.json();
      setTool(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات ابزار');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tool) return;

    const formData = new FormData(e.currentTarget);
    formData.append('name', tool.name);
    formData.append('description', tool.description);
    formData.append('is_premium', tool.is_premium.toString());

    setSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tools/${params.id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('خطا در بروزرسانی ابزار');
      }

      router.push('/admin/tools');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بروزرسانی ابزار');
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

  if (!tool) {
    return (
      <div className="text-center p-6">
        <p>ابزار مورد نظر یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ویرایش ابزار</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">نام ابزار</Label>
              <Input
                id="name"
                value={tool.name}
                onChange={(e) => setTool({ ...tool, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">توضیحات</Label>
              <Textarea
                id="description"
                value={tool.description}
                onChange={(e) => setTool({ ...tool, description: e.target.value })}
                required
                rows={5}
              />
            </div>

            <div>
              <Label htmlFor="tool_file">فایل ابزار (فقط PDF)</Label>
              <input
                type="file"
                id="tool_file"
                name="tool_file"
                accept="application/pdf"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <Label htmlFor="thumbnail_path">تصویر (اختیاری، فقط تصویر)</Label>
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
                  checked={tool.is_premium}
                  onCheckedChange={(checked) => setTool({ ...tool, is_premium: checked })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                    tool.is_premium ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                      tool.is_premium ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </Switch>
                <span className={tool.is_premium ? 'text-green-500' : 'text-gray-500'}>
                  {tool.is_premium ? 'فعال' : 'غیرفعال'}
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