'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { posts } from '@/lib/api';
import { Plus } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Image from 'next/image';
import { useAlert } from '@/contexts/AlertContext';

interface Article {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  thumbnail_path?: string;
  is_premium: boolean;
}

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await posts.getAll()
        setArticles(response.data)
      } catch {
        showAlert('خطا در دریافت لیست مقالات', 'danger');
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  const handleEdit = (id: string) => {
    router.push(`/admin/articles/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    try {
      await posts.delete(selectedId);
      setArticles(articles.filter(article => article.id !== selectedId));
      showAlert('مقاله با موفقیت حذف شد', 'success');
    } catch {
      showAlert('خطا در حذف مقاله', 'danger');
    } finally {
      setConfirmOpen(false);
      setSelectedId(null);
    }
  };

  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  return (
    <div className="space-y-6 w-full px-0 font-sans">
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right p-4">تصویر</th>
                <th className="text-right p-4">عنوان</th>
                <th className="text-right p-4">تاریخ ایجاد</th>
                <th className="text-right p-4">آخرین بروزرسانی</th>
                <th className="text-right p-4">نوع</th>
                <th className="text-right p-4">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-500">
                    پستی وجود ندارد
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id} className="border-b">
                    <td className="p-4">
                      <div className="relative w-32 h-20 bg-gray-100 rounded overflow-hidden">
                        {article.thumbnail_path ? (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${article.thumbnail_path}`}
                            alt={article.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <BookOpen className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{article.title}</div>
                    </td>
                    <td className="p-4">
                      {new Date(article.created_at).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="p-4">
                      {new Date(article.updated_at).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {article.is_premium && (
                          <div className="flex items-center gap-1 text-purple-500">
                            <Crown className="w-4 h-4" />
                            <span className="text-sm">پریمیوم</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(article.id)}
                          title="ویرایش"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(article.id)}
                          title="حذف"
                          className="text-red-500 hover:text-red-700"
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
        message="آیا از حذف این مقاله اطمینان دارید؟"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      <Button
        className="fixed bottom-20 left-4 w-12 h-12 rounded-full shadow-lg"
        onClick={() => router.push('/admin/articles/new')}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}