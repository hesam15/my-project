'use client'

import { usePathname, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import BottomNavigation from '@/components/BottomNavigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { HomeIcon } from '@heroicons/react/24/outline'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = pathname.startsWith('/admin')

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
    <div className={isAdmin ? 'min-h-screen bg-gray-50' : 'min-h-screen bg-[#F3F3F3] flex justify-center items-start'}>
      {isAdmin ? (
        <main className="grid grid-cols-12 h-screen">
          {/* Sidebar */}
          <div className="col-span-2 border-l border-gray-200 bg-white">
            <AdminSidebar />
          </div>
          {/* Content Area: Navbar + Main Content */}
          <div className="col-span-10 flex flex-col">
            <Navbar title={getPageTitle(pathname)} icon={undefined} />
            <div className="flex-1 w-full pt-8 px-12 pb-8 overflow-y-auto">
              {children}
            </div>
          </div>
        </main>
      ) : (
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
      )}
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
  };
  if (pathname.startsWith('/admin')) {
    return adminPageTitles[pathname] || 'مدیریت';
  }
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