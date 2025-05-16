'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowRight, Loader2, Upload } from 'lucide-react';
import Image from 'next/image';

export default function NewTool() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [toolFile, setToolFile] = useState<File | null>(null);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, []);

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

  // Handle tool file change
  const handleToolFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setToolFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.append('is_premium', isPremium ? '1' : '0');
    
    // Add files directly from state to ensure we're using the selected files
    if (thumbnail) {
      formData.append('thumbnail_path', thumbnail);
    }
    
    if (toolFile) {
      formData.append('tool_path', toolFile);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tools`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در ایجاد ابزار');
      }

      router.push('/admin/tools');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'خطا در ایجاد ابزار');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full px-0">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ایجاد ابزار جدید</h1>
      </div>

      <Card className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">نام ابزار</Label>
              <Input
                id="name"
                name="name"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">توضیحات</Label>
              <Textarea
                id="description"
                name="description"
                required
                rows={5}
              />
            </div>

            <div>
              <Label htmlFor="tool_file">فایل ابزار (فقط PDF)</Label>
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
                  name="tool_path"
                  accept="application/pdf"
                  onChange={handleToolFileChange}
                  required
                  className="hidden"
                />
                {toolFile && (
                  <span className="text-sm text-green-600">
                    {toolFile.name} ({(toolFile.size / 1024).toFixed(0)} KB)
                  </span>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="thumbnail_path">تصویر (اختیاری، فقط تصویر)</Label>
              
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

          <div className="pt-6 mt-6 border-t border-gray-200">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  ایجاد ابزار
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