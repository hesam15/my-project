'use client';

import { Card } from '@/components/ui/card';
import { 
  Users, 
  BookOpen, 
  Video, 
  FileText, 
  Wallet, 
  MessageSquare, 
  Heart, 
  Star 
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface StatCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    videos: 0,
    posts: 0,
    comments: 0,
    courses: 0,
    likes: 0,
    balances: 0,
    consultation: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // لاگ کردن آدرس API برای دیباگ
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        console.log('API URL:', apiUrl);
        if (!apiUrl) {
          throw new Error('متغیر NEXT_PUBLIC_API_URL تنظیم نشده است');
        }

        const response = await fetch(`${apiUrl}/api/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text(); // متن پاسخ برای دیباگ
          console.error('Fetch error:', {
            status: response.status,
            statusText: response.statusText,
            responseText: errorText,
          });
          throw new Error(`خطا در دریافت آمار: ${response.status} ${response.statusText}`);
        }

        // بررسی نوع محتوا
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const errorText = await response.text();
          console.error('Non-JSON response:', errorText);
          throw new Error('پاسخ سرور JSON نیست');
        }

        const data = await response.json();
        console.log('API response:', data); // لاگ کردن داده‌های دریافتی
        setStats({
          users: data.users ?? 0,
          videos: data.videos ?? 0,
          posts: data.posts ?? 0,
          comments: data.comments ?? 0,
          courses: data.courses ?? 0,
          likes: data.likes ?? 0,
          balances: data.balances ?? 0,
          consultation: data.consultation ?? 0,
        });
      } catch (error: any) {
        console.error('Error fetching stats:', error);
        setError(error.message || 'خطا در دریافت آمار');
        toast.error(error.message || 'خطا در دریافت آمار');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards: StatCard[] = [
    {
      title: 'کاربران',
      value: loading ? '...' : stats.users.toString(),
      icon: <Users className="h-6 w-6" />,
      href: '/users',
      color: 'bg-blue-500'
    },
    {
      title: 'ویدیوها',
      value: loading ? '...' : stats.videos.toString(),
      icon: <Video className="h-6 w-6" />,
      href: '/videos',
      color: 'bg-red-500'
    },
    {
      title: 'مقالات',
      value: loading ? '...' : stats.posts.toString(),
      icon: <FileText className="h-6 w-6" />, 
      href: '/articles',
      color: 'bg-green-500'
    },
    {
      title: 'نظرات',
      value: loading ? '...' : stats.comments.toString(),
      icon: <MessageSquare className="h-6 w-6" />, 
      href: '/comments',
      color: 'bg-yellow-500'
    },
    {
      title: 'دوره‌ها',
      value: loading ? '...' : stats.courses.toString(),
      icon: <BookOpen className="h-6 w-6" />, 
      href: '/courses',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="w-full space-y-8">
      {error && (
        <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {statCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="p-6 hover:bg-accent transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-full ${card.color} text-white`}>
                  {card.icon}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">فعالیت‌های اخیر</h2>
          <div className="space-y-4">
            <p className="text-gray-500">هیچ فعالیتی ثبت نشده است.</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">آمار کلی</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Wallet className="w-5 h-5 text-green-500 ml-2" />
                <span>کیف پول فعال</span>
              </div>
              <span className="font-semibold">{loading ? '...' : stats.balances}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Heart className="w-5 h-5 text-red-500 ml-2" />
                <span>لایک‌ها</span>
              </div>
              <span className="font-semibold">{loading ? '...' : stats.likes}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-500 ml-2" />
                <span>محتوا ویژه</span>
              </div>
              <span className="font-semibold">{loading ? '...' : stats.consultation}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}