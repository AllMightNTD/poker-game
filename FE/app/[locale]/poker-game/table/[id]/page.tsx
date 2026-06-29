"use client";

import React from "react";
import { UserProvider } from "@/core/providers/user-provider";
import { TableHeader } from "./components/layout/TableHeader";
import { TableBackground } from "./components/layout/TableBackground";
import { PokerTable } from "./components/table/PokerTable";
import { HeroPanel } from "./components/hero/HeroPanel";
import { ActionBar } from "./components/hero/ActionBar";
import { ChatDrawer } from "./components/chat/ChatDrawer";
import { HistoryDrawer } from "./components/chat/HistoryDrawer";
import { SettingsModal } from "./components/settings/SettingsModal";
import { Toast } from "./components/ui/Toast";
import { PokerGameProvider } from "./components/hooks/usePokerGame";

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

      {/* 🎮 Action Bar — sticky bottom */}
      <ActionBar />

      {/* ⚙️ Settings Modal */}
      <SettingsModal />
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
