'use client';

import { usePathname } from 'next/navigation';

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

export default function AdminNavbar() {
  const pathname = usePathname();
  
  // پیدا کردن عنوان صفحه فعلی
  const currentTitle = Object.entries(pageTitles).find(([path]) => 
    pathname === path || pathname.startsWith(`${path}/`)
  )?.[1] || 'مدیریت';

  return (
    <div className="fixed top-0 left-0 right-80 h-16 bg-white border-b z-10">
      <div className="h-full flex items-center px-6">
        <h1 className="text-lg font-bold">{currentTitle}</h1>
      </div>
    </div>
  );
} 