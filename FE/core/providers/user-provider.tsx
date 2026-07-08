"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

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
    } catch (error) {
      Cookies.remove("accessToken");
      router.push("/login");
    } finally {
      setIsLoadingUser(false);
    }
  }, [router]);

  useEffect(() => {
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
