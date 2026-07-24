"use client";

import { useCurrentUser } from "@/core/providers/user-provider";

import {
  ChevronLeft,
  FileText,
  MessageSquare,
  ScrollText,
  Settings,
  ShieldCheck,
  Sliders,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
  Wifi,
  Pause,
  Play,
} from "lucide-react";
import { useState } from "react";
import { usePokerGame } from "../hooks/usePokerGame";
import { useResponsive } from "../hooks/useResponsive";
import { StatsModal } from "../settings/StatsModal";
import { ProvablyFairModal } from "../ui/ProvablyFairModal";
import { HostSettingsModal } from "../settings/HostSettingsModal";
import { BotControlPanel } from "../hud/BotControlPanel";

export const TableHeader = () => {
  const { isMobile } = useResponsive();
  const { currentUser } = useCurrentUser();
  const {
    tableName,
    smallBlind,
    bigBlind,
    gameStage,
    soundEnabled,
    setSoundEnabled,
    tableBackground,
    cardDeckStyle,
    dealerVoiceVol,
    soundEffectsVol,
    muteAllVoice,
    setDraftTableBg,
    setDraftDeckStyle,
    setDraftDealerVoiceVol,
    setDraftSoundEffectsVol,
    setDraftMuteAllVoice,
    setIsSettingsOpen,
    formatChipsVal,
    showChat,
    setShowChat,
    showHistory,
    setShowHistory,
    players,
    ownerId,
    sitRequests,
    roomStatus,
    togglePause,
    leaveTable,
    toggleSitOut,
  } = usePokerGame();

  const [hostSettingsOpen, setHostSettingsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [provablyFairOpen, setProvablyFairOpen] = useState(false);

  const activePlayers = players.filter((p) => !p.isFolded).length;
  const isHost = currentUser?.id === ownerId;
  const myPlayer = players.find((p) => p && String(p.id) === String(currentUser?.id));
  const isSeated = !!myPlayer;

  const handleOpenSettings = () => {
    setDraftTableBg(tableBackground);
    setDraftDeckStyle(cardDeckStyle);
    setDraftDealerVoiceVol(dealerVoiceVol);
    setDraftSoundEffectsVol(soundEffectsVol);
    setDraftMuteAllVoice(muteAllVoice);
    setIsSettingsOpen(true);
  };

  const stageLabel =
    gameStage === "showdown" ? "Show Cards"
      : gameStage === "preflop" ? "Pre-Flop"
        : gameStage === "flop" ? "Flop"
          : gameStage === "turn" ? "Turn"
            : gameStage === "river" ? "River"
              : gameStage === "ended" ? "Waiting for hand..."
                : gameStage;

  return (
    <header className="h-14 border-b border-slate-800/60 bg-slate-950/95 backdrop-blur-md px-3 md:px-5 flex items-center justify-between shrink-0 z-20 gap-2">

      {/* LEFT: Back + Table info */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <button
          onClick={leaveTable}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors py-2 px-2.5 rounded-xl hover:bg-slate-900/60 shrink-0 cursor-pointer"
        >
          <ChevronLeft size={16} />
          {!isMobile && <span className="text-[10px] font-bold uppercase tracking-wider">Rời bàn</span>}
        </button>

        {isSeated && (
          <button
            onClick={toggleSitOut}
            className={`flex items-center justify-center px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 border cursor-pointer shrink-0
              ${myPlayer?.isSittingOut
                ? "bg-amber-600/10 border-amber-500/30 text-amber-400 hover:bg-amber-600/20 shadow-[0_0_10px_rgba(245,158,11,0.1)] animate-pulse"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
              }`}
          >
            {myPlayer?.isSittingOut ? "BACK" : "AWAY"}
          </button>
        )}

        <div className="h-5 w-px bg-slate-800 shrink-0 hidden sm:block" />

        <div className="min-w-0">
          <h1 className="text-[11px] md:text-xs font-black text-emerald-400 tracking-wider flex items-center gap-1.5 uppercase truncate">
            <Sparkles size={12} className="text-emerald-500 shrink-0" />
            <span className="truncate">{tableName}</span>
          </h1>
          <p className="text-[9px] text-slate-500 font-semibold tracking-wide hidden sm:block">
            Blinds: {formatChipsVal(smallBlind)}/{formatChipsVal(bigBlind)} • Texas Hold&apos;em
          </p>
        </div>

        {/* Online indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/5 border border-emerald-500/15 rounded-lg shrink-0">
          <Wifi size={10} className="text-emerald-500" />
          <span className="text-[9px] font-bold text-emerald-500">Live</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* CENTER: Stage pill (desktop) */}
      {!isMobile && (
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg">
            <Users size={10} className="text-slate-500" />
            <span className="text-[9px] font-bold text-slate-400">{activePlayers} players</span>
          </div>
          <div className="bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider">
            {stageLabel}
          </div>
        </div>
      )}

      {/* RIGHT: HUD controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Provably Fair */}
        <button
          onClick={() => setProvablyFairOpen(true)}
          className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Fair play verification"
        >
          <ShieldCheck size={14} />
        </button>

        {/* Stats */}
        <button
          onClick={() => setStatsOpen(true)}
          className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Session report"
        >
          <FileText size={14} />
        </button>

        {/* Host settings (Only room owner) */}
        {isHost && (
          <>
            <BotControlPanel roomId={tableName} isRoomOwner={isHost} activeSeats={players} />
            <button
              onClick={() => togglePause(roomStatus !== 'paused')}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                roomStatus === 'paused'
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20"
                  : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-amber-500"
              }`}
              title={roomStatus === 'paused' ? "Reopen room" : "Pause Room"}
            >
              {roomStatus === 'paused' ? <Play size={14} /> : <Pause size={14} className="fill-current" />}
            </button>
            <button
              onClick={() => setHostSettingsOpen(true)}
              className="relative w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Room Admin (Host)"
            >
              <Sliders size={14} className="text-amber-500" />
              {sitRequests && sitRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center text-[7px] font-black text-slate-950 border border-slate-950 animate-pulse">
                  {sitRequests.length}
                </span>
              )}
            </button>
          </>
        )}

        <div className="w-px h-5 bg-slate-800" />

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Toggle sound"
        >
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>

        <button
          onClick={() => setShowChat(!showChat)}
          className={`w-9 h-9 rounded-xl border transition-colors flex items-center justify-center cursor-pointer ${showChat
            ? "bg-emerald-600/10 border-emerald-500/30 text-emerald-400"
            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          aria-label="Chat"
        >
          <MessageSquare size={14} />
        </button>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`w-9 h-9 rounded-xl border transition-colors flex items-center justify-center cursor-pointer ${showHistory
            ? "bg-amber-600/10 border-amber-500/30 text-amber-400"
            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          aria-label="Hand History"
        >
          <ScrollText size={14} />
        </button>

        <button
          onClick={handleOpenSettings}
          className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Settings"
        >
          <Settings size={14} />
        </button>
      </div>
      <StatsModal isOpen={statsOpen} onClose={() => setStatsOpen(false)} />
      <ProvablyFairModal isOpen={provablyFairOpen} onClose={() => setProvablyFairOpen(false)} />
      <HostSettingsModal isOpen={hostSettingsOpen} onClose={() => setHostSettingsOpen(false)} />
    </header>
  );
};
