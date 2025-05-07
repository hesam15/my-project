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

interface StatCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const statCards: StatCard[] = [
  {
    title: 'کاربران',
    value: '0',
    icon: <Users className="h-6 w-6" />,
    href: '/admin/users',
    color: 'bg-blue-500'
  },
  {
    title: 'ویدیوها',
    value: '0',
    icon: <Video className="h-6 w-6" />,
    href: '/admin/videos',
    color: 'bg-red-500'
  },
  {
    title: 'مقالات',
    value: '0',
    icon: <FileText className="h-6 w-6" />,
    href: '/admin/articles',
    color: 'bg-green-500'
  },
  {
    title: 'نظرات',
    value: '0',
    icon: <MessageSquare className="h-6 w-6" />,
    href: '/admin/comments',
    color: 'bg-yellow-500'
  },
  {
    title: 'دوره‌ها',
    value: '0',
    icon: <BookOpen className="h-6 w-6" />,
    href: '/admin/courses',
    color: 'bg-purple-500'
  }
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">داشبورد مدیریت</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">فعالیت‌های اخیر</h2>
          <div className="space-y-4">
            {/* Activity items will be added here */}
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
              <span className="font-semibold">0</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 text-blue-500 ml-2" />
                <span>کامنت‌ها</span>
              </div>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Heart className="w-5 h-5 text-red-500 ml-2" />
                <span>لایک‌ها</span>
              </div>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-500 ml-2" />
                <span>محتوا ویژه</span>
              </div>
              <span className="font-semibold">0</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 