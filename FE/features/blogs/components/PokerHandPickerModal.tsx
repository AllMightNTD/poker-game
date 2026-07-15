"use client";

import httpClient from "@/core/api/http-client";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Loader2, PlayCircle, Search, Trophy, X } from "lucide-react";
import { useState } from "react";

interface HandItem {
  id: string;
  table_id: string;
  table_name: string | null;
  total_pot: string;
  hand_stage: string;
  started_at: string;
  players_count?: number;
}

interface HandListResponse {
  data: HandItem[];
  nextCursor: string | null;
}

interface PokerHandPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (handId: string) => void;
}

export function PokerHandPickerModal({ isOpen, onClose, onSelect }: PokerHandPickerModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(20);

  // Fetch hands list from Admin API
  const { data, isLoading, isError } = useQuery<HandListResponse>({
    queryKey: ["admin-hands-list", searchTerm, limit],
    queryFn: async () => {
      // API call matching NestJS admin/hands controller
      const res = await httpClient.get("/api/v1/admin/hands", {
        params: {
          limit,
          tableId: searchTerm ? searchTerm : undefined,
        },
      });
      // Fallback format matching Backend response standard
      const rawData = res.data;
      if (Array.isArray(rawData)) {
        return { data: rawData, nextCursor: null };
      }
      return {
        data: rawData.data ?? rawData ?? [],
        nextCursor: rawData.nextCursor ?? null,
      };
    },
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const hands = data?.data ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Modal box */}
      <div className="relative w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-850">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-yellow-500 uppercase tracking-wider">🃏 Lịch Sử Ván Bài Poker</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4 bg-slate-900/50 border-b border-slate-850/60 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Nhập ID bàn chơi (Table ID) để lọc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-yellow-500/60 transition-colors"
            />
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
              <Loader2 size={32} className="animate-spin text-yellow-500" />
              <span className="text-sm">Đang tải lịch sử ván bài...</span>
            </div>
          ) : isError ? (
            <div className="text-center py-12 text-red-400 text-sm">
              ⚠️ Không thể kết nối API danh sách ván bài. Vui lòng thử lại.
            </div>
          ) : hands.length === 0 ? (
            <div className="text-center py-12 text-slate-600 text-sm">
              Không tìm thấy ván bài nào trong hệ thống.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {hands.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-850 hover:border-yellow-500/40 rounded-xl p-4 transition-all flex flex-col justify-between gap-3 group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-slate-500 truncate max-w-[150px]">
                        ID: {item.id}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 uppercase font-bold">
                        {item.hand_stage}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-200 mt-2 flex items-center gap-1.5">
                      <PlayCircle size={14} className="text-yellow-500/80" />
                      {item.table_name || `Bàn chơi #${item.table_id?.slice(0, 8)}`}
                    </h4>

                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Trophy size={12} className="text-amber-500/70" />
                        <span>Pot: <span className="text-slate-300 font-semibold">{Number(item.total_pot).toLocaleString()}</span></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{new Date(item.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelect(item.id)}
                    className="w-full py-2 bg-slate-800 hover:bg-yellow-500 hover:text-black text-slate-300 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Nhúng ván bài này
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-850 flex items-center justify-between text-xs text-slate-500">
          <span>Tìm thấy {hands.length} ván bài</span>
          <button
            onClick={() => setLimit((prev) => prev + 20)}
            className="text-yellow-500 hover:text-yellow-400 font-bold uppercase transition-colors cursor-pointer"
          >
            Tải thêm ván bài
          </button>
        </div>
      </div>
    </div>
  );
}
