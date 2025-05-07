'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { videos } from '@/lib/api';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Video {
  id: number;
  title: string;
  description: string;
  thumbnail_path?: string;
  video_path: string;
  duration: string;
  views_count: number;
  created_at: string;
  is_premium: boolean;
}

export default function VideosPage() {
  const [videosList, setVideosList] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await videos.getAll();
      setVideosList(response.data);
    } catch (err) {
      setError('خطا در دریافت ویدیوها');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setConfirmOpen(false);
    setLoading(true);
    setError(null);
    try {
      await videos.delete(deleteId);
      fetchVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف ویدیو');
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

  if (error) {
    return (
      <div className="text-center text-red-500 p-6">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">مدیریت ویدیوها</h1>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right p-4">تصویر</th>
                <th className="text-right p-4">عنوان</th>
                <th className="text-right p-4">مدت زمان</th>
                <th className="text-right p-4">بازدید</th>
                <th className="text-right p-4">نوع</th>
                <th className="text-right p-4">تاریخ انتشار</th>
                <th className="text-right p-4">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {videosList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-4 text-gray-500">
                    هیچ ویدیویی یافت نشد
                  </td>
                </tr>
              ) : (
                videosList.map((video) => (
                  <tr key={video.id} className="border-b">
                    <td className="p-4">
                      {video.thumbnail_path && (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${video.thumbnail_path}`}
                          alt={video.title}
                          className="w-20 h-12 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="p-4">{video.title}</td>
                    <td className="p-4">{video.duration}</td>
                    <td className="p-4">{video.views_count}</td>
                    <td className="p-4">
                      <span className={video.is_premium ? 'text-purple-600' : 'text-green-600'}>
                        {video.is_premium ? 'پریمیوم' : 'رایگان'}
                      </span>
                    </td>
                    <td className="p-4">{new Date(video.created_at).toLocaleDateString('fa-IR')}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/videos/${video.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/videos/edit/${video.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(video.id)}
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
        open={confirmOpen}
        message="آیا از حذف این ویدیو اطمینان دارید؟"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      <Button
        className="fixed bottom-20 left-4 w-12 h-12 rounded-full shadow-lg"
        onClick={() => router.push('/admin/videos/new')}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}