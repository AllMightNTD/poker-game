"use client";
import Navbar from "@/components/layout/NavBar";
import api from "@/lib/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { MiniChatProvider } from "@/components/chat/MiniChatContext";

export default function MessagingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/api/v1/user/me');
        setCurrentUser(res.data?.metadata || res.data);
      } catch (error) {
        Cookies.remove('accessToken');
        router.push('/login');
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchMe();
  }, [router]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-500 font-medium">Đang tải dữ liệu người dùng...</p>
        </div>
      </div>
    );
  }

  // Clone children to pass currentUser
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, { currentUser });
    }
    return child;
  });

  return (
    <MiniChatProvider>
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
        <Navbar
          onMenuToggle={() => {}}
          onSeeAllClick={() => router.push('/notifications')}
          onSettingsClick={() => router.push('/')}
          isNotificationsActive={false}
          currentUser={currentUser}
        />
        <div className="flex-1 pt-14 h-[calc(100vh-3.5rem)] overflow-hidden">
          {childrenWithProps}
        </div>
      </div>
    </MiniChatProvider>
  );
}
