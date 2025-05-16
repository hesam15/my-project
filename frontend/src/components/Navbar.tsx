'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthContext } from '@/contexts/AuthContext';
import { User2, ArrowRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavbarProps {
  title: string;
  icon?: React.ReactNode;
}

const pageTitles: Record<string, string> = {
  '/': 'داشبورد',
  '/tools': 'ابزارهای مدیریتی',
  '/articles': 'مقالات',
  '/media': 'رسانه',
  '/consultation': 'مشاوره',
  '/customer': 'پروفایل من',
  '/login': 'ورود',
  '/register': 'ثبت نام',
  '/tools/new': 'افزودن ابزار جدید',
  '/courses/new': 'افزودن دوره جدید',
  '/premium/buy': 'خرید اشتراک پریمیوم',
  '/wallet/charge': 'شارژ کیف پول',
  '/courses': 'مدیریت دوره‌ها',
  '/courses/edit': 'ویرایش دوره',
  '/users': 'مدیریت کاربران',
  '/admin/posts/new': 'افزودن مقاله جدید',
  '/articles/edit': 'ویرایش مقاله',
  '/tools/new': 'افزودن ابزار جدید',
  '/tools/edit': 'ویرایش ابزار',
  '/reservations': 'مدیریت رزروها',
  '/reservations/new': 'افزودن رزرو',
  '/consultations': 'مشاوره ها',
  '/consultations/new': 'افزودن مشاوره جدید',
  '/consultations/edit': 'ویرایش مشاوره',
  '/comments': 'مدیریت نظرات',
};

export default function Navbar({ title, icon }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthContext();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hostname = window.location.hostname;
    setIsAdmin(hostname.startsWith('admin.'));
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Navbar - Logout failed:', error);
    }
  };

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

  // نمایش عنوان صفحه
  const displayTitle = pageTitles[pathname] || title;

  // تعیین کلاس‌های نوبار
  const navbarClass = isAdmin 
  ? `w-full h-16 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b ${mounted ? 'z-40' : 'z-50'}`
  : `fixed top-0 left-0 right-0 w-full h-16 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b ${mounted ? 'z-40' : 'z-50'}`;
  const showBackButton = pathname !== '/';

  return (
    <nav className={navbarClass}>
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
              aria-label="بازگشت"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Image src="/images/logo.svg" alt="مدیریت" width={32} height={32} />
            <h1 className="text-lg font-bold text-gray-800">{displayTitle}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 relative">
          <div className="relative" ref={userMenuRef}>
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setUserMenuOpen((v) => !v)}
              aria-label="کاربر"
            >
              <User2 className="w-6 h-6" />
            </button>
            {userMenuOpen && (
              <div className="absolute left-0 top-12 min-w-[180px] bg-white rounded-lg shadow-lg border py-2 z-50 text-right">
                {!user ? (
                  <>
                    <Link href="/login" className="block px-4 py-2 hover:bg-gray-50">ورود</Link>
                    <Link href="/register" className="block px-4 py-2 hover:bg-gray-50">ثبت نام</Link>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">{user.name || 'کاربر'}</div>
                    {user.role === 'customer' && (
                      <Link href="/profile" className="block px-4 py-2 hover:bg-gray-50">داشبورد من</Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-right px-4 py-2 hover:bg-gray-50 text-red-600"
                    >
                      خروج
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
