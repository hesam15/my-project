'use client'

import { usePathname, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import BottomNavigation from '@/components/BottomNavigation'
import { HomeIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

export default function Template({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  // بررسی دامنه برای تشخیص محیط ادمین
  useEffect(() => {
    setMounted(true);
    const hostname = window.location.hostname;
    setIsAdmin(hostname.startsWith('admin.'));
  }, []);

  // اگر هنوز کامپوننت mount نشده، یک رندر خنثی برمی‌گردانیم تا از ناهماهنگی SSR و CSR جلوگیری کنیم
  if (!mounted) {
    return <>{children}</>;
  }

  // اگر در بخش ادمین هستیم، فقط محتوا را نمایش می‌دهیم و اجازه می‌دهیم 
  // فایل admin/layout.tsx مدیریت داشبورد ادمین را به عهده بگیرد
  if (isAdmin) {
    return <>{children}</>;
  }

  const handleTabChange = (tabId: number) => {
    switch (tabId) {
      case 0:
        router.push('/')
        break
      case 1:
        router.push('/tools')
        break
      case 2:
        router.push('/articles')
        break
      case 3:
        router.push('/media')
        break
      case 4:
        router.push('/consultation')
        break
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F3F3] flex justify-center items-start">
      <div className="w-full max-w-[430px] min-h-screen bg-white relative mx-auto">
        {/* Navbar - Fixed to the glass */}
        <div className="fixed left-1/2 top-4 -translate-x-1/2 w-full max-w-[430px] px-4 z-50">
          <Navbar 
            title={getPageTitle(pathname)}
            icon={<HomeIcon className="w-5 h-5" />}
          />
        </div>
        <main className="pt-[calc(3.5rem+2rem)] pb-[calc(4rem+2rem)]">
          {children}
        </main>
        {/* Bottom Navigation - Fixed to the glass */}
        <div className="fixed left-1/2 bottom-4 -translate-x-1/2 w-full max-w-[430px] px-4 z-50">
          <BottomNavigation activeTab={getActiveTab(pathname)} onTabChange={handleTabChange} />
        </div>
      </div>
    </div>
  )
}

function getActiveTab(pathname: string): number {
  switch (pathname) {
    case '/':
      return 0
    case '/tools':
      return 1
    case '/articles':
      return 2
    case '/media':
      return 3
    case '/consultation':
      return 4
    default:
      return 0
  }
}

function getPageTitle(pathname: string): string {
  switch (pathname) {
    case '/':
      return 'داشبورد'
    case '/tools':
      return 'ابزارها'
    case '/articles':
      return 'مقالات'
    case '/media':
      return 'رسانه'
    case '/consultation':
      return 'مشاوره'
    default:
      return 'داشبورد'
  }
}
