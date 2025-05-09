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
import Image from 'next/image';

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

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await posts.getAll()
        setArticles(response.data)
      } catch {
        toast.error('خطا در دریافت لیست مقالات')
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  const handleEdit = (id: string) => {
    router.push(`/admin/articles/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await posts.delete(id)
      setArticles(articles.filter(article => article.id !== id))
      toast.success('مقاله با موفقیت حذف شد')
    } catch {
      toast.error('خطا در حذف مقاله')
    }
  };

  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  return (
    <div className="space-y-6 w-full px-0 font-sans">
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
                      {article.thumbnail_path && (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${article.thumbnail_path}`}
                          alt={article.title}
                          width={80}
                          height={48}
                          className="w-20 h-12 object-cover rounded"
                        />
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
        onConfirm={() => {}}
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