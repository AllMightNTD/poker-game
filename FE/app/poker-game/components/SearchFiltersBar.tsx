import React from "react";
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
  { id: "all", label: "Tất cả", suit: "🂠", color: "text-cream/70" },
  { id: "micro", label: "Micro (≤2K)", suit: "♠", color: "text-slate-300" },
  { id: "low", label: "Thấp (2K–10K)", suit: "♣", color: "text-emerald-300" },
  { id: "medium", label: "Vừa (10K–50K)", suit: "♦", color: "text-amber-300" },
  { id: "high", label: "Cao (>50K)", suit: "♥", color: "text-rose-300" },
];

export const SearchFiltersBar: React.FC<SearchFiltersBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedFilter,
  setSelectedFilter,
  selectedStatus,
  setSelectedStatus,
}) => {
  return (
    <div className="bg-[#0F4438]/80 border border-[#F4B942]/15 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg backdrop-blur-sm">
      <div className="flex w-full md:w-auto gap-3 flex-1 max-w-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F7EFDD]/40" size={18} />
          <input
            type="text"
            placeholder="Tìm tên bàn chơi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B3D2E] border border-[#F4B942]/15 rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#F7EFDD] placeholder-[#F7EFDD]/30 focus:outline-none focus:border-[#F4B942]/60 focus:ring-1 focus:ring-[#F4B942]/60 transition-colors"
          />
        </div>
        
        {setSelectedStatus && (
          <div className="relative shrink-0">
            <select
              value={selectedStatus || "all"}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#0B3D2E] border border-[#F4B942]/15 rounded-xl py-2.5 px-4 text-sm text-[#F7EFDD] focus:outline-none focus:border-[#F4B942]/60 focus:ring-1 focus:ring-[#F4B942]/60 transition-colors appearance-none pr-8 cursor-pointer"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="WAITING">Đang chờ</option>
              <option value="RUNNING">Đang chơi</option>
              <option value="CLOSED">Đã đóng</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#F4B942]/70 text-xs">▼</div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1 no-scrollbar shrink-0">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${selectedFilter === filter.id
              ? "bg-[#F4B942] text-[#142019] shadow-md shadow-[#F4B942]/20"
              : "bg-[#0B3D2E] text-[#F7EFDD]/60 hover:text-[#F7EFDD] hover:bg-[#0B3D2E]/70"
              }`}
          >
            <span className={selectedFilter === filter.id ? "" : filter.color}>{filter.suit}</span>
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};
