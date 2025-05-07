'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewTool() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.append('is_premium', isPremium ? '1' : '0');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tools`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('خطا در ایجاد ابزار');
      }

      router.push('/admin/tools');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'خطا در ایجاد ابزار');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">افزودن ابزار جدید</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            نام ابزار
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
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            توضیحات
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="tool_file" className="block text-sm font-medium text-gray-700 mb-1">
            فایل ابزار (فقط PDF)
          </label>
          <input
            type="file"
            id="tool_file"
            name="tool_path"
            accept="application/pdf"
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="thumbnail_path" className="block text-sm font-medium text-gray-700 mb-1">
            تصویر (اختیاری، فقط تصویر)
          </label>
          <input
            type="file"
            id="thumbnail_path"
            name="thumbnail_path"
            accept="image/*"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="is_premium" className="block text-sm font-medium text-gray-700 mb-1">
            پریمیوم
          </label>
          <div className="flex items-center space-x-2 space-x-reverse">
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
          {loading ? 'در حال ثبت...' : 'ثبت ابزار'}
        </button>
      </form>
    </div>
  );
}