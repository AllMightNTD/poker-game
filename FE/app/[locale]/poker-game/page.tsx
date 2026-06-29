"use client";

import React, { useState, useEffect } from "react";
import { UserProvider, useCurrentUser } from "@/core/providers/user-provider";
import { useSocket } from "@/core/providers/SocketProvider";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "@/i18n/routing";
import {
  Coins,
  Search,
  Plus,
  Users,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  User,
  Settings,
  X,
  Volume2,
  VolumeX,
  Trophy,
  Activity,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

// Mock initial tables to populate the lobby instantly if API is not fully set up
const MOCK_TABLES = [
  {
    id: "1",
    name: "Texas Hold'em - Beginner #1",
    game_type: "Texas Hold'em",
    small_blind: "1000",
    big_blind: "2000",
    max_players: 9,
    current_players: 5,
    min_buyin: "40000",
    max_buyin: "200000",
    is_active: true,
  },
  {
    id: "2",
    name: "Las Vegas High Stakes",
    game_type: "Texas Hold'em",
    small_blind: "50000",
    big_blind: "100000",
    max_players: 9,
    current_players: 8,
    min_buyin: "2000000",
    max_buyin: "10000000",
    is_active: true,
  },
  {
    id: "3",
    name: "VIP Diamond Room",
    game_type: "Texas Hold'em",
    small_blind: "10000",
    big_blind: "20000",
    max_players: 6,
    current_players: 3,
    min_buyin: "400000",
    max_buyin: "2000000",
    is_active: true,
  },
  {
    id: "4",
    name: "Macau Cash Game #4",
    game_type: "Texas Hold'em",
    small_blind: "5000",
    big_blind: "10000",
    max_players: 9,
    current_players: 6,
    min_buyin: "200000",
    max_buyin: "1000000",
    is_active: true,
  },
  {
    id: "5",
    name: "Heads Up Showdown",
    game_type: "Texas Hold'em",
    small_blind: "25000",
    big_blind: "50000",
    max_players: 2,
    current_players: 1,
    min_buyin: "1000000",
    max_buyin: "5000000",
    is_active: true,
  },
  {
    id: "6",
    name: "Quick Play - Fast Fold",
    game_type: "Texas Hold'em",
    small_blind: "2000",
    big_blind: "4000",
    max_players: 9,
    current_players: 4,
    min_buyin: "80000",
    max_buyin: "400000",
    is_active: true,
  },
];

function PokerGameLobby() {
  const router = useRouter();
  const { currentUser, isLoadingUser } = useCurrentUser();
  const { socket, isConnected } = useSocket();
  
  const [lobbyStats, setLobbyStats] = useState({
    online_players: 1428,
    active_tables: 38,
    total_jackpot_pot: 1200000000,
  });

  const [tables, setTables] = useState<any[]>(MOCK_TABLES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all"); // all, micro, low, medium, high
  const [selectedGameType, setSelectedGameType] = useState("all"); // all, Texas Hold'em, Omaha
  
  // Wallet state
  const [chipsBalance, setChipsBalance] = useState<string>("50000000"); // Default 50M chips
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // Form fields for new table
  const [newTableName, setNewTableName] = useState("");
  const [newGameType, setNewGameType] = useState("Texas Hold'em");
  const [newSmallBlind, setNewSmallBlind] = useState("1000");
  const [newBigBlind, setNewBigBlind] = useState("2000");
  const [newMaxPlayers, setNewMaxPlayers] = useState(9);
  const [newMinBuyin, setNewMinBuyin] = useState("40000");
  const [newMaxBuyin, setNewMaxBuyin] = useState("200000");
  const [isCustomSmallBlind, setIsCustomSmallBlind] = useState(false);
  
  // Sound controls
  const [muteAll, setMuteAll] = useState(false);
  const [bgVolume, setBgVolume] = useState(50);
  const [soundEffectsVol, setSoundEffectsVol] = useState(70);
  
  // Toast notifications
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch real tables from backend
  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/rooms", {
        params: {
          search_name: searchQuery,
          blind_category: selectedFilter,
          page: 1,
          limit: 50,
        }
      });
      if (res.data && res.data.rooms) {
        const mapped = res.data.rooms.map((t: any) => ({
          id: t.room_id.toString(),
          name: t.room_name,
          game_type: "Texas Hold'em",
          small_blind: t.small_blind.toString(),
          big_blind: t.big_blind.toString(),
          max_players: t.max_players,
          current_players: t.current_players_count,
          min_buyin: t.min_buy_in.toString(),
          max_buyin: t.max_buy_in.toString(),
          is_active: true,
        }));
        setTables(mapped);
      } else {
        setTables([]);
      }
    } catch (e) {
      console.warn("Failed to fetch poker tables from backend.", e);
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user chips wallet from backend
  const fetchWallet = async () => {
    if (!currentUser) return;
    try {
      const res = await api.get(`/api/v1/user/chips`);
      if (res.data && res.data.chips_balance) {
        setChipsBalance(res.data.chips_balance);
      }
    } catch (e) {
      console.warn("Failed to fetch wallet balance.", e);
    }
  };

  // WebSocket Lobby subscription & events
  useEffect(() => {
    if (!socket) return;
    
    socket.emit("lobby:subscribe");

    socket.on("lobby:stats-update", (data: any) => {
      if (data) {
        setLobbyStats({
          online_players: data.online_players,
          active_tables: data.active_tables,
          total_jackpot_pot: data.total_jackpot_pot,
        });
      }
    });

    socket.on("lobby:room-status-changed", (data: { room_id: number; current_players_count: number }) => {
      if (data) {
        setTables((prev) =>
          prev.map((t) => {
            if (t.id === data.room_id.toString()) {
              return { ...t, current_players: data.current_players_count };
            }
            return t;
          })
        );
      }
    });

    return () => {
      socket.off("lobby:stats-update");
      socket.off("lobby:room-status-changed");
    };
  }, [socket, isConnected]);

  useEffect(() => {
    fetchTables();
  }, [currentUser, searchQuery, selectedFilter]);

  useEffect(() => {
    fetchWallet();
  }, [currentUser]);
  
  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-emerald-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-400 font-semibold tracking-wide">Đang tải dữ liệu người chơi...</p>
        </div>
      </div>
    );
  }

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Handle claiming free chips with idempotency key header
  const claimFreeChips = async () => {
    try {
      const idempotencyKey = crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15);
      const res = await api.post("/api/v1/wallet/free-chips", {}, {
        headers: {
          "x-idempotency-key": idempotencyKey,
        }
      });
      if (res.data && res.data.chips_balance) {
        setChipsBalance(res.data.chips_balance);
        showToast("success", "Bạn đã nhận thành công 5,000,000 chips miễn phí! 🎉");
      }
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || "Lỗi nhận chips miễn phí.";
      showToast("error", errorMsg);
    }
  };

  // Handle Table Creation
  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) {
      showToast("error", "Vui lòng nhập tên bàn chơi.");
      return;
    }

    const sbVal = parseInt(newSmallBlind);
    if (isNaN(sbVal) || sbVal <= 0) {
      showToast("error", "Vui lòng nhập Small Blind hợp lệ lớn hơn 0.");
      return;
    }

    const payload = {
      name: newTableName,
      game_type: newGameType,
      small_blind: sbVal,
      big_blind: sbVal * 2,
      max_players: newMaxPlayers,
      min_buyin: sbVal * 40,
      max_buyin: sbVal * 200,
    };

    try {
      const res = await api.post("/api/v1/rooms", payload);
      
      if (res.data && res.data.success) {
        const newTableObj = {
          id: res.data.room_id.toString(),
          name: res.data.room_name,
          game_type: newGameType,
          small_blind: res.data.small_blind.toString(),
          big_blind: res.data.big_blind.toString(),
          max_players: res.data.max_players,
          current_players: res.data.current_players_count,
          min_buyin: res.data.min_buy_in.toString(),
          max_buyin: res.data.max_buy_in.toString(),
          is_active: true,
        };

        setTables((prev) => [newTableObj, ...prev]);
        setIsCreateModalOpen(false);
        setNewTableName("");
        setIsCustomSmallBlind(false);
        showToast("success", `Tạo bàn chơi "${newTableName}" thành công!`);

        setTimeout(() => {
          router.push(`/poker-game/table/${newTableObj.id}`);
        }, 800);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Không thể tạo bàn chơi lúc này.";
      showToast("error", errorMsg);
    }
  };

  // Handle join table request
  const handleJoinTable = async (table: any) => {
    try {
      const res = await api.post("/api/v1/rooms/join-request", {
        room_id: table.id,
      });
      
      if (res.data && res.data.success) {
        showToast("success", `Đang kết nối vào bàn "${table.name}"...`);
        setTimeout(() => {
          router.push(`/poker-game/table/${table.id}`);
        }, 800);
      }
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || "Không thể vào bàn chơi lúc này.";
      showToast("error", errorMsg);
    }
  };

  // Handle spectating table request
  const handleSpectateTable = async (table: any) => {
    try {
      const res = await api.post("/api/v1/rooms/spectate", {
        room_id: table.id,
      });
      
      if (res.data && res.data.success) {
        showToast("success", `Đang kết nối xem bàn "${table.name}" với tư cách khán giả...`);
        setTimeout(() => {
          router.push(`/poker-game/table/${table.id}?spectate=true`);
        }, 800);
      }
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || "Không thể xem bàn chơi lúc này.";
      showToast("error", errorMsg);
    }
  };

  // Format currency
  const formatChips = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "0";
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toLocaleString();
  };

  // Filter tables
  const filteredTables = tables.filter((t) => {
    // Search query match
    const nameMatch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Game type match
    const typeMatch = selectedGameType === "all" || t.game_type === selectedGameType;
    
    // Blind limit filters
    const bb = parseInt(t.big_blind);
    let blindMatch = true;
    if (selectedFilter === "micro") blindMatch = bb <= 2000;
    else if (selectedFilter === "low") blindMatch = bb > 2000 && bb <= 10000;
    else if (selectedFilter === "medium") blindMatch = bb > 10000 && bb <= 50000;
    else if (selectedFilter === "high") blindMatch = bb > 50000;

    return nameMatch && typeMatch && blindMatch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
      {/* 🔔 Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-semibold backdrop-blur-md text-white ${
              toast.type === "success"
                ? "bg-emerald-600/95 border-emerald-500"
                : "bg-rose-600/95 border-rose-500"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={18} className="shrink-0 text-emerald-200" />
            ) : (
              <X size={18} className="shrink-0 text-rose-200" />
            )}
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🏆 Hero/Lobby Banner Section with dark felt theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 border border-emerald-800/40 p-6 md:p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={12} className="animate-pulse" />
              Sảnh Game Poker
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
              Texas Hold'em Club
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-md leading-relaxed">
              Trải nghiệm bàn chơi poker 3D đỉnh cao, âm thanh lồng tiếng chân thực và tranh tài cùng các cao thủ.
            </p>
          </div>

          {/* User Chips Wallet Status Widget */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 shrink-0 shadow-lg shadow-amber-500/5">
                <Coins size={24} className="animate-spin-slow" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block uppercase tracking-wider">Số dư Chips</span>
                <span className="text-xl font-black text-amber-400 tracking-tight">
                  {parseInt(chipsBalance).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={claimFreeChips}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/10 active:scale-95 whitespace-nowrap"
              >
                Nhận Chips Miễn Phí
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 font-bold text-xs transition-all flex items-center justify-center"
                title="Tạo bàn chơi"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Users size={14} />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Trực tuyến</span>
              <span className="text-xs md:text-sm font-bold text-slate-200">
                {lobbyStats.online_players.toLocaleString()} cao thủ
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Activity size={14} />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Số Bàn Active</span>
              <span className="text-xs md:text-sm font-bold text-slate-200">
                {lobbyStats.active_tables} Bàn chơi
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Trophy size={14} />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Hũ Pot Hôm Nay</span>
              <span className="text-xs md:text-sm font-bold text-slate-200">
                {formatChips(lobbyStats.total_jackpot_pot.toString())} Chips
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 Search & Filters Bar */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Tìm tên bàn chơi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800/80 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1 no-scrollbar">
          {[
            { id: "all", label: "Tất cả blinds" },
            { id: "micro", label: "Micro (≤2K)" },
            { id: "low", label: "Thấp (2K - 10K)" },
            { id: "medium", label: "Trung bình (10K - 50K)" },
            { id: "high", label: "Cao (>50K)" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedFilter === filter.id
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {filter.label}
            </button>
          ))}

          {/* Quick Settings Gear button */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-slate-400 hover:text-slate-200 transition-all shrink-0 ml-1"
            title="Cài đặt game"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* 🗂️ Tables Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <svg className="animate-spin h-10 w-10 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-slate-400 font-medium text-sm">Đang tải danh sách bàn chơi...</span>
        </div>
      ) : filteredTables.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTables.map((table) => {
            const isFull = table.current_players >= table.max_players;
            return (
              <motion.div
                key={table.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800/80 hover:border-emerald-600/40 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-950/5 group"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/10">
                      {table.game_type}
                    </span>
                    <h3 className="font-extrabold text-slate-100 group-hover:text-emerald-400 transition-colors text-base tracking-tight">
                      {table.name}
                    </h3>
                  </div>

                  {/* Seat progress ring / occupancy status */}
                  <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800/60">
                    <Users size={13} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-200">
                      {table.current_players}/{table.max_players}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-950/40 rounded-xl p-3.5 border border-slate-800/40">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Blinds</span>
                    <span className="text-sm font-black text-amber-400">
                      {formatChips(table.small_blind)} / {formatChips(table.big_blind)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Buy-In Limit</span>
                    <span className="text-xs font-bold text-slate-300">
                      {formatChips(table.min_buyin)} - {formatChips(table.max_buyin)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleJoinTable(table)}
                    disabled={isFull}
                    className={`flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer ${
                      isFull
                        ? "bg-slate-800 text-slate-500 border border-slate-700/40 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-600/10 active:scale-95"
                    }`}
                  >
                    <span>Vào Bàn Chơi</span>
                    <ChevronRight size={14} />
                  </button>

                  <button
                    onClick={() => handleSpectateTable(table)}
                    className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800/60 text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center cursor-pointer"
                    title="Theo dõi bàn đấu"
                  >
                    <Eye size={15} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-lg">
          <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-slate-600 border border-slate-800/80 mb-4">
            <SlidersHorizontal size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-200">Không tìm thấy bàn chơi phù hợp</h3>
          <p className="text-slate-500 text-sm max-w-sm mt-1">
            Không tìm thấy bàn nào có bộ lọc hiện tại. Hãy thay đổi từ khóa tìm kiếm hoặc tạo bàn chơi mới.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 transition-all shadow-md active:scale-95"
          >
            <Plus size={14} />
            Tạo Bàn Chơi Mới
          </button>
        </div>
      )}

      {/* 🛠️ Create Table Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-800">
                <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                  <Plus size={20} className="text-emerald-500" />
                  Tạo Bàn Chơi Mới
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateTable} className="p-5 space-y-4">
                {/* Table Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tên bàn chơi</label>
                  <input
                    type="text"
                    required
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    placeholder="Ví dụ: Vegas Room, Beginner Stakes..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                  />
                </div>

                {/* Blind Levels Choice */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Small Blind</label>
                    {isCustomSmallBlind ? (
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          required
                          min={1}
                          placeholder="Nhập..."
                          value={newSmallBlind}
                          onChange={(e) => {
                            const sb = e.target.value;
                            setNewSmallBlind(sb);
                            const val = parseInt(sb) || 0;
                            setNewBigBlind((val * 2).toString());
                            setNewMinBuyin((val * 40).toString());
                            setNewMaxBuyin((val * 200).toString());
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-600 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomSmallBlind(false);
                            setNewSmallBlind("1000");
                            setNewBigBlind("2000");
                            setNewMinBuyin("40000");
                            setNewMaxBuyin("200000");
                          }}
                          className="px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
                        >
                          Mẫu
                        </button>
                      </div>
                    ) : (
                      <select
                        value={newSmallBlind}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "custom") {
                            setIsCustomSmallBlind(true);
                            setNewSmallBlind("");
                            setNewBigBlind("0");
                            setNewMinBuyin("0");
                            setNewMaxBuyin("0");
                          } else {
                            setNewSmallBlind(val);
                            const sbVal = parseInt(val) || 0;
                            setNewBigBlind((sbVal * 2).toString());
                            setNewMinBuyin((sbVal * 40).toString());
                            setNewMaxBuyin((sbVal * 200).toString());
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-600 transition-colors cursor-pointer"
                      >
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="200">200</option>
                        <option value="400">400</option>
                        <option value="600">600</option>
                        <option value="800">800</option>
                        <option value="1000">1,000</option>
                        <option value="custom">Tự nhập (Custom)...</option>
                      </select>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Big Blind</label>
                    <input
                      type="text"
                      disabled
                      value={parseInt(newBigBlind || "0").toLocaleString()}
                      className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl py-2.5 px-4 text-sm text-slate-500 focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Buy-In Limits info display */}
                <div className="grid grid-cols-2 gap-4 bg-slate-950/40 rounded-xl p-3 border border-slate-850">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Buy-In Tối Thiểu</span>
                    <span className="text-xs font-bold text-slate-200">{parseInt(newMinBuyin || "0").toLocaleString()} Chips</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Buy-In Tối Đa</span>
                    <span className="text-xs font-bold text-slate-200">{parseInt(newMaxBuyin || "0").toLocaleString()} Chips</span>
                  </div>
                </div>

                {/* Max players & Game Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Số người tối đa</label>
                    <select
                      value={newMaxPlayers}
                      onChange={(e) => setNewMaxPlayers(parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-600 transition-colors"
                    >
                      <option value={9}>9 Players (Full Table)</option>
                      <option value={6}>6 Players (Short Handed)</option>
                      <option value={2}>2 Players (Heads Up)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Loại game</label>
                    <select
                      value={newGameType}
                      onChange={(e) => setNewGameType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-600 transition-colors"
                    >
                      <option value="Texas Hold'em">Texas Hold'em</option>
                      <option value="Omaha">Omaha</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors shadow-lg active:scale-95"
                  >
                    Tạo & Vào Bàn
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ⚙️ Game Settings Modal */}
      <AnimatePresence>
        {isSettingsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-800">
                <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                  <Settings size={20} className="text-slate-400" />
                  Cấu Hình Game Poker
                </h3>
                <button
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 space-y-6">
                {/* Audio volume settings */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-slate-200">Âm thanh & Hiệu ứng</h4>
                    <button
                      onClick={() => setMuteAll(!muteAll)}
                      className={`p-1.5 rounded-lg flex items-center gap-1 text-[10px] font-bold uppercase transition-colors ${
                        muteAll ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-slate-850 text-slate-400"
                      }`}
                    >
                      {muteAll ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      {muteAll ? "Đã tắt tất cả" : "Mute all"}
                    </button>
                  </div>

                  {/* Dealer volume */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                      <span>Âm lượng Dealer lồng tiếng</span>
                      <span>{muteAll ? 0 : bgVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      disabled={muteAll}
                      value={muteAll ? 0 : bgVolume}
                      onChange={(e) => setBgVolume(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Sound effects volume */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                      <span>Hiệu ứng chia bài & gõ chip</span>
                      <span>{muteAll ? 0 : soundEffectsVol}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      disabled={muteAll}
                      value={muteAll ? 0 : soundEffectsVol}
                      onChange={(e) => setSoundEffectsVol(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Graphics Customization */}
                <div className="space-y-4 pt-4 border-t border-slate-800/60">
                  <h4 className="text-sm font-bold text-slate-200">Giao diện bàn chơi</h4>
                  
                  {/* Table Felt color */}
                  <div className="space-y-2">
                    <span className="text-xs text-slate-400 font-medium block">Màu sắc bàn đấu (Felt)</span>
                    <div className="grid grid-cols-4 gap-2">
                      {["Classic Green", "Royal Blue", "Crimson Red", "Midnight Black"].map((color) => (
                        <button
                          key={color}
                          onClick={() => showToast("success", `Đã lưu màu bàn đấu: ${color}`)}
                          className="py-2 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-emerald-600/40 text-[10px] font-bold text-slate-400 transition-colors"
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card Deck theme */}
                  <div className="space-y-2">
                    <span className="text-xs text-slate-400 font-medium block">Kiểu dáng lá bài (Deck back)</span>
                    <div className="grid grid-cols-3 gap-2">
                      {["Standard 2-Color", "4-Color Deck", "Neon Cyberpunk"].map((deck) => (
                        <button
                          key={deck}
                          onClick={() => showToast("success", `Đã chọn bộ bài: ${deck}`)}
                          className="py-2 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-emerald-600/40 text-[10px] font-bold text-slate-400 transition-colors"
                        >
                          {deck}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors shadow-lg"
                >
                  Xác nhận cấu hình
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

export default function PokerGamePage() {
  return (
    <UserProvider>
      <PokerGameLobby />
    </UserProvider>
  );
}
