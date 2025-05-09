import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Video, FileText, BookOpen, MessageSquare, Wrench } from 'lucide-react';

const adminLinks = [
  { href: '/admin', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/admin/users', label: 'کاربران', icon: Users },
  { href: '/admin/videos', label: 'ویدیوها', icon: Video },
  { href: '/admin/articles', label: 'مقالات', icon: FileText },
  { href: '/admin/courses', label: 'دوره‌ها', icon: BookOpen },
  { href: '/admin/comments', label: 'نظرات', icon: MessageSquare },
  { href: '/admin/tools', label: 'ابزارها', icon: Wrench },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="h-full bg-white border-l shadow-lg overflow-y-auto font-sans">
      <div className="p-4 border-b">
        <span className="font-bold text-lg">مدیریت</span>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-gray-700 hover:bg-primary/10 hover:text-primary font-medium ${pathname === link.href ? 'bg-primary/10 text-primary' : ''}`}
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}