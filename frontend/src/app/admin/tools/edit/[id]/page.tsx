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

interface Tool {
  id: number;
  name: string;
  description: string;
  thumbnail_path?: string;
  tool_path?: string;
  is_premium: boolean;
}

interface EditToolPageProps {
  params: {
    id: string
  }
}

export default function EditToolPage({ params }: EditToolPageProps) {
  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const toolId = unwrappedParams.id;
  
  const router = useRouter();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newThumbnail, setNewThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [newToolFile, setNewToolFile] = useState<File | null>(null);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (thumbnailPreview && !thumbnailPreview.startsWith('http')) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, []);

  useEffect(() => {
    const fetchTool = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tools/${toolId}`, {
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
    fetchTool();
  }, [toolId]);

  // Handle thumbnail file change
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    // Clean up previous preview URL if it exists and is not from the server
    if (thumbnailPreview && !thumbnailPreview.startsWith('http')) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    
    if (file) {
      setNewThumbnail(file);
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
    } else {
      setNewThumbnail(null);
      setThumbnailPreview(null);
    }
  };

  // Handle tool file change
  const handleToolFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewToolFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tool) return;

    const formData = new FormData();
    formData.append('name', tool.name);
    formData.append('description', tool.description);
    formData.append('is_premium', tool.is_premium.toString());
    
    // Add _method field for Laravel to handle it as PUT
    formData.append('_method', 'PUT');
    
    // Always send thumbnail information
    if (newThumbnail) {
      // If a new thumbnail was selected, send the file
      formData.append('thumbnail_path', newThumbnail);
    } else if (tool.thumbnail_path) {
      // If using existing thumbnail, send the path
      formData.append('existing_thumbnail_path', tool.thumbnail_path);
    }
    
    // Always send tool file information
    if (newToolFile) {
      // If a new tool file was selected, send the file
      formData.append('tool_file', newToolFile);
    } else if (tool.tool_path) {
      // If using existing tool file, send the path
      formData.append('tool_path', tool.tool_path);
    }

    setSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tools/${toolId}`, {
        method: 'POST', // Using POST with _method=PUT for file uploads
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
              {tool.tool_path && !newToolFile && (
                <div className="mt-2 mb-2">
                  <p className="text-sm text-gray-600">
                    فایل فعلی: {tool.tool_path.split('/').pop()}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <label 
                  htmlFor="tool_file" 
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>انتخاب فایل PDF</span>
                </label>
                <input
                  type="file"
                  id="tool_file"
                  name="tool_file"
                  accept="application/pdf"
                  onChange={handleToolFileChange}
                  className="hidden"
                />
                {newToolFile && (
                  <span className="text-sm text-green-600">
                    {newToolFile.name}
                  </span>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="thumbnail_path">تصویر (اختیاری، فقط تصویر)</Label>
              
              {/* Show thumbnail preview if available */}
              {thumbnailPreview ? (
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
              ) : tool.thumbnail_path ? (
                <div className="mt-2 mb-4">
                  <div className="relative w-48 h-32 overflow-hidden rounded-md">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${tool.thumbnail_path}`}
                      alt="تصویر ابزار"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              ) : null}
              
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
                  checked={tool.is_premium}
                  onCheckedChange={(checked) => setTool({ ...tool, is_premium: checked })}
                />
                <span className={tool.is_premium ? 'text-green-500' : 'text-gray-500'}>
                  {tool.is_premium ? 'فعال' : 'غیرفعال'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-200">
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