"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (user.role !== "admin") {
        router.replace("/");
      }
    }
  }, [user, loading, router, pathname]);

  if (loading || !user || user.role !== "admin") {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-lg font-semibold mb-2">در حال بررسی دسترسی...</div>
        <div className="text-sm text-gray-500">لطفاً صبر کنید</div>
      </div>
    </div>;
  }

  return <>{children}</>;
}