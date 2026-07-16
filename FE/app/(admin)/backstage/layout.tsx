"use client";

import { AdminProvider } from "@/core/providers/admin-provider";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { AdminSidebar } from "@/features/admin/components/AdminSidebar";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = Cookies.get("admin_access_token");
    if (!token && !pathname.includes("/backstage/login")) {
      router.push("/backstage/login");
    } else {
      Promise.resolve().then(() => {
        setIsAuthorized(true);
      });
    }
  }, [pathname, router]);

  if (!isAuthorized) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" /></div>;
  }

  // If we are on the login page, don't render sidebar/header
  if (pathname === "/backstage/login") {
    return <>{children}</>;
  }

  return (
    <AdminProvider>
      <div className="min-h-screen bg-[#050505] flex text-slate-300">
        <AdminSidebar />
        <div className="flex-1 ml-72 flex flex-col min-h-screen">
          <AdminHeader />
          <main className="flex-1 p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}
