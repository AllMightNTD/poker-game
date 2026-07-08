import React, { useState } from "react";
import { Search } from "lucide-react";

interface SearchFiltersBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedFilter: string;
  setSelectedFilter: (val: string) => void;
  selectedStatus?: string;
  setSelectedStatus?: (val: string) => void;
}

const FILTERS = [
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
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <div className="bg-[#0b141d]/75 border border-white/5 rounded-2xl p-2.5 flex flex-wrap md:flex-nowrap gap-3 items-center justify-between shadow-2xl backdrop-blur-md w-full relative z-20">
      {/* Left side: Search & Status Dropdown */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="relative flex items-center">
          <button
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            className="w-10 h-10 rounded-xl bg-[#08121a]/90 hover:bg-[#0c1b26] text-[#F7EFDD]/60 hover:text-white border border-white/5 flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="Tìm kiếm"
          >
            <Search size={16} />
          </button>
          {isSearchExpanded && (
            <input
              type="text"
              placeholder="Tìm bàn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="absolute left-12 w-44 bg-[#08121a] border border-white/5 rounded-xl py-2 px-3 text-xs text-[#F7EFDD] placeholder-[#F7EFDD]/30 focus:outline-none focus:border-[#F4B942]/60 focus:ring-1 focus:ring-[#F4B942]/60 transition-all z-20"
              autoFocus
              onBlur={() => {
                if (!searchQuery) setIsSearchExpanded(false);
              }}
            />
          )}
        </div>

        {setSelectedStatus && (
          <div className="relative shrink-0">
            <select
              value={selectedStatus || "all"}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#08121a]/90 hover:bg-[#0c1b26] border border-white/5 rounded-xl py-2 pl-4 pr-8 text-xs text-[#F7EFDD] focus:outline-none focus:border-[#F4B942]/60 focus:ring-1 focus:ring-[#F4B942]/60 transition-colors appearance-none cursor-pointer h-10"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="WAITING">Đang chờ</option>
              <option value="RUNNING">Đang chơi</option>
              <option value="CLOSED">Đã đóng</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#F7EFDD]/40 text-[10px]">▼</div>
          </div>
        )}
      </div>

      {/* Right side: Bets filter chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1 no-scrollbar shrink-0">
        {FILTERS.map((filter) => {
          const isActive = selectedFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                isActive
                  ? "bg-[#F4B942] border-[#F4B942] text-[#142019] shadow-md shadow-[#F4B942]/20 scale-[1.02]"
                  : "bg-[#08121a]/90 border-white/5 text-[#F7EFDD]/60 hover:text-white hover:bg-[#0c1b26]"
              }`}
            >
              <span className={`text-[13px] ${isActive ? "text-[#142019]" : filter.color}`}>
                {filter.suit}
              </span>
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
