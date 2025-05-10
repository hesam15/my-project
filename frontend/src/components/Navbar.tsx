'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';
import { User2, Home } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  title: string;
  icon?: React.ReactNode;
}

const links = [
  { href: '/', label: 'خانه' },
  { href: '/about', label: 'درباره ما' },
  { href: '/contact', label: 'تماس با ما' },
];

export default function Navbar({ title, icon }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthContext();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdminSection = pathname.startsWith('/admin');
  const isAdminDashboard = pathname === '/admin';

  const adminPageTitles: { [key: string]: string } = {
    '/admin': 'داشبورد مدیریت',
    '/admin/users': 'مدیریت کاربران',
    '/admin/videos': 'مدیریت ویدیوها',
    '/admin/articles': 'مدیریت مقالات',
    '/admin/comments': 'مدیریت نظرات',
    '/admin/courses': 'مدیریت دوره‌ها',
    '/admin/videos/new': 'افزودن ویدیو',
    '/admin/articles/new': 'افزودن مقاله',
    '/admin/users/new': 'افزودن کاربر',
    '/admin/courses/new': 'افزودن دوره',
    '/admin/tools': 'مدیریت ابزارها',
    '/admin/consultations': 'مدیریت مشاوره‌ها',
    '/admin/consultations/reservations': 'مدیریت رزرواسیون‌ها',
    '/admin/consultations/new': 'افزودن مشاوره',
    '/admin/consultations/reservations/new': 'افزودن رزرواسیون',
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Navbar - Logout failed:', error);
    }
  };

  // Close user menu on outside click
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

  const displayTitle = isAdminSection ? (adminPageTitles[pathname] || title) : title;

  // Determine navbar classes based on admin section
  const navbarClass = isAdminSection
    ? `fixed top-0 left-0 right-80 h-16 bg-white border-b ${mounted ? 'z-40' : 'z-50'}`
    : `fixed top-0 left-0 right-0 w-full h-16 bg-white border-b ${mounted ? 'z-40' : 'z-50'}`;

  return (
    <nav className={navbarClass}>
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAdminSection && (
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Home className="w-5 h-5" />
            </Link>
          )}
          {!isAdminSection && icon}
          <h1 className="text-lg font-bold">{displayTitle}</h1>
        </div>
        <div className="flex items-center gap-2 relative">
          {/* User icon and dropdown */}
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
                    {user.role === 'admin' && (
                      <Link href="/admin" className="block px-4 py-2 hover:bg-gray-50">داشبورد مدیریت</Link>
                    )}
                    {user.role === 'customer' && (
                      <Link href="/customer" className="block px-4 py-2 hover:bg-gray-50">داشبورد من</Link>
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