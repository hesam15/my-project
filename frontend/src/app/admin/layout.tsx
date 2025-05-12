'use client';

import { ReactNode } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { usePathname } from 'next/navigation';
import '../globals.css'

const pageTitles: Record<string, string> = {
  '/admin': 'داشبورد',
  '/admin/users': 'مدیریت کاربران',
  '/admin/videos': 'مدیریت ویدیوها',
  '/admin/articles': 'مدیریت مقالات',
  '/admin/courses': 'مدیریت دوره‌ها',
  '/admin/comments': 'مدیریت نظرات',
  '/admin/tools': 'مدیریت ابزارها',
  '/admin/consultations': 'مدیریت مشاوره‌ها',
  '/admin/consultations/reservations': 'مدیریت رزرواسیون‌ها',
};

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  
  // پیدا کردن عنوان صفحه فعلی
  const currentTitle = Object.entries(pageTitles).find(([path]) => 
    pathname === path || pathname.startsWith(`${path}/`)
  )?.[1] || 'مدیریت';

  return (
      <div className="flex min-h-screen">
        <div className="flex-1">
          <main className={!['/login', '/register'].includes(pathname) ? "p-6" : '' }>
            {children}
          </main>
        </div>
      </div>
  );
} 