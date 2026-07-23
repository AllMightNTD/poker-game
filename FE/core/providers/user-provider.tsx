"use client";
import Cookies from "js-cookie";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface UserContextType {
  currentUser: any;
  isLoadingUser: boolean;
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const router = useRouter();

  const fetchMe = useCallback(async () => {
    setIsLoadingUser(true);
    try {
      const res = await api.get("/api/v1/user/me");
      const user = res.data?.metadata || res.data;
      setCurrentUser(user);

      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      if (currentPath === '/login' || currentPath === '/register' || currentPath === '/') {
        router.push("/poker-game");
      }
    } catch {
      setCurrentUser(null);
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const isPublicPath = 
        currentPath === '/' || 
        currentPath.startsWith('/login') || 
        currentPath.startsWith('/register') || 
        currentPath.startsWith('/forgot-password') ||
        currentPath.startsWith('/verify-otp') ||
        currentPath.startsWith('/backstage');

      if (!isPublicPath) {
        router.push("/");
      }
    } finally {
      setIsLoadingUser(false);
    }
  }, [router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get("accessToken");
      const refreshToken = urlParams.get("refreshToken");

      if (accessToken) {
        Cookies.set("accessToken", accessToken, { path: "/" });
        if (refreshToken) {
          Cookies.set("refreshToken", refreshToken, { path: "/" });
        }
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }

    Promise.resolve().then(() => {
      fetchMe();
    });
  }, [fetchMe]);

  return (
    <UserContext.Provider value={{ currentUser, isLoadingUser, refetchUser: fetchMe }}>
      {children}
    </UserContext.Provider>
  );
}

export function useCurrentUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useCurrentUser must be used within a UserProvider");
  }
  return context;
}
