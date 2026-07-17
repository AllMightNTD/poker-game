"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  Coins,
  PlayCircle,
  Search,
  Trophy,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { handsApi } from "../api/blogsApi";
import type { HandItem, HandListResponse } from "../types";

// ── Props ─────────────────────────────────────────────────────────────────────
interface PokerHandPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (handId: string) => void;
}

// ── Stage badge colors ────────────────────────────────────────────────────────
const STAGE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  preflop:  { bg: "bg-slate-800",      text: "text-slate-400",    dot: "bg-slate-500" },
  flop:     { bg: "bg-blue-950/60",    text: "text-blue-400",     dot: "bg-blue-400" },
  turn:     { bg: "bg-amber-950/60",   text: "text-amber-400",    dot: "bg-amber-400" },
  river:    { bg: "bg-teal-950/60",    text: "text-teal-400",     dot: "bg-teal-400" },
  showdown: { bg: "bg-yellow-950/60",  text: "text-yellow-400",   dot: "bg-yellow-400" },
};

function getStageBadge(stage: string) {
  return STAGE_STYLES[stage.toLowerCase()] ?? STAGE_STYLES.preflop;
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function HandCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 bg-slate-800 rounded-full" />
        <div className="h-5 w-14 bg-slate-800 rounded-full" />
      </div>
      <div className="h-4 w-40 bg-slate-800 rounded-full" />
      <div className="flex gap-3">
        <div className="h-3 w-20 bg-slate-800 rounded-full" />
        <div className="h-3 w-16 bg-slate-800 rounded-full" />
      </div>
      <div className="h-8 bg-slate-800 rounded-xl mt-1" />
    </div>
  );
}

// ── Single hand card ──────────────────────────────────────────────────────────
function HandCard({
  item,
  onSelect,
  index,
}: {
  item: HandItem;
  onSelect: (id: string) => void;
  index: number;
}) {
  const stageBadge = getStageBadge(item.hand_stage);
  const potFormatted = Number(item.total_pot).toLocaleString();
  const timeFormatted = new Date(item.started_at).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateFormatted = new Date(item.started_at).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="group relative rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-yellow-500/20 transition-all duration-300 p-4 flex flex-col gap-3 cursor-default"
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />

      {/* Top row: ID + stage */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] text-slate-600 truncate max-w-[140px]">
          #{item.id.slice(0, 12)}…
        </span>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${stageBadge.bg} ${stageBadge.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${stageBadge.dot}`} />
          {item.hand_stage}
        </span>
      </div>

      {/* Table name */}
      <div className="flex items-center gap-2">
        <PlayCircle size={13} className="text-yellow-500/70 shrink-0" />
        <h4 className="text-sm font-semibold text-slate-200 leading-tight truncate">
          {item.table_name || `Bàn chơi #${item.table_id?.slice(0, 8)}`}
        </h4>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Trophy size={11} className="text-amber-500/60" />
          <span>
            Pot:{" "}
            <span className="text-amber-400 font-semibold">{potFormatted}</span>
          </span>
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={11} />
          {dateFormatted} · {timeFormatted}
        </span>
      </div>

      {/* CTA button */}
      <button
        onClick={() => onSelect(item.id)}
        id={`btn-select-hand-${item.id}`}
        className="relative w-full py-2 rounded-xl text-xs font-bold tracking-wide overflow-hidden
          bg-slate-800 text-slate-400
          hover:bg-yellow-500 hover:text-slate-950
          active:scale-[0.98]
          transition-all duration-200
          flex items-center justify-center gap-1.5"
      >
        <Coins size={12} />
        Nhúng ván bài này
      </button>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function PokerHandPickerModal({
  isOpen,
  onClose,
  onSelect,
}: PokerHandPickerModalProps): React.ReactElement | null {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [limit, setLimit] = useState(20);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search input 400ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Focus search when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Keyboard: Escape closes
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );
  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  const { data, isLoading, isError } = useQuery<HandListResponse>({
    queryKey: ["admin-hands-list", debouncedSearch, limit],
    queryFn: () => handsApi.list({ limit, tableId: debouncedSearch || undefined }),
    enabled: isOpen,
  });

  const hands = data?.data ?? [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="poker-hand-picker-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
          aria-label="Chọn ván bài Poker"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            key="poker-hand-picker-panel"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            className="relative w-full max-w-3xl flex flex-col max-h-[88vh] rounded-2xl overflow-hidden
              bg-[#0A0F1C] border border-white/8
              shadow-[0_32px_80px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.04)]"
          >
            {/* ── Header ── */}
            <div className="relative px-6 py-4 border-b border-white/6 flex items-center justify-between gap-4">
              {/* Subtle top gradient accent */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <PlayCircle size={16} className="text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wide">
                    Lịch Sử Ván Bài
                  </h2>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                    Poker Hand History
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                id="btn-close-hand-picker"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500
                  hover:text-white hover:bg-white/8 transition-all duration-200"
                aria-label="Đóng"
              >
                <X size={15} />
              </button>
            </div>

            {/* ── Search bar ── */}
            <div className="px-6 py-3 border-b border-white/6 bg-white/[0.02]">
              <div className="relative flex items-center">
                <Search
                  size={14}
                  className="absolute left-3 text-slate-600 pointer-events-none"
                />
                <input
                  ref={inputRef}
                  type="text"
                  id="input-hand-search"
                  placeholder="Tìm theo Table ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Tìm ván bài theo Table ID"
                  className="w-full bg-white/[0.04] border border-white/8 rounded-xl
                    pl-9 pr-8 py-2.5 text-sm text-slate-200 placeholder-slate-600
                    focus:outline-none focus:border-yellow-500/40 focus:bg-white/[0.06]
                    transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 text-slate-600 hover:text-slate-300 transition-colors"
                    aria-label="Xóa tìm kiếm"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {/* Loading skeletons */}
              {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <HandCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Error state */}
              {isError && !isLoading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="text-3xl">⚠️</div>
                  <p className="text-sm text-red-400 font-medium">
                    Không thể kết nối API ván bài.
                  </p>
                  <p className="text-xs text-slate-600">Vui lòng thử lại sau.</p>
                </div>
              )}

              {/* Empty state */}
              {!isLoading && !isError && hands.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="text-3xl opacity-40">🃏</div>
                  <p className="text-sm text-slate-500 font-medium">
                    {debouncedSearch
                      ? `Không tìm thấy ván bài cho "${debouncedSearch}"`
                      : "Chưa có ván bài nào trong hệ thống."}
                  </p>
                </div>
              )}

              {/* Cards grid */}
              {!isLoading && !isError && hands.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {hands.map((item, i) => (
                    <HandCard key={item.id} item={item} onSelect={onSelect} index={i} />
                  ))}
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="relative px-6 py-3 border-t border-white/6 bg-white/[0.02] flex items-center justify-between">
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

              <span className="text-xs text-slate-600">
                {isLoading
                  ? "Đang tải..."
                  : `${hands.length} ván bài${debouncedSearch ? " (đã lọc)" : ""}`}
              </span>

              <button
                onClick={() => setLimit((prev) => prev + 20)}
                disabled={isLoading}
                id="btn-load-more-hands"
                className="flex items-center gap-1.5 text-xs font-bold text-yellow-500/80
                  hover:text-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed
                  transition-colors duration-200"
              >
                <ChevronDown size={13} />
                Tải thêm ván bài
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
