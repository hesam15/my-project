import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, LayoutDashboard, Users, Video, FileText, BookOpen, MessageSquare, Wrench } from 'lucide-react';

const adminLinks = [
  { href: '/admin', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/admin/users', label: 'کاربران', icon: Users },
  { href: '/admin/videos', label: 'ویدیوها', icon: Video },
  { href: '/admin/articles', label: 'مقالات', icon: FileText },
  { href: '/admin/courses', label: 'دوره‌ها', icon: BookOpen },
  { href: '/admin/comments', label: 'نظرات', icon: MessageSquare },
  { href: '/admin/tools', label: 'ابزارها', icon: Wrench }, // لینک جدید برای ابزارها
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 right-0 z-[110] h-full w-64 bg-white shadow-lg border-l transition-transform duration-300
        ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b md:hidden">
          <span className="font-bold text-lg">مدیریت</span>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-4 md:pt-8">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-gray-700 hover:bg-primary/10 hover:text-primary font-medium ${pathname === link.href ? 'bg-primary/10 text-primary' : ''}`}
              onClick={onClose}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}