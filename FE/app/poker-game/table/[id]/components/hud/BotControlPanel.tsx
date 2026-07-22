"use client";

import { useToast } from "@/core/providers/toast-provider";
import { pokerApi } from "@/features/poker/api/poker-api";
import { Bot, Plus, Sparkles, UserMinus, X } from "lucide-react";
import React, { useState } from "react";

interface BotControlPanelProps {
  roomId: string;
  isRoomOwner: boolean;
  activeSeats: any[];
  onBotUpdated?: () => void;
}

export function BotControlPanel({
  roomId,
  isRoomOwner,
  activeSeats,
  onBotUpdated,
}: BotControlPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [count, setCount] = useState(1);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [chips, setChips] = useState(100000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!isRoomOwner) return null;

  const botSeats = activeSeats.filter((seat) => seat.is_bot === '1' || seat.isBot === true);

  const handleAddBots = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await pokerApi.addBots(roomId, {
        count,
        difficulty,
        chips,
      });
      toast("success", `Đã thêm ${count} Bot (${difficulty}) vào bàn`);
      if (onBotUpdated) onBotUpdated();
      setIsOpen(false);
    } catch (err: any) {
      toast("error", err.response?.data?.message || "Không thể thêm Bot");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveBot = async (botUserId: string, botName: string) => {
    try {
      await pokerApi.removeBot(roomId, botUserId);
      toast("info", `Đã đuổi Bot ${botName} khỏi bàn`);
      if (onBotUpdated) onBotUpdated();
    } catch (err: any) {
      toast("error", err.response?.data?.message || "Không thể xóa Bot");
    }
  };

  return (
    <>
      {/* Bot Control Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium px-3.5 py-1.5 rounded-full text-xs shadow-lg border border-purple-400/30 backdrop-blur-md transition-all transform hover:scale-105 active:scale-95"
        title="Quản lý Bot AI trong phòng"
      >
        <Bot className="w-4 h-4 text-purple-200 animate-pulse" />
        <span>Quản Lý Bot ({botSeats.length})</span>
      </button>

      {/* Bot Control Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                    Quản Lý Bot AI <Sparkles className="w-4 h-4 text-yellow-400" />
                  </h3>
                  <p className="text-xs text-slate-400">Thêm hoặc đuổi AI chơi tự động trong bàn</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add Bot Form */}
            <form onSubmit={handleAddBots} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Số lượng Bot muốn thêm:
                </label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCount(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${count === num
                        ? "bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/40"
                        : "bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500"
                        }`}
                    >
                      {num} Bot
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Độ khó Trí Tuệ Nhân Tạo:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${difficulty === diff
                        ? diff === 'EASY'
                          ? "bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30"
                          : diff === 'MEDIUM'
                            ? "bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-600/30"
                            : "bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/30"
                        : "bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500"
                        }`}
                    >
                      <span>{diff === 'EASY' ? '🟢 DỄ' : diff === 'MEDIUM' ? '🟡 VỪA' : '🔴 KHÓ'}</span>
                      <span className="text-[10px] opacity-75 font-normal">
                        {diff === 'EASY' ? 'Tự do' : diff === 'MEDIUM' ? 'Tính Pot' : 'Pro EV'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Số Chip mang vào bàn (per bot):
                </label>
                <input
                  type="number"
                  value={chips}
                  onChange={(e) => setChips(Number(e.target.value))}
                  min={1000}
                  step={10000}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? "Đang thêm Bot..." : "Thêm Bot Ngay"}</span>
              </button>
            </form>

            {/* Active Bots List */}
            {botSeats.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-700/60">
                <h4 className="text-xs font-semibold text-slate-300 mb-2.5 flex items-center justify-between">
                  <span>Danh sách Bot đang ngồi ({botSeats.length}):</span>
                </h4>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {botSeats.map((bot) => (
                    <div
                      key={bot.user_id || bot.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-xs font-bold text-purple-300">
                          🤖
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">
                            {bot.username || bot.displayName} (Ghế {bot.seat_number})
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Stack: {Number(bot.stack || 0).toLocaleString()} chips
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveBot(bot.user_id || bot.id, bot.username || bot.displayName)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition"
                        title="Đuổi Bot này"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
