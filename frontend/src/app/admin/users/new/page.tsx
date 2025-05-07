'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewUser() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        password: formData.get('password'),
        password_confirmation: formData.get('password_confirmation'),
        role: formData.get('role'),
        is_premium: isPremium,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('خطا در ایجاد کاربر');
      }

      router.push('/admin/users');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'خطا در ایجاد کاربر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">افزودن کاربر جدید</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            نام
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            شماره موبایل
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            رمز عبور
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
            تکرار رمز عبور
          </label>
          <input
            type="password"
            id="password_confirmation"
            name="password_confirmation"
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            نقش کاربر
          </label>
          <select
            id="role"
            name="role"
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="customer">کاربر عادی</option>
            <option value="admin">مدیر</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="is_premium" className="block text-sm font-medium text-gray-700 mb-1">
            پریمیوم
          </label>
          <div className="flex items-center space-x-2">
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out">
              <input
                type="checkbox"
                id="is_premium"
                name="is_premium"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  isPremium ? 'bg-green-500' : 'bg-gray-300'
                } appearance-none cursor-pointer`}
              />
              <span
                className={`absolute inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  isPremium ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </div>
            <span className={isPremium ? 'text-green-500' : 'text-gray-500'}>
              {isPremium ? 'فعال' : 'غیرفعال'}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'در حال ثبت...' : 'ثبت کاربر'}
        </button>
      </form>
    </div>
  );
}