'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { posts } from '@/lib/api';
import { Eye, Pencil, Trash2, Crown, Plus, ArrowUpDown, BookOpen } from 'lucide-react';
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
  }, [showAlert])

  const handleEdit = (id: string) => {
    router.push(`/articles/edit/${id}`);
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
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
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
                        {article.is_premium ? (
                          <div className="flex items-center gap-1 text-purple-500">
                            <Crown className="w-4 h-4" />
                            <span className="text-sm">پریمیوم</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-500">
                            <span className="text-sm">عادی</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`${process.env.NEXT_PUBLIC_APP_URL}/articles/${article.id}`, '_blank')}
                          title="مشاهده"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
        onClick={() => router.push('/articles/new')}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}