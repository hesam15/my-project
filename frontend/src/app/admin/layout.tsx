'use client';

import { useState, useEffect } from 'react';
import { Plus, Menu, X, LayoutDashboard, Users, Video, FileText, BookOpen, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AdminSidebar from '@/components/admin/AdminSidebar';

const actionButtons = {
  '/admin/courses': { href: '/admin/courses/new', label: 'افزودن دوره' },
  '/admin/videos': { href: '/admin/videos/new', label: 'افزودن ویدیو' },
  '/admin/posts': { href: '/admin/posts/new', label: 'افزودن پست' },
  '/admin/users': { href: '/admin/users/new', label: 'افزودن کاربر' },
};

const adminLinks = [
  { href: '/admin', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/admin/users', label: 'کاربران', icon: Users },
  { href: '/admin/videos', label: 'ویدیوها', icon: Video },
  { href: '/admin/articles', label: 'مقالات', icon: FileText },
  { href: '/admin/courses', label: 'دوره‌ها', icon: BookOpen },
  { href: '/admin/comments', label: 'نظرات', icon: MessageSquare },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Listen for open-admin-sidebar event from Navbar
  useEffect(() => {
    const handler = () => setSidebarOpen(true);
    document.addEventListener('open-admin-sidebar', handler);
    return () => document.removeEventListener('open-admin-sidebar', handler);
  }, []);

  // Determine page title for Navbar
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
  const pageTitle = adminPageTitles[pathname] || 'مدیریت';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sidebar as drawer, overlays content, high z-index */}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Main Content */}
      <main className="flex-1 pb-20">
        <div className="max-w-[900px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
} 