'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { users } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pencil, Trash2, Plus } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAlert } from '@/contexts/AlertContext';

interface User {
  id: number;
  name: string;
  phone: string;
  role: string;
}

export default function UsersPage() {
  const [usersList, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await users.getAll();
        setUsers(response.data);
      } catch {
        showAlert('خطا در دریافت لیست کاربران', 'danger');
        toast.error('خطا در دریافت لیست کاربران');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [showAlert]);

  const handleDelete = async (id: number) => {
    try {
      await users.delete(id.toString());
      setUsers(usersList.filter(user => user.id !== id));
      showAlert('کاربر با موفقیت حذف شد', 'success');
      toast.success('کاربر با موفقیت حذف شد');
    } catch {
      showAlert('خطا در حذف کاربر', 'danger');
      toast.error('خطا در حذف کاربر');
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
      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full" dir="rtl">
            <thead>
              <tr className="border-b">
                <th className="text-right p-4 w-1/4">نام</th>
                <th className="text-right p-4 w-1/4">شماره تلفن</th>
                <th className="text-right p-4 w-1/4">نقش</th>
                <th className="text-right p-4 w-1/4">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {usersList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-4 text-gray-500">
                    هیچ کاربری یافت نشد
                  </td>
                </tr>
              ) : (
                usersList.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.phone}</td>
                    <td className="p-4">{user.role === 'admin' ? 'مدیر' : 'کاربر'}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/users/edit/${user.id}`)}
                          title="ویرایش"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleteId(user.id);
                            setConfirmOpen(true);
                          }}
                          title="حذف"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/reservations/new?user_phone=${encodeURIComponent(user.phone)}`)}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          title="رزرو مشاوره"
                        >
                          رزرو مشاوره
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
        message="آیا از حذف این کاربر اطمینان دارید؟"
        onConfirm={() => {
          if (deleteId !== null) {
            handleDelete(deleteId);
            setConfirmOpen(false);
          }
        }}
        onCancel={() => setConfirmOpen(false)}
      />

      <Button
        className="fixed bottom-20 left-4 w-12 h-12 rounded-full shadow-lg"
        onClick={() => router.push('/users/new')}
        title="ایجاد کاربر جدید"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}