import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Video, FileText, BookOpen, MessageSquare, Wrench, Calendar, Clock } from 'lucide-react';

const adminLinks = [
  { href: '/admin', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/admin/users', label: 'کاربران', icon: Users },
  { href: '/admin/videos', label: 'ویدیوها', icon: Video },
  { href: '/admin/articles', label: 'مقالات', icon: FileText },
  { href: '/admin/courses', label: 'دوره‌ها', icon: BookOpen },
  { href: '/admin/comments', label: 'نظرات', icon: MessageSquare },
  { href: '/admin/tools', label: 'ابزارها', icon: Wrench },
  { href: '/admin/consultations', label: 'مشاوره‌ها', icon: Calendar },
  { href: '/admin/consultations/reservations', label: 'رزرواسیون‌ها', icon: Clock },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="fixed top-0 right-0 h-screen w-80 bg-white border-l shadow-lg overflow-y-auto font-sans">
      <div className="p-6 border-b">
        <span className="font-bold text-lg">مدیریت</span>
      </div>
      <nav className="flex flex-col gap-2 p-6">
        {adminLinks.map((link) => {
          // برای داشبورد فقط مسیر دقیق
          if (link.href === '/admin') {
            const isActive = pathname === '/admin';
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-primary/10 hover:text-primary font-medium ${
                  isActive ? 'bg-primary/10 text-primary' : ''
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          }

          // برای بقیه مسیرها
          const isActive = pathname === link.href;
          const isChildRoute = pathname.startsWith(`${link.href}/`);
          
          // اگر مسیر فعلی زیرمسیر این لینک نباشه، فعال نشه
          if (isChildRoute && !isActive) {
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-primary/10 hover:text-primary font-medium"
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-primary/10 hover:text-primary font-medium ${
                isActive ? 'bg-primary/10 text-primary' : ''
              }`}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}