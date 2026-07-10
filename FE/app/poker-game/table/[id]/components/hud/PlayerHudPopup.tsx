"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { X, VolumeX, Volume2, BookOpen, Award, Target, MessageSquare } from "lucide-react";
import { Player } from "../types";
import { useSocket } from "@/core/providers/SocketProvider";
import { usePokerGame } from "../hooks/usePokerGame";

interface PlayerHudPopupProps {
  player: Player;
  onClose: () => void;
}

interface PokerStats {
  total_hands: number;
  vpip: number;
  pfr: number;
  biggest_win: string;
}

const THROWABLES = [
  { id: "tomato", name: "Cà chua", icon: "🍅", color: "from-red-500/20 to-rose-600/30 hover:border-red-500/50" },
  { id: "beer", name: "Bia", icon: "🍺", color: "from-amber-400/20 to-yellow-500/30 hover:border-amber-500/50" },
  { id: "rose", name: "Hoa hồng", icon: "🌹", color: "from-pink-500/20 to-red-500/30 hover:border-pink-500/50" },
  { id: "bomb", name: "Bom nước", icon: "💣", color: "from-slate-700/35 to-slate-900/50 hover:border-slate-500/50" },
];

export const PlayerHudPopup: React.FC<PlayerHudPopupProps> = ({ player, onClose }) => {
  const { socket } = useSocket();
  const { tableId, showToast } = usePokerGame();
  
  const [stats, setStats] = useState<PokerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(`poker_note_${player.id}`) || "";
  });
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    const mutedUsers = localStorage.getItem("poker_muted_users");
    if (mutedUsers) {
      try {
        const arr = JSON.parse(mutedUsers);
        return arr.includes(player.id);
      } catch {
        return false;
      }
    }
    return false;
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Load stats from API
  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      if (player.isBot) {
        // Bots have pre-defined realistic statistics
        setStats({
          total_hands: 1420,
          vpip: 28.5,
          pfr: 22.0,
          biggest_win: "12500000",
        });
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await api.get(`/api/v1/user/${player.id}/stats`);
        if (active) {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch player stats", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchStats();
    return () => {
      active = false;
    };
  }, [player.id, player.isBot]);

  // Save notes to LocalStorage
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNote(val);
    setSaveStatus("saving");

    localStorage.setItem(`poker_note_${player.id}`, val);
    
    // Simulate auto-save feedback
    const timeout = setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
    }, 500);

    return () => clearTimeout(timeout);
  };

  // Toggle Mute Chat
  const toggleMute = () => {
    if (typeof window === "undefined") return;

    const mutedUsers = localStorage.getItem("poker_muted_users");
    let arr: string[] = [];
    if (mutedUsers) {
      try {
        arr = JSON.parse(mutedUsers);
      } catch {}
    }

    let nextMuteState = false;
    if (arr.includes(player.id)) {
      arr = arr.filter((id) => id !== player.id);
      nextMuteState = false;
      showToast(`Đã bỏ chặn chat của ${player.name}`, "info");
    } else {
      arr.push(player.id);
      nextMuteState = true;
      showToast(`Đã chặn chat của ${player.name}`, "info");
    }

    localStorage.setItem("poker_muted_users", JSON.stringify(arr));
    setIsMuted(nextMuteState);

    // Dispatch event to notify Chat component
    window.dispatchEvent(new Event("poker_mute_toggle"));
  };

  // Throw Item
  const handleThrowItem = (itemId: string) => {
    if (!socket) return;
    socket.emit("table:throwable-item", {
      room_id: tableId,
      item_id: itemId,
      target_seat: player.seatIndex,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      {/* Outer Glow Premium Card */}
      <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header decoration */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800/80 text-slate-400 hover:text-white transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Profile Details */}
        <div className="p-6 pb-4 border-b border-slate-800/50 flex items-center gap-4 mt-2">
          {/* Large Avatar */}
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={player.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${player.name}`}
              alt={player.name}
              className="w-16 h-16 rounded-full border-2 border-amber-500/50 bg-slate-950 object-cover shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            />
            <div className="absolute -bottom-1 -right-1 bg-slate-950 border border-slate-800 rounded-full px-2 py-0.5 text-[8px] font-black text-amber-400 uppercase tracking-widest leading-none">
              Ghế {player.seatIndex}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-100 truncate uppercase tracking-wide">
                {player.name}
              </h3>
              {player.isBot && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-wider">
                  BOT
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-400 font-bold mt-1">
              Phỉnh: {parseInt(player.chips || "0").toLocaleString("vi-VN")}
            </p>
          </div>
        </div>

        {/* Scrollable Contents */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800">
          
          {/* Poker Stats Grid */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              Chỉ số Poker (Real-Time HUD)
            </h4>
            
            {loading ? (
              <div className="flex justify-center items-center py-6">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/60 border border-slate-800/50 rounded-2xl p-3 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ván chơi</span>
                  <span className="text-lg font-extrabold text-slate-200 mt-1">{stats.total_hands}</span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/50 rounded-2xl p-3 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Thắng Lớn Nhất</span>
                  <span className="text-sm font-extrabold text-emerald-400 truncate mt-1">
                    +{parseInt(stats.biggest_win || "0").toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/50 rounded-2xl p-3 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    VPIP
                    <span className="text-[8px] text-amber-400/80 font-normal normal-case">(Tự nguyện vào Pot)</span>
                  </span>
                  <span className="text-lg font-extrabold text-amber-400 mt-1">{stats.vpip}%</span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/50 rounded-2xl p-3 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    PFR
                    <span className="text-[8px] text-orange-400/80 font-normal normal-case">(Raise trước Flop)</span>
                  </span>
                  <span className="text-lg font-extrabold text-orange-400 mt-1">{stats.pfr}%</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-500">
                Không thể tải thông số người chơi.
              </div>
            )}
          </div>

          {/* Throwable Items */}
          {!player.isHero && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-rose-500" />
                Ném vật phẩm tương tác
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {THROWABLES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleThrowItem(item.id)}
                    className={`flex flex-col items-center justify-center py-2.5 px-1 bg-gradient-to-b ${item.color} border border-slate-800/80 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 group`}
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                    <span className="text-[8px] font-bold text-slate-400 group-hover:text-slate-200 mt-1">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes and Mute Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                Ghi chú đối thủ (Local Notes)
              </h4>
              {saveStatus !== "idle" && (
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider animate-pulse">
                  {saveStatus === "saving" ? "Đang lưu..." : "Đã lưu!"}
                </span>
              )}
            </div>

            <textarea
              value={note}
              onChange={handleNoteChange}
              placeholder="Nhập lối chơi của đối thủ tại đây (Ví dụ: Thích bluff sông, chơi chặt chẽ, call nhiều...)"
              className="w-full h-20 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2 text-xs font-medium text-slate-200 placeholder-slate-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all resize-none"
            />

            {!player.isHero && (
              <div className="flex items-center justify-between bg-slate-950/40 border border-slate-800/60 rounded-2xl p-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-slate-300">Chặn tin nhắn Chat</span>
                    <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Ẩn tất cả chat từ người này</span>
                  </div>
                </div>
                <button
                  onClick={toggleMute}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 border ${
                    isMuted
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/30 border-t border-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-black uppercase tracking-wider transition-colors duration-200"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
