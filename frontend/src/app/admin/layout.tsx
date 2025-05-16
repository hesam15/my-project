'use client';

import { ReactNode, useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminGuard from '@/components/admin/AdminGuard';
import { usePathname } from 'next/navigation';
import '../globals.css'

const pageTitles: Record<string, string> = {
  '/': 'داشبورد',
  '/users': 'مدیریت کاربران',
  '/videos': 'مدیریت ویدیوها',
  '/articles': 'مدیریت مقالات',
  '/courses': 'مدیریت دوره‌ها',
  '/comments': 'مدیریت نظرات',
  '/tools': 'مدیریت ابزارها',
  '/consultations': 'مدیریت مشاوره‌ها',
  '/consultations/reservations': 'مدیریت رزرواسیون‌ها',
};

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const isAuthPage = pathname.includes('/login') || pathname.includes('/register');
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // تشخیص دستگاه موبایل و تنظیم وضعیت پیش‌فرض sidebar
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // بستن sidebar به صورت خودکار در حالت موبایل
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    // بررسی اولیه
    checkIfMobile();
    
    // اضافه کردن event listener برای تغییر سایز صفحه
    window.addEventListener('resize', checkIfMobile);
    
    // پاکسازی event listener
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  if (isAuthPage) {
    return <div className="min-h-screen">
      {children}
    </div>;
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-100 overflow-x-hidden">
        <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <AdminNavbar toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        
        {/* Overlay for mobile when sidebar is open */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}
        
        <main 
          className={`pt-20 transition-all duration-300 ${
            sidebarOpen ? (isMobile ? 'pr-0' : 'pr-80') : (isMobile ? 'pr-0' : 'pr-20')
          }`}
        >
          <div className={`
            px-4 py-4
            sm:px-6 
            md:px-8 
            lg:px-10 
            xl:px-12
            ${!isMobile ? 'max-w-full' : 'container mx-auto'}
          `}>
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
