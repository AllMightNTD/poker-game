"use client";

import api from "@/lib/axios";
import { usePathname, useRouter } from "next/navigation";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

interface AdminContextType {
  currentAdmin: any;
  isLoadingAdmin: boolean;
  refetchAdmin: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchMe = useCallback(async () => {
    const token = Cookies.get("admin_access_token");
    if (!token) {
      setIsLoadingAdmin(false);
      if (!pathname.includes("/backstage/login")) {
        router.push("/backstage/login");
      }
      return;
    }

    setIsLoadingAdmin(true);
    try {
      const res = await api.get("/api/v1/admin/me");
      const admin = res.data;
      setCurrentAdmin(admin);
    } catch {
      setCurrentAdmin(null);
      if (!pathname.includes("/backstage/login")) {
        router.push("/backstage/login");
      }
    } finally {
      setIsLoadingAdmin(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchMe();
    });
  }, [fetchMe]);

  return (
    <AdminContext.Provider value={{ currentAdmin, isLoadingAdmin, refetchAdmin: fetchMe }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useCurrentAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useCurrentAdmin must be used within an AdminProvider");
  }
  return context;
}
