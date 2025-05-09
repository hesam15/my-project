"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "admin") {
        router.replace("/");
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return <div className="text-center p-8">در حال بررسی دسترسی...</div>;
  }

  return <>{children}</>;
} 