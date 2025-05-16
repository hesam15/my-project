'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Users, 
  Video, 
  FileText, 
  BookOpen, 
  MessageSquare, 
  Wrench, 
  Calendar, 
  Clock, 
  ChevronRight,
  X,
  Menu
} from 'lucide-react';

const adminLinks = [
  { href: '/', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/users', label: 'کاربران', icon: Users },
  { href: '/videos', label: 'ویدیوها', icon: Video },
  { href: '/articles', label: 'مقالات', icon: FileText },
  { href: '/courses', label: 'دوره‌ها', icon: BookOpen },
  { href: '/comments', label: 'نظرات', icon: MessageSquare },
  { href: '/tools', label: 'ابزارها', icon: Wrench },
  { href: '/consultations', label: 'مشاوره‌ها', icon: Calendar },
  { href: '/reservations', label: 'رزروی ها', icon: Calendar }
];

interface AdminSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function AdminSidebar({ isOpen = true, toggleSidebar }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // تشخیص دستگاه موبایل
  useEffect(() => {
    setMounted(true);
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

  if (!mounted) {
    return null; // جلوگیری از رندر سرور و کلاینت متفاوت
  }

  // کلاس های sidebar بر اساس وضعیت باز/بسته بودن
  const sidebarClasses = `fixed top-0 right-0 h-screen bg-white border-l shadow-lg overflow-y-auto 
    transition-all duration-300 z-30
    ${isOpen 
      ? 'w-80 translate-x-0 opacity-100' 
      : (isMobile 
        ? 'w-0 translate-x-full opacity-0' 
        : 'w-20 translate-x-0 opacity-100'
      )
    }`;
  
  return (
    <aside className={sidebarClasses}>
      <div className={`p-6 border-b flex justify-between items-center ${!isOpen && !isMobile ? 'justify-center p-4' : ''}`}>
        <div className="flex items-center gap-2">
          <Image 
            src="/images/logo.svg" 
            alt="مدیریت" 
            width={24} 
            height={24} 
            className={!isOpen && !isMobile ? "mx-auto" : ""}
          />
          <span className={`font-bold text-lg ${!isOpen && !isMobile ? 'hidden' : ''}`}>مدیریت</span>
        </div>
        
        {/* دکمه بستن منو در حالت موبایل */}
        {isMobile && isOpen && (
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="بستن منو"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        {/* دکمه باز/بسته کردن منو در حالت دسکتاپ */}
        {!isMobile && (
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100"
            aria-label={isOpen ? 'بستن منو' : 'باز کردن منو'}
          >
            <ChevronRight className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
      
      <nav className={`flex flex-col gap-2 ${isOpen || isMobile ? 'p-6' : 'p-3'}`}>
        {adminLinks.map((link) => {
          const linkPath = link.href;
          const isActive = pathname === linkPath || pathname === '/admin' + linkPath;
          const isChildRoute = (pathname.startsWith(linkPath) && linkPath !== '/') || 
                              (pathname.startsWith('/admin' + linkPath) && linkPath !== '/');
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={linkPath}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors 
                ${(isActive || isChildRoute)
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
                } 
                ${!isOpen && !isMobile ? 'justify-center px-2' : ''}`}
              onClick={isMobile ? toggleSidebar : undefined}
            >
              <Icon className="w-5 h-5" />
              <span className={!isOpen && !isMobile ? 'hidden' : ''}>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
