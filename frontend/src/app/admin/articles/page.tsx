'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { posts } from '@/lib/api';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

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
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await posts.getAll();
      setArticles(response.data);
    } catch (error) {
      toast.error('خطا در دریافت لیست مقالات');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/articles/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setConfirmOpen(false);
    setLoading(true);
    try {
      await posts.delete(deleteId);
      setArticles(articles.filter((a) => a.id !== deleteId));
      toast.success('مقاله با موفقیت حذف شد.');
    } catch (err: any) {
      toast.error('خطا در حذف مقاله');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>تصویر</TableHead>
                <TableHead>عنوان</TableHead>
                <TableHead>تاریخ ایجاد</TableHead>
                <TableHead>آخرین بروزرسانی</TableHead>
                <TableHead>نوع</TableHead>
                <TableHead className="text-left">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    پستی وجود ندارد
                  </TableCell>
                </TableRow>
              ) : (
                articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      {article.thumbnail_path ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${article.thumbnail_path}`}
                          alt={article.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>{article.title}</TableCell>
                    <TableCell>{new Date(article.created_at).toLocaleDateString('fa-IR')}</TableCell>
                    <TableCell>{new Date(article.updated_at).toLocaleDateString('fa-IR')}</TableCell>
                    <TableCell>
                      <span className={article.is_premium ? 'text-purple-600' : 'text-green-600'}>
                        {article.is_premium ? 'پریمیوم' : 'رایگان'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(article.id)}
                        >
                          ویرایش
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(article.id)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          حذف
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        message="آیا از حذف این مقاله اطمینان دارید؟"
        onConfirm={confirmDelete}
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