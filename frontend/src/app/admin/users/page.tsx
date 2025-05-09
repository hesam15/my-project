'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { users } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pencil, Trash2, Plus } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const [usersList, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await users.getAll();
        setUsers(response.data);
      } catch {
        toast.error('خطا در دریافت لیست کاربران');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await users.delete(id.toString());
      setUsers(usersList.filter(user => user.id !== id));
      toast.success('کاربر با موفقیت حذف شد');
    } catch {
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
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right p-4">نام</th>
                <th className="text-right p-4">ایمیل</th>
                <th className="text-right p-4">نقش</th>
                <th className="text-right p-4">عملیات</th>
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
                  <tr key={user.id} className="border-b">
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.role === 'admin' ? 'مدیر' : 'کاربر'}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/users/edit/${user.id}`)}
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
        onClick={() => router.push('/admin/users/new')}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}