'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, Pencil, Trash2, Shield, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  last_login?: string;
  is_premium: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت کاربران');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت کاربران');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('آیا از حذف این کاربر اطمینان دارید؟')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('خطا در حذف کاربر');
      }

      // Refresh users list
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف کاربر');
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
                <th className="text-right p-4">نام</th>
                <th className="text-right p-4">ایمیل</th>
                <th className="text-right p-4">نقش</th>
                <th className="text-right p-4">نوع</th>
                <th className="text-right p-4">تاریخ عضویت</th>
                <th className="text-right p-4">آخرین ورود</th>
                <th className="text-right p-4">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-4 text-gray-500">
                    هیچ کاربری یافت نشد
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? 'مدیر' : 'کاربر'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={user.is_premium ? 'text-purple-600' : 'text-green-600'}>
                        {user.is_premium ? 'پریمیوم' : 'عادی'}
                      </span>
                    </td>
                    <td className="p-4">{new Date(user.created_at).toLocaleDateString('fa-IR')}</td>
                    <td className="p-4">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString('fa-IR') : '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
                          onClick={() => router.push(`/admin/users/roles/${user.id}`)}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user.id)}
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
      <Button
        className="fixed bottom-20 left-4 w-12 h-12 rounded-full shadow-lg"
        onClick={() => router.push('/admin/users/new')}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}