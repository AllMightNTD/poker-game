"use client";

import dynamic from "next/dynamic";
import { UserProvider } from "@/core/providers/user-provider";
import { HeroPanel } from "./components/hero/HeroPanel";
import { PokerGameProvider } from "./components/hooks/usePokerGame";
import { TableBackground } from "./components/layout/TableBackground";
import { TableHeader } from "./components/layout/TableHeader";
import { PokerTable } from "./components/table/PokerTable";
import { Toast } from "./components/ui/Toast";

// Lazily load large components/modals only when client-side environment is ready to reduce initial bundle size and speed up FCP
const ChatDrawer = dynamic(() => import("./components/chat/ChatDrawer").then(mod => mod.ChatDrawer), {
  ssr: false,
});
const HistoryDrawer = dynamic(() => import("./components/chat/HistoryDrawer").then(mod => mod.HistoryDrawer), {
  ssr: false,
});
const SettingsModal = dynamic(() => import("./components/settings/SettingsModal").then(mod => mod.SettingsModal), {
  ssr: false,
});
const SitRequestModal = dynamic(() => import("./components/settings/SitRequestModal").then(mod => mod.SitRequestModal), {
  ssr: false,
});

function PokerTableRoom() {
  return (
    <div className="h-[100dvh] bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none font-sans">
      {/* 🔔 Toast */}
      <Toast />

      {/* 🏆 Header */}
      <TableHeader />

      {/* 🚀 Main: 3 columns on desktop, full-width on mobile/tablet */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">

        {/* LEFT — Chat sidebar (xl+) or bottom sheet (mobile/tablet) */}
        <ChatDrawer />

        {/* CENTER — Poker table */}
        <main className="flex-1 relative overflow-hidden bg-slate-950/20 min-w-0 flex flex-col">
          {/* Background ambient */}
          <TableBackground />

          {/* Table takes all available space */}
          <div className="flex-1 relative min-h-0">
            <PokerTable />
          </div>

          {/* Hero Panel — below table, above action bar */}
          <HeroPanel />
        </main>

        {/* RIGHT — History sidebar (xl+) or bottom sheet (mobile/tablet) */}
        <HistoryDrawer />
      </div>

      {/* ⚙️ Settings Modal */}
      <SettingsModal />

      {/* 🙋‍♂️ Sit Requests Modal */}
      <SitRequestModal />
    </div>
  );
}

export default function GamingTablePage() {
  return (
    <UserProvider>
      <PokerGameProvider>
        <PokerTableRoom />
      </PokerGameProvider>
    </UserProvider>
  );
}
