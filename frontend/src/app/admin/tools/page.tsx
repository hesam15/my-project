'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, Pencil, Trash2, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Tool {
  id: number;
  name: string;
  description: string;
  thumbnail_path?: string;
  is_premium: boolean;
}

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tools`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت ابزارها');
      }

      const data = await response.json();
      setTools(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت ابزارها');
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tools/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('خطا در حذف ابزار');
      }

      fetchTools();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف ابزار');
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
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right p-4">تصویر</th>
                <th className="text-right p-4">نام</th>
                <th className="text-right p-4">توضیحات</th>
                <th className="text-right p-4">نوع</th>
                <th className="text-right p-4">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {tools.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-4 text-gray-500">
                    هیچ ابزاری یافت نشد
                  </td>
                </tr>
              ) : (
                tools.map((tool) => (
                  <tr key={tool.id} className="border-b">
                    <td className="p-4">
                      {tool.thumbnail_path && (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${tool.thumbnail_path}`}
                          alt={tool.name}
                          className="w-20 h-12 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="p-4">{tool.name}</td>
                    <td className="p-4">{tool.description}</td>
                    <td className="p-4">
                      <span className={tool.is_premium ? 'text-purple-600' : 'text-green-600'}>
                        {tool.is_premium ? 'پریمیوم' : 'رایگان'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/tools/${tool.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/tools/edit/${tool.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(tool.id)}
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
        message="آیا از حذف این ابزار اطمینان دارید؟"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      <Button
        className="fixed bottom-20 left-4 w-12 h-12 rounded-full shadow-lg"
        onClick={() => router.push('/admin/tools/new')}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}