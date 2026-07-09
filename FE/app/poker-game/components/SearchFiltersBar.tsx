import React, { useState } from "react";
import { Search, Grid, List } from "lucide-react";

interface SearchFiltersBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedFilter: string;
  setSelectedFilter: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  selectedGameType: string;
  setSelectedGameType: (val: string) => void;
  selectedMaxPlayers: string;
  setSelectedMaxPlayers: (val: string) => void;
  hideFull: boolean;
  setHideFull: (val: boolean) => void;
  hidePrivate: boolean;
  setHidePrivate: (val: boolean) => void;
  viewMode: "grid" | "list";
  setViewMode: (val: "grid" | "list") => void;
}

const STAKE_FILTERS = [
  { id: "all", label: "Tất cả", suit: "📱", color: "text-[#F4B942]" },
  { id: "micro", label: "Micro (≤2K)", suit: "♠", color: "text-blue-400" },
  { id: "low", label: "Thấp (2K–10K)", suit: "♣", color: "text-emerald-400" },
  { id: "medium", label: "Vừa (10K–50K)", suit: "♦", color: "text-amber-400" },
  { id: "high", label: "Cao (>50K)", suit: "♥", color: "text-rose-400" },
];

export const SearchFiltersBar: React.FC<SearchFiltersBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedFilter,
  setSelectedFilter,
  selectedStatus,
  setSelectedStatus,
  selectedGameType,
  setSelectedGameType,
  selectedMaxPlayers,
  setSelectedMaxPlayers,
  hideFull,
  setHideFull,
  hidePrivate,
  setHidePrivate,
  viewMode,
  setViewMode,
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <div className="bg-[#0B151F]/45 border border-white/5 rounded-[2rem] p-4.5 space-y-4 shadow-2xl backdrop-blur-md w-full relative z-20">
      {/* Top row: Search, Dropdowns, view mode toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Search Input & Dropdowns (Capsule shape grouping) */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Expanded Search Input container */}
          <div className="relative flex items-center bg-[#08121a]/80 border border-white/5 rounded-full p-1 h-10 transition-all duration-300">
            <button
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="w-8 h-8 rounded-full bg-[#0B151F] hover:bg-[#122230] text-[#F4B942] flex items-center justify-center transition-all cursor-pointer shrink-0"
              title="Tìm kiếm"
            >
              <Search size={14} />
            </button>
            {(isSearchExpanded || searchQuery) && (
              <input
                type="text"
                placeholder="Tìm tên bàn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none py-1 px-3 text-xs text-[#F7EFDD] placeholder-[#F7EFDD]/30 focus:outline-none w-36 sm:w-44 transition-all"
                autoFocus
                onBlur={() => {
                  if (!searchQuery) setIsSearchExpanded(false);
                }}
              />
            )}
          </div>

          {/* Game Type Filter Dropdown */}
          <div className="relative shrink-0">
            <select
              value={selectedGameType}
              onChange={(e) => setSelectedGameType(e.target.value)}
              className="bg-[#08121a]/80 hover:bg-[#0c1a26] border border-white/5 rounded-full py-2 pl-4.5 pr-9 text-xs font-bold text-[#F7EFDD]/80 focus:outline-none focus:border-[#F4B942]/60 hover:text-white transition-all appearance-none cursor-pointer h-10 shadow-inner"
            >
              <option value="all">Mọi loại game</option>
              <option value="NLH">Texas Hold&apos;em</option>
              <option value="PLO">Omaha</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#F7EFDD]/40 text-[9px]">▼</div>
          </div>

          {/* Table Status Dropdown */}
          <div className="relative shrink-0">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#08121a]/80 hover:bg-[#0c1a26] border border-white/5 rounded-full py-2 pl-4.5 pr-9 text-xs font-bold text-[#F7EFDD]/80 focus:outline-none focus:border-[#F4B942]/60 hover:text-white transition-all appearance-none cursor-pointer h-10 shadow-inner"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="WAITING">Đang chờ</option>
              <option value="RUNNING">Đang chơi</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#F7EFDD]/40 text-[9px]">▼</div>
          </div>

          {/* Max Players Dropdown */}
          <div className="relative shrink-0">
            <select
              value={selectedMaxPlayers}
              onChange={(e) => setSelectedMaxPlayers(e.target.value)}
              className="bg-[#08121a]/80 hover:bg-[#0c1a26] border border-white/5 rounded-full py-2 pl-4.5 pr-9 text-xs font-bold text-[#F7EFDD]/80 focus:outline-none focus:border-[#F4B942]/60 hover:text-white transition-all appearance-none cursor-pointer h-10 shadow-inner"
            >
              <option value="all">Mọi số người</option>
              <option value="9">9 Players (Full)</option>
              <option value="6">6 Players (6-max)</option>
              <option value="2">2 Players (Heads Up)</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#F7EFDD]/40 text-[9px]">▼</div>
          </div>
        </div>

        {/* View Mode Toggle (Grid/List) */}
        <div className="flex items-center gap-1 bg-[#08121a]/80 p-1 rounded-full border border-white/5 h-10 shrink-0 shadow-inner">
          <button
            onClick={() => setViewMode("grid")}
            className={`w-8 h-8 rounded-full transition-all flex items-center justify-center cursor-pointer ${
              viewMode === "grid"
                ? "bg-gradient-to-br from-[#F4B942] to-[#E0942A] text-[#060e0a] shadow-md shadow-[#F4B942]/10"
                : "text-[#F7EFDD]/40 hover:text-[#F7EFDD]"
            }`}
            title="Dạng lưới"
          >
            <Grid size={13} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`w-8 h-8 rounded-full transition-all flex items-center justify-center cursor-pointer ${
              viewMode === "list"
                ? "bg-gradient-to-br from-[#F4B942] to-[#E0942A] text-[#060e0a] shadow-md shadow-[#F4B942]/10"
                : "text-[#F7EFDD]/40 hover:text-[#F7EFDD]"
            }`}
            title="Dạng danh sách"
          >
            <List size={13} />
          </button>
        </div>
      </div>

      {/* Bottom row: Stake categories & Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-3.5">
        {/* Stake Categories Chips (Pill capsule shape) */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar shrink-0">
          {STAKE_FILTERS.map((filter) => {
            const isActive = selectedFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
                  isActive
                    ? "bg-[#F4B942] border-[#F4B942] text-[#060e0a] shadow-lg shadow-[#F4B942]/10 scale-[1.02] font-black"
                    : "bg-[#08121a]/80 border-white/5 text-[#F7EFDD]/60 hover:text-white hover:bg-[#0c1a26]"
                }`}
              >
                <span className={`text-[12px] leading-none ${isActive ? "text-[#060e0a]" : filter.color}`}>
                  {filter.suit}
                </span>
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>

        {/* Boolean Toggle Checkboxes */}
        <div className="flex items-center gap-4 text-xs font-bold text-[#F7EFDD]/50">
          <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white transition-colors group">
            <input
              type="checkbox"
              checked={hideFull}
              onChange={(e) => setHideFull(e.target.checked)}
              className="w-4 h-4 rounded-full border-white/15 bg-[#08121a] text-[#F4B942] focus:ring-0 focus:ring-offset-0 accent-[#F4B942] transition-colors cursor-pointer"
            />
            <span className="group-hover:text-[#F7EFDD]/80 transition-colors">Ẩn bàn đầy</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white transition-colors group">
            <input
              type="checkbox"
              checked={hidePrivate}
              onChange={(e) => setHidePrivate(e.target.checked)}
              className="w-4 h-4 rounded-full border-white/15 bg-[#08121a] text-[#F4B942] focus:ring-0 focus:ring-offset-0 accent-[#F4B942] transition-colors cursor-pointer"
            />
            <span className="group-hover:text-[#F7EFDD]/80 transition-colors">Ẩn bàn riêng tư</span>
          </label>
        </div>
      </div>
    </div>
  );
};
