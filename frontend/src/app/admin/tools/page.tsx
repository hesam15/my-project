'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, Pencil, Trash2, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { toast } from 'react-hot-toast';
import { managementTools } from '@/lib/api';
import Image from 'next/image';
import { useAlert } from '@/contexts/AlertContext';

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await managementTools.getAll();
        setTools(response.data);
      } catch {
        showAlert('خطا در دریافت لیست ابزارها', 'danger');
        toast.error('خطا در دریافت لیست ابزارها');
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, [showAlert]);

  const handleDelete = async (id: string) => {
    try {
      await managementTools.delete(id);
      setTools(tools.filter(tool => tool.id !== Number(id)));
      showAlert('ابزار با موفقیت حذف شد', 'success');
      toast.success('ابزار با موفقیت حذف شد');
    } catch {
      showAlert('خطا در حذف ابزار', 'danger');
      toast.error('خطا در حذف ابزار');
    }
  };

  if (loading) {
    return (
      <div className="text-center p-6">
        <p>در حال بارگذاری...</p>
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
                      {tool.thumbnail_path ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${tool.thumbnail_path}`}
                          alt={tool.name}
                          width={80}
                          height={48}
                          className="w-20 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-gray-400">بدون تصویر</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">{tool.name}</td>
                    <td className="p-4 max-w-xs line-clamp-2">{tool.description}</td>
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
                          onClick={() => window.open(`${process.env.NEXT_PUBLIC_APP_URL}/tools/${tool.id}`, '_blank')}                          title="مشاهده"
                          title="مشاهده جزئیات"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/tools/edit/${tool.id}`)}
                          title="ویرایش"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleteId(tool.id.toString());
                            setConfirmOpen(true);
                          }}
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
        message="آیا از حذف این ابزار اطمینان دارید؟"
        onConfirm={() => {
          if (deleteId) {
            handleDelete(deleteId);
            setConfirmOpen(false);
          }
        }}
        onCancel={() => setConfirmOpen(false)}
      />

      <Button
        className="fixed bottom-20 left-4 w-12 h-12 rounded-full shadow-lg"
        onClick={() => router.push('/tools/new')}
        title="ایجاد ابزار جدید"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}