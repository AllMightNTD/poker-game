"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Volume2, Check, Coins } from "lucide-react";
import { usePokerGame } from "../hooks/usePokerGame";

// Simple miniature preview pattern helper to avoid duplicate SVG code
const MiniCardBackPattern = ({ styleType = "classic" }: { styleType?: "classic" | "modern" | "cyberpunk" }) => {
  const strokeColor =
    styleType === "modern"
      ? "text-indigo-500/20"
      : styleType === "cyberpunk"
      ? "text-yellow-500/20"
      : "text-rose-500/20";

  return (
    <svg viewBox="0 0 100 150" className={`w-full h-full opacity-40 ${strokeColor}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={`mini-card-back-grid-${styleType}`} width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 10 M 0 0 L 10 10" fill="none" stroke="currentColor" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="100" height="150" fill={`url(#mini-card-back-grid-${styleType})`} />
      <circle cx="50" cy="75" r="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="50" cy="75" r="14" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
    </svg>
  );
};

export const SettingsModal = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    tableBackground,
    setTableBackground,
    cardDeckStyle,
    setCardDeckStyle,
    dealerVoiceVol,
    setDealerVoiceVol,
    soundEffectsVol,
    setSoundEffectsVol,
    muteAllVoice,
    setMuteAllVoice,
    draftTableBg,
    setDraftTableBg,
    draftDeckStyle,
    setDraftDeckStyle,
    draftDealerVoiceVol,
    setDraftDealerVoiceVol,
    draftSoundEffectsVol,
    setDraftSoundEffectsVol,
    draftMuteAllVoice,
    setDraftMuteAllVoice,
    setSoundEnabled,
    tableId,
    showToast,
  } = usePokerGame();

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSettingsOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl z-10 text-left overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] before:from-emerald-500/5 before:via-transparent before:to-transparent before:pointer-events-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-850">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Settings size={16} className="animate-spin" style={{ animationDuration: "6s" }} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    Cài Đặt Bàn Chơi
                  </h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">Table Configuration</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-950/40 hover:bg-slate-850/60 border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              
              {/* SECTION 1: ÂM THANH */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span className="w-1 h-3 rounded-full bg-emerald-500" />
                  Âm thanh & Hiệu ứng
                </h4>
                
                {/* Mute All Voice */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-850">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-300">Tắt tiếng toàn bộ</span>
                    <span className="text-[9px] text-slate-500 font-medium">Mute all voice & audio feedback</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDraftMuteAllVoice(!draftMuteAllVoice)}
                    className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                      draftMuteAllVoice ? "bg-emerald-500" : "bg-slate-800 border border-slate-700"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                        draftMuteAllVoice ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Dealer Voice Volume Slider */}
                <div className={`space-y-1.5 p-3 rounded-xl bg-slate-950/20 border border-slate-850/60 transition-opacity ${
                  draftMuteAllVoice ? "opacity-30 pointer-events-none" : "opacity-100"
                }`}>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Volume2 size={13} className="text-slate-400" />
                      Giọng nói Dealer
                    </span>
                    <span className="font-mono text-emerald-400">{draftDealerVoiceVol}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={draftDealerVoiceVol}
                    disabled={draftMuteAllVoice}
                    onChange={(e) => setDraftDealerVoiceVol(Number(e.target.value))}
                    className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Sound Effects Volume Slider */}
                <div className={`space-y-1.5 p-3 rounded-xl bg-slate-950/20 border border-slate-850/60 transition-opacity ${
                  draftMuteAllVoice ? "opacity-30 pointer-events-none" : "opacity-100"
                }`}>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Volume2 size={13} className="text-slate-400" />
                      Hiệu ứng âm thanh
                    </span>
                    <span className="font-mono text-emerald-400">{draftSoundEffectsVol}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={draftSoundEffectsVol}
                    disabled={draftMuteAllVoice}
                    onChange={(e) => setDraftSoundEffectsVol(Number(e.target.value))}
                    className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>

              {/* SECTION 2: GIAO DIỆN BÀN CHƠI */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span className="w-1 h-3 rounded-full bg-emerald-500" />
                  Chủ đề & Giao diện
                </h4>

                {/* Table Background / Felt Color */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 block">Màu nỉ bàn chơi</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "classic_green", name: "Lục cổ điển", color: "bg-emerald-800", ring: "ring-emerald-400" },
                      { id: "royal_blue", name: "Lam hoàng gia", color: "bg-blue-800", ring: "ring-blue-400" },
                      { id: "ruby_red", name: "Đỏ Ruby", color: "bg-rose-800", ring: "ring-rose-400" },
                      { id: "shadow_black", name: "Đen bóng đêm", color: "bg-slate-800", ring: "ring-slate-400" },
                    ].map((tc) => (
                      <button
                        key={tc.id}
                        type="button"
                        onClick={() => setDraftTableBg(tc.id as any)}
                        className={`group relative flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                          draftTableBg === tc.id
                            ? "bg-slate-950/60 border-emerald-500/40 text-emerald-400"
                            : "bg-slate-950/20 border-slate-850 hover:bg-slate-950/40 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full ${tc.color} shadow-inner border border-white/10 flex items-center justify-center ${
                          draftTableBg === tc.id ? `ring-2 ring-offset-2 ring-offset-slate-900 ring-emerald-500` : ""
                        }`}>
                          {draftTableBg === tc.id && <Check size={12} className="text-white drop-shadow-md" />}
                        </div>
                        <span className="text-[8px] font-bold tracking-wide text-center leading-none">{tc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Deck Style */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 block">Họa tiết mặt sau lá bài</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "classic", name: "Cổ điển (Đỏ)", bg: "from-red-700 via-red-800 to-red-950", accent: "text-rose-500/20", coin: "text-amber-400" },
                      { id: "modern", name: "Hiện đại (Xanh)", bg: "from-indigo-800 via-indigo-900 to-slate-950", accent: "text-indigo-500/20", coin: "text-indigo-400" },
                      { id: "cyberpunk", name: "Tương lai (Vàng)", bg: "from-slate-900 via-yellow-950 to-black", accent: "text-yellow-500/20", coin: "text-yellow-400" },
                    ].map((cb) => (
                      <button
                        key={cb.id}
                        type="button"
                        onClick={() => setDraftDeckStyle(cb.id as any)}
                        className={`group flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all ${
                          draftDeckStyle === cb.id
                            ? "bg-slate-950/60 border-emerald-500/40 text-emerald-400"
                            : "bg-slate-950/20 border-slate-850 hover:bg-slate-950/40 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {/* Miniature Card Back Preview */}
                        <div className={`w-9 h-12 rounded bg-gradient-to-br ${cb.bg} border border-white/20 relative overflow-hidden flex items-center justify-center shadow-md ${
                          draftDeckStyle === cb.id ? "ring-2 ring-emerald-500/50" : ""
                        }`}>
                          <div className="absolute inset-[1px] border border-white/5 rounded-[inherit] pointer-events-none" />
                          <div className="absolute inset-[1px] opacity-40">
                            <MiniCardBackPattern styleType={cb.id as any} />
                          </div>
                          <div className={`w-3.5 h-3.5 rounded-full border border-white/20 flex items-center justify-center bg-black/60`}>
                            <Coins className={`w-2 h-2 ${cb.coin}`} />
                          </div>
                        </div>
                        <span className="text-[8px] font-bold text-center leading-tight">{cb.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Info block */}
              <div className="border-t border-slate-850 my-2 pt-3">
                <div className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  ID bàn: <span className="font-mono text-slate-400 select-all">{tableId}</span>
                  <br />
                  Loại trò chơi: Texas Hold&apos;em No Limit Cash Game
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 mt-6 pt-3 border-t border-slate-850">
              <button
                type="button"
                onClick={() => {
                  setDraftTableBg("classic_green");
                  setDraftDeckStyle("classic");
                  setDraftDealerVoiceVol(80);
                  setDraftSoundEffectsVol(100);
                  setDraftMuteAllVoice(false);
                  showToast("Cài đặt đã reset về mặc định", "info");
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 bg-slate-950/20 hover:bg-slate-950/60 text-slate-400 hover:text-slate-200 font-black text-[10px] uppercase tracking-wider transition-colors text-center"
              >
                Mặc định
              </button>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 bg-slate-950/20 hover:bg-slate-950/60 text-slate-400 hover:text-slate-200 font-black text-[10px] uppercase tracking-wider transition-colors text-center"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setTableBackground(draftTableBg);
                  setCardDeckStyle(draftDeckStyle);
                  setDealerVoiceVol(draftDealerVoiceVol);
                  setSoundEffectsVol(draftSoundEffectsVol);
                  setMuteAllVoice(draftMuteAllVoice);
                  setSoundEnabled(!draftMuteAllVoice);
                  setIsSettingsOpen(false);
                  showToast("Cập nhật cài đặt thành công!", "success");
                }}
                className="flex-[2] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider transition-colors text-center shadow-lg shadow-emerald-950/20"
              >
                Lưu cài đặt
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
