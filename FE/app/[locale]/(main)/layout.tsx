"use client";
import React, { useEffect, useState } from "react";
import MiniChatContainer from "@/components/chat/MiniChatContainer";
import { MiniChatProvider } from "@/components/chat/MiniChatContext";
import LeftSidebar from "@/components/layout/LeftSidebar";
import Navbar from "@/components/layout/NavBar";
import RightSidebar from "@/components/layout/RightSidebar";
import SettingsModal from "@/components/layout/SettingsModal";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { UserProvider, useCurrentUser } from "@/core/providers/user-provider";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoadingUser } = useCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const profile = currentUser?.profile || {};
      const isProfileEmpty = !profile.location_city && !profile.work?.length && !profile.education?.length && !profile.hobbies?.length;
      const hasSeenOnboarding = localStorage.getItem(`onboarding_${currentUser.id}`);
      if (isProfileEmpty && !hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [currentUser]);

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

  return (
    <MiniChatProvider>
      <div className="min-h-screen bg-slate-50 font-sans">
        {showOnboarding && currentUser && (
          <OnboardingModal 
            currentUser={currentUser} 
            onClose={() => {
              setShowOnboarding(false);
              localStorage.setItem(`onboarding_${currentUser.id}`, "true");
            }} 
          />
        )}
        <Navbar
          onMenuToggle={() => setMobileMenuOpen(true)}
          onSeeAllClick={() => {}}
          onSettingsClick={() => setIsSettingsOpen(true)}
          isNotificationsActive={false}
          currentUser={currentUser}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onViewChange={() => {}}
        />

        <div className="flex pt-14 max-w-[1400px] mx-auto">
          {/* Left Sidebar */}
          <LeftSidebar
            activeNav={""}
            onNavChange={() => {}}
            mobileOpen={mobileMenuOpen}
            onMobileClose={() => setMobileMenuOpen(false)}
          />

          {/* Main content */}
          <main className="flex-1 flex gap-4 px-3 md:px-4 py-4 min-w-0">
            {children}
          </main>

          {/* Right Sidebar */}
          <RightSidebar currentUser={currentUser} />
        </div>

        {/* Mini Chat Popups - fixed bottom right */}
        <MiniChatContainer currentUser={currentUser} />
      </div>
    </MiniChatProvider>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <LayoutContent>{children}</LayoutContent>
    </UserProvider>
  );
}
