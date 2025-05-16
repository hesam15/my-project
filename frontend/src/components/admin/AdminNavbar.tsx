'use client';

import { usePathname } from 'next/navigation';
import { Menu, BellIcon, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import Image from 'next/image';

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

interface AdminNavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function AdminNavbar({ toggleSidebar, isSidebarOpen }: AdminNavbarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuthContext();
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // پیدا کردن عنوان صفحه فعلی
  const currentTitle = Object.entries(pageTitles).find(([path]) => 
    pathname === path || pathname.startsWith(`${path}/`)
  )?.[1] || 'مدیریت';

  // تشخیص دستگاه موبایل
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // بررسی اولیه
    checkIfMobile();
    
    // اضافه کردن event listener برای تغییر سایز صفحه
    window.addEventListener('resize', checkIfMobile);
    
    // پاکسازی event listener
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // کلیک خارج از منوی کاربر
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  // ایجاد کلاس نوبار بر اساس وضعیت سایدبار
  const navbarClass = `fixed top-0 left-0 h-16 bg-white border-b z-40 transition-all duration-300 ${
    isSidebarOpen ? (isMobile ? 'right-0' : 'right-80') : (isMobile ? 'right-0' : 'right-20')
  }`;

  return (
    <nav className={navbarClass}>
      <div className="h-full flex items-center justify-between px-4 sm:px-6">
        {/* عنوان صفحه و دکمه منو */}
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
            aria-label="منوی اصلی"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* لوگو */}
          <div className="flex items-center gap-2">
            <Image src="/images/logo.svg" alt="مدیریت" width={32} height={32} />
            <h1 className="text-lg font-bold hidden sm:block">{currentTitle}</h1>
            <h1 className="text-md font-bold sm:hidden">{currentTitle}</h1>
          </div>
        </div>
        
        {/* آیکون‌های سمت چپ نوبار */}
        <div className="flex items-center gap-3">
          {/* منوی کاربر */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100"
              aria-label="منوی کاربر"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <span className="hidden md:block">{user?.name || 'مدیر سیستم'}</span>
            </button>
            
            {userMenuOpen && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                <div className="px-4 py-2 text-sm font-semibold border-b">
                  {user?.name || 'مدیر سیستم'}
                </div>
                <button
                  onClick={() => {
                    logout?.();
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  خروج از حساب
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
