"use client";

import { useSocket } from "@/core/providers/SocketProvider";
import { UserProvider, useCurrentUser } from "@/core/providers/user-provider";
import api from "@/lib/axios";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Coins,
  Compass,
  Cpu,
  HelpCircle,
  Lock,
  LogOut,
  Mail,
  Play,
  Plus,
  Settings,
  ShieldAlert,
  Signal,
  Trophy,
  User,
  Wallet
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CreateTableModal } from "./components/CreateTableModal";
import { EventBanner } from "./components/EventBanner";
import { HeroBanner } from "./components/HeroBanner";
import { LobbyWidgets } from "./components/LobbyWidgets";
import { SearchFiltersBar } from "./components/SearchFiltersBar";
import { TableCard } from "./components/TableCard";
import { formatChips } from "./components/utils";

const DEFAULT_CHIPS_BALANCE = "50000000";

// Map dữ liệu API -> UI
function mapRoomsResponse(data: any) {
  if (!data?.rooms) return [];
  return data.rooms.map((t: any) => ({
    id: t.room_id.toString(),
    name: t.room_name,
    game_type: t.game_type === "PLO" ? "Omaha" : "Texas Hold'em",
    table_visibility: t.table_visibility || "PUBLIC",
    small_blind: t.small_blind.toString(),
    big_blind: t.big_blind.toString(),
    max_players: t.max_players,
    current_players: t.current_players_count,
    min_buyin: t.min_buy_in.toString(),
    max_buyin: t.max_buy_in.toString(),
    status: t.status,
    is_active: true,
  }));
}

function PokerGameLobby() {
  const router = useRouter();
  const { currentUser, isLoadingUser } = useCurrentUser();
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();



  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedGameType, setSelectedGameType] = useState("all");
  const [selectedMaxPlayers, setSelectedMaxPlayers] = useState("all");
  const [hideFull, setHideFull] = useState(false);
  const [hidePrivate, setHidePrivate] = useState(false);

  // View state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"cash" | "private">("cash");

  // Quick Play State
  const [qpGameType, setQpGameType] = useState("NLH");
  const [qpStake, setQpStake] = useState("micro");

  // Performance/System stats
  const [fps, setFps] = useState(60);
  const [ping, setPing] = useState(0);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // FPS Counter
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let frameCount = 0;
    const animate = (time: number) => {
      if (previousTimeRef.current != null) {
        const delta = time - previousTimeRef.current;
        frameCount++;
        if (delta >= 1000) {
          setFps(Math.round((frameCount * 1000) / delta));
          frameCount = 0;
          previousTimeRef.current = time;
        }
      } else {
        previousTimeRef.current = time;
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Ping monitor
  useEffect(() => {
    const checkPing = async () => {
      const start = performance.now();
      try {
        await api.get("/api/v1/lobby/stats");
        setPing(Math.round(performance.now() - start));
      } catch {
        setPing(999);
      }
    };
    checkPing();
    const interval = setInterval(checkPing, 5000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (type: "success" | "error", text: any) => {
    let formattedText = "Đã xảy ra lỗi không xác định.";
    if (typeof text === "string") {
      formattedText = text;
    } else if (Array.isArray(text)) {
      formattedText = text
        .map((err: any) => {
          if (typeof err === "object" && err !== null) {
            return err.error || err.message || JSON.stringify(err);
          }
          return String(err);
        })
        .join(", ");
    } else if (typeof text === "object" && text !== null) {
      formattedText = text.error || text.message || JSON.stringify(text);
    }
    setToast({ type, text: formattedText });
    setTimeout(() => setToast(null), 4000);
  };

  // Rooms Query
  const roomsQueryKey = [
    "rooms",
    searchQuery,
    selectedFilter,
    selectedStatus,
    activeTab,
  ] as const;

  const {
    data: tables = [],
    isFetching: loading,
  } = useQuery({
    queryKey: roomsQueryKey,
    queryFn: async () => {
      const res = await api.get("/api/v1/rooms", {
        params: {
          search_name: searchQuery,
          blind_category: selectedFilter,
          status: selectedStatus,
          show_private: activeTab === "private" ? "true" : "false",
          page: 1,
          limit: 100,
        },
      });
      return mapRoomsResponse(res.data);
    },
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  });

  // Chips balance query
  const { data: chipsBalance = DEFAULT_CHIPS_BALANCE } = useQuery({
    queryKey: ["wallet", "chips", currentUser?.id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/user/chips`);
      return res.data?.chips_balance ?? DEFAULT_CHIPS_BALANCE;
    },
    enabled: !!currentUser?.id,
  });

  // Lobby Stats query
  const { data: lobbyStats = { online_players: 1428, active_tables: 38, total_jackpot_pot: 1200000000 } } = useQuery({
    queryKey: ["lobby", "stats"],
    queryFn: async () => {
      const res = await api.get("/api/v1/lobby/stats");
      return res.data;
    },
    refetchInterval: 15_000,
  });

  // Claim free chips mutation
  const claimFreeChipsMutation = useMutation({
    mutationFn: async () => {
      const idempotencyKey = crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15);
      const res = await api.post(
        "/api/v1/wallet/free-chips",
        {},
        { headers: { "x-idempotency-key": idempotencyKey } }
      );
      return res.data;
    },
    onSuccess: (data) => {
      if (data?.chips_balance) {
        queryClient.setQueryData(["wallet", "chips", currentUser?.id], data.chips_balance);
        showToast("success", "Chúc mừng! Bạn vừa nhận 5,000,000 chips miễn phí 🎉");
      }
    },
    onError: (e: any) => {
      showToast("error", e.response?.data?.message || "Lỗi nhận chips miễn phí.");
    },
  });

  // Create room mutation
  const createTableMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post("/api/v1/rooms", payload);
      return res.data;
    },
    onSuccess: (data, payload) => {
      if (!data?.success) return;

      const newTableObj = {
        id: data.room_id.toString(),
        name: data.room_name,
        game_type: payload.game_type === "PLO" ? "Omaha" : "Texas Hold'em",
        table_visibility: payload.custom_settings?.table_visibility || "PUBLIC",
        small_blind: data.small_blind.toString(),
        big_blind: data.big_blind.toString(),
        max_players: data.max_players,
        current_players: data.current_players_count,
        min_buyin: data.min_buy_in.toString(),
        max_buyin: data.max_buy_in.toString(),
        is_active: true,
      };

      queryClient.setQueriesData<any[]>({ queryKey: ["rooms"] }, (old) =>
        old ? [newTableObj, ...old] : [newTableObj]
      );

      setIsCreateModalOpen(false);
      showToast("success", `Bàn "${payload.room_name}" đã sẵn sàng — chúc bạn may mắn!`);

      setTimeout(() => {
        router.push(`/poker-game/table/${newTableObj.id}`);
      }, 800);
    },
    onError: (err: any) => {
      showToast("error", err.response?.data?.message || "Không thể tạo bàn chơi lúc này.");
    },
  });

  // Join table mutation
  const joinTableMutation = useMutation({
    mutationFn: async (table: any) => {
      // If table is private, prompt for password
      let password;
      if (table.table_visibility === "PRIVATE") {
        password = prompt("Nhập mật khẩu để vào bàn chơi này:");
        if (password === null) return null; // user cancelled
      }
      const res = await api.post("/api/v1/rooms/join-request", { room_id: table.id, password });
      return { res: res.data, table };
    },
    onSuccess: (dataObj) => {
      if (!dataObj) return;
      const { res, table } = dataObj;
      if (!res?.success) return;
      showToast("success", `Đang mời bạn vào bàn "${table.name}"…`);
      setTimeout(() => {
        router.push(`/poker-game/table/${table.id}`);
      }, 800);
    },
    onError: (e: any) => {
      showToast("error", e.response?.data?.message || "Không thể vào bàn chơi lúc này.");
    },
  });

  // Spectate table mutation
  const spectateTableMutation = useMutation({
    mutationFn: async (table: any) => {
      const res = await api.post("/api/v1/rooms/spectate", { room_id: table.id });
      return { res: res.data, table };
    },
    onSuccess: ({ res, table }) => {
      if (!res?.success) return;
      showToast("success", `Ghế khán giả tại "${table.name}" đã sẵn sàng!`);
      setTimeout(() => {
        router.push(`/poker-game/table/${table.id}?spectate=true`);
      }, 800);
    },
    onError: (e: any) => {
      showToast("error", e.response?.data?.message || "Không thể xem bàn chơi lúc này.");
    },
  });

  // Quick Play handler
  const handleQuickPlay = () => {
    // Tìm các bàn thỏa mãn: Game Type khớp, stake (BB) khớp, còn chỗ trống, không phải Private
    const candidateTables = tables.filter((t: any) => {
      const tGame = t.game_type === "Omaha" ? "PLO" : "NLH";
      if (tGame !== qpGameType) return false;
      if (t.table_visibility === "PRIVATE") return false;
      if (t.current_players >= t.max_players) return false;

      const bb = parseInt(t.big_blind);
      let stakeMatch = true;
      if (qpStake === "micro") stakeMatch = bb <= 2000;
      else if (qpStake === "low") stakeMatch = bb > 2000 && bb <= 10000;
      else if (qpStake === "medium") stakeMatch = bb > 10000 && bb <= 50000;
      else if (qpStake === "high") stakeMatch = bb > 50000;

      return stakeMatch;
    });

    if (candidateTables.length > 0) {
      // Chọn bàn có nhiều người chơi nhất để đông vui
      const sorted = [...candidateTables].sort((a, b) => b.current_players - a.current_players);
      joinTableMutation.mutate(sorted[0]);
    } else {
      showToast("error", "Không tìm thấy bàn trống phù hợp mức cược đã chọn. Bạn có thể tự tạo bàn mới!");
      setTimeout(() => setIsCreateModalOpen(true), 1200);
    }
  };

  // Socket listener for real-time lobby updates
  useEffect(() => {
    if (!socket) return;
    socket.emit("lobby:subscribe");

    socket.on("lobby:room-status-changed", (data: { room_id: number; current_players_count: number }) => {
      if (!data) return;
      queryClient.setQueriesData<any[]>({ queryKey: ["rooms"] }, (old) =>
        old
          ? old.map((t) =>
            t.id === data.room_id.toString()
              ? { ...t, current_players: data.current_players_count }
              : t
          )
          : old
      );
    });

    return () => {
      socket.off("lobby:room-status-changed");
    };
  }, [socket, isConnected, queryClient]);

  // Client-side filtering of rooms list
  const filteredTables = tables.filter((t: any) => {
    // 1. Search Query
    const nameMatch = t.name.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Game type (Hold'em / Omaha)
    const typeMatch = selectedGameType === "all" || t.game_type === (selectedGameType === "PLO" ? "Omaha" : "Texas Hold'em");

    // 3. Status (WAITING / RUNNING)
    const statusMatch = selectedStatus === "all" || t.status === selectedStatus;

    // 4. Max players (9 / 6 / 2)
    const maxPlayersMatch = selectedMaxPlayers === "all" || t.max_players.toString() === selectedMaxPlayers;

    // 5. Hide full
    if (hideFull && t.current_players >= t.max_players) return false;

    // 6. Hide private
    if (hidePrivate && t.table_visibility === "PRIVATE") return false;

    // 7. Stakes (Blind category filter applied in API query, but let's sync client side as double check)
    const bb = parseInt(t.big_blind);
    let blindMatch = true;
    if (selectedFilter === "micro") blindMatch = bb <= 2000;
    else if (selectedFilter === "low") blindMatch = bb > 2000 && bb <= 10000;
    else if (selectedFilter === "medium") blindMatch = bb > 10000 && bb <= 50000;
    else if (selectedFilter === "high") blindMatch = bb > 50000;

    return nameMatch && typeMatch && statusMatch && maxPlayersMatch && blindMatch;
  });

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070e0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-[#F4B942]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#F4B942] animate-spin" />
            <Coins size={20} className="absolute inset-0 m-auto text-[#F4B942]" />
          </div>
          <p className="text-[#F7EFDD]/70 font-bold tracking-wide text-xs">Đang tải bàn đấu, vui lòng đợi giây lát…</p>
        </div>
      </div>
    );
  }

  const userInitial = currentUser?.user_name ? currentUser.user_name[0].toUpperCase() : "U";

  return (
    <div
      className="min-h-screen text-[#F7EFDD] pb-24 md:pb-12 px-4 md:px-8 relative overflow-hidden"
      style={{
        background: "radial-gradient(circle at 50% 0%, #12221b 0%, #060e0a 50%, #020504 100%)",
      }}
    >
      {/* Background card suits watermarks */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.035] select-none overflow-hidden z-0">
        {["♠", "♥", "♦", "♣", "♠", "♦"].map((s, i) => (
          <span
            key={i}
            className="absolute text-[12rem] md:text-[20rem] font-black leading-none"
            style={{
              top: `${(i * 37) % 100}%`,
              left: `${(i * 53) % 100}%`,
              transform: `rotate(${(i * 23) % 40 - 20}deg)`,
              color: s === "♥" || s === "♦" ? "#E23744" : "#F7EFDD",
            }}
          >
            {s}
          </span>
        ))}
      </div>

      {/* Top Premium Header Bar */}
      <header className="relative z-30 max-w-6xl mx-auto py-4 border-b border-white/5 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#F4B942] to-[#E0942A] flex items-center justify-center text-[#142019] text-xs font-black shadow-lg shadow-[#F4B942]/10 border border-[#F4B942]/20">
            CG
          </div>
          <div className="text-left">
            <span className="text-xs font-black tracking-widest text-[#F7EFDD] uppercase block">
              POKER <span className="text-[#F4B942]">LOBBY</span>
            </span>
            <span className="text-[9px] text-[#F7EFDD]/40 font-black uppercase tracking-widest block">
              Vegas Cash Game
            </span>
          </div>
        </div>

        {/* User profile & Menu Trigger */}
        <div className="flex items-center gap-3">
          {/* User Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 bg-[#0b141d]/75 border border-white/5 hover:border-[#F4B942]/30 rounded-2xl p-1.5 pl-2.5 transition-all cursor-pointer shadow-md select-none"
            >
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-xs font-bold text-[#F7EFDD]">{currentUser?.user_name || "Tài khoản"}</span>
                <span className="text-[8px] text-[#F4B942] font-black uppercase tracking-wider flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  VIP 3
                </span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-[#08121a] border border-[#F4B942]/20 flex items-center justify-center text-[#F4B942] font-black shadow-inner shrink-0">
                {userInitial}
              </div>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2.5 w-52 bg-[#0b141d]/98 border border-[#F4B942]/20 rounded-2xl overflow-hidden shadow-2xl z-40 p-2 text-left"
                  >
                    <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                      <span className="text-xs font-bold text-[#F7EFDD] block truncate">
                        {currentUser?.email || "Chưa đăng nhập"}
                      </span>
                      <span className="text-[9px] text-[#F7EFDD]/40 block uppercase font-bold tracking-wider mt-0.5">
                        User ID: {currentUser?.id?.slice(0, 8)}...
                      </span>
                    </div>

                    <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#F7EFDD]/85 hover:bg-[#F4B942]/10 hover:text-white transition-all cursor-pointer">
                      <User size={14} className="text-[#F4B942]" />
                      Thông tin cá nhân
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#F7EFDD]/85 hover:bg-[#F4B942]/10 hover:text-white transition-all cursor-pointer">
                      <Settings size={14} className="text-[#F4B942]" />
                      Cài đặt âm thanh
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#F7EFDD]/85 hover:bg-[#F4B942]/10 hover:text-white transition-all cursor-pointer">
                      <Mail size={14} className="text-[#F4B942]" />
                      Hộp thư thông báo
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#F7EFDD]/85 hover:bg-[#F4B942]/10 hover:text-white transition-all cursor-pointer">
                      <HelpCircle size={14} className="text-[#F4B942]" />
                      Hỗ trợ kỹ thuật
                    </button>

                    <div className="border-t border-white/5 my-1.5" />

                    <button
                      onClick={() => {
                        api.post("/api/v1/auth/logout").finally(() => {
                          localStorage.removeItem("token");
                          router.push("/login");
                        });
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                    >
                      <LogOut size={14} />
                      Đăng xuất
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto space-y-6 mt-6 relative z-10">
        {/* Toast alerts */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-semibold backdrop-blur-md text-white ${toast.type === "success" ? "bg-[#1b2b36]/95 border-[#F4B942]/40" : "bg-[#E23744]/95 border-[#E23744]"
                }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 size={18} className="shrink-0 text-[#F4B942]" />
              ) : (
                <ShieldAlert size={18} className="shrink-0 text-rose-100" />
              )}
              <span>{toast.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Banner Section */}
        <HeroBanner
          chipsBalance={chipsBalance}
          lobbyStats={lobbyStats}
          onClaimFreeChips={() => claimFreeChipsMutation.mutate()}
          onCreateTableClick={() => setIsCreateModalOpen(true)}
        />

        {/* Top Section: Event Banner & Quick Play Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 & 2: Event Banner */}
          <div className="lg:col-span-2">
            <EventBanner />
          </div>

          {/* Column 3: Quick Play Widget */}
          <div className="bg-[#0b141d]/75 border border-[#F4B942]/10 rounded-3xl p-5 backdrop-blur-md shadow-2xl flex flex-col justify-between h-full min-h-[220px]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Play size={16} className="text-[#F4B942]" />
                <h3 className="font-black text-sm text-[#F7EFDD] uppercase tracking-wider">Chơi nhanh (Quick Play)</h3>
              </div>

              {/* Game type quick select */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setQpGameType("NLH")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${qpGameType === "NLH"
                    ? "bg-[#F4B942] border-[#F4B942] text-[#142019] shadow-md shadow-[#F4B942]/5"
                    : "bg-[#08121a]/80 border-white/5 text-[#F7EFDD]/60 hover:text-white"
                    }`}
                >
                  Texas Hold&apos;em
                </button>
                <button
                  onClick={() => setQpGameType("PLO")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${qpGameType === "PLO"
                    ? "bg-[#F4B942] border-[#F4B942] text-[#142019] shadow-md shadow-[#F4B942]/5"
                    : "bg-[#08121a]/80 border-white/5 text-[#F7EFDD]/60 hover:text-white"
                    }`}
                >
                  Omaha PLO
                </button>
              </div>

              {/* Stake quick select */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: "micro", label: "Micro" },
                  { id: "low", label: "Thấp" },
                  { id: "medium", label: "Vừa" },
                  { id: "high", label: "Cao" },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setQpStake(st.id)}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all border ${qpStake === st.id
                      ? "bg-[#F4B942]/20 border-[#F4B942] text-[#F4B942]"
                      : "bg-[#08121a]/50 border-white/5 text-[#F7EFDD]/40 hover:text-[#F7EFDD]"
                      }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Play Button */}
            <button
              onClick={handleQuickPlay}
              className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-[#F4B942] to-[#E0942A] hover:brightness-110 text-[#142019] font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#F4B942]/10 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Vào Bàn Chơi Ngay</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Tab Selection: Cash Game vs Private Room */}
        <div className="flex items-center justify-between border-b border-white/5 pb-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("cash")}
              className={`pb-3 px-4 text-sm font-black uppercase tracking-wider relative transition-all cursor-pointer ${activeTab === "cash" ? "text-[#F4B942]" : "text-[#F7EFDD]/40 hover:text-[#F7EFDD]"
                }`}
            >
              Cash Game
              {activeTab === "cash" && (
                <motion.span layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F4B942]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("private")}
              className={`pb-3 px-4 text-sm font-black uppercase tracking-wider relative transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === "private" ? "text-[#F4B942]" : "text-[#F7EFDD]/40 hover:text-[#F7EFDD]"
                }`}
            >
              <Lock size={13} />
              Phòng Riêng Tư
              {activeTab === "private" && (
                <motion.span layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F4B942]" />
              )}
            </button>
          </div>

          {/* Quick Create Table Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="pb-3 text-xs font-black text-[#F4B942] hover:text-[#E0942A] transition-colors flex items-center gap-1 uppercase tracking-wider cursor-pointer"
          >
            <Plus size={14} />
            Tạo bàn chơi mới
          </button>
        </div>

        {/* Filters Bar */}
        <SearchFiltersBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedGameType={selectedGameType}
          setSelectedGameType={setSelectedGameType}
          selectedMaxPlayers={selectedMaxPlayers}
          setSelectedMaxPlayers={setSelectedMaxPlayers}
          hideFull={hideFull}
          setHideFull={setHideFull}
          hidePrivate={hidePrivate}
          setHidePrivate={setHidePrivate}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Tables list container */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[#0b141d]/40 rounded-3xl border border-white/5">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-[#F4B942]/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#F4B942] animate-spin" />
            </div>
            <span className="text-[#F7EFDD]/50 font-medium text-sm">Đang tải bàn chơi...</span>
          </div>
        ) : filteredTables.length > 0 ? (
          viewMode === "grid" ? (
            /* Card Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTables.map((table: any, idx: number) => (
                <TableCard
                  key={table.id}
                  table={table}
                  idx={idx}
                  onJoinTable={(t) => joinTableMutation.mutate(t)}
                  onSpectateTable={(t) => spectateTableMutation.mutate(t)}
                />
              ))}
            </div>
          ) : (
            /* Table Flat List View */
            <div className="bg-[#0b141d]/75 border border-white/5 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-black uppercase text-[#F7EFDD]/40 tracking-wider bg-[#08121a]/30">
                      <th className="py-4 px-5">Tên bàn chơi</th>
                      <th className="py-4 px-4">Game</th>
                      <th className="py-4 px-4">Blinds</th>
                      <th className="py-4 px-4">Buy-In</th>
                      <th className="py-4 px-4">Người chơi</th>
                      <th className="py-4 px-4 text-center">Trạng thái</th>
                      <th className="py-4 px-5 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredTables.map((table: any) => {
                      const isFull = table.current_players >= table.max_players;
                      const isPrivate = table.table_visibility === "PRIVATE";
                      return (
                        <tr key={table.id} className="hover:bg-white/5 transition-all">
                          <td className="py-4 px-5 font-bold text-[#F7EFDD] flex items-center gap-1.5">
                            {isPrivate && <Lock size={12} className="text-[#F4B942]" />}
                            {table.name}
                          </td>
                          <td className="py-4 px-4 font-semibold text-[#F7EFDD]/80">
                            {table.game_type}
                          </td>
                          <td className="py-4 px-4 font-black text-[#F4B942]">
                            {formatChips(table.small_blind)}/{formatChips(table.big_blind)}
                          </td>
                          <td className="py-4 px-4 font-semibold text-[#F7EFDD]/60">
                            {formatChips(table.min_buyin)} - {formatChips(table.max_buyin)}
                          </td>
                          <td className="py-4 px-4 font-bold text-[#F7EFDD]">
                            {table.current_players}/{table.max_players}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {table.status === "RUNNING" ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-400 font-black text-[9px] border border-emerald-500/20">
                                Đang chơi
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-400 font-black text-[9px] border border-amber-500/20">
                                Đang chờ
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => spectateTableMutation.mutate(table)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#08121a]/80 hover:bg-[#08121a] border border-[#F4B942]/15 text-[#F7EFDD]/60 hover:text-[#F7EFDD] transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer"
                              >
                                Theo dõi
                              </button>
                              <button
                                onClick={() => joinTableMutation.mutate(table)}
                                disabled={isFull}
                                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${isFull
                                  ? "bg-[#08121a]/60 text-[#F7EFDD]/30 border border-white/5 cursor-not-allowed"
                                  : "bg-gradient-to-r from-[#F4B942] to-[#E0942A] hover:brightness-110 text-[#142019]"
                                  }`}
                              >
                                {isFull ? "Bàn đầy" : "Vào chơi"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* Empty Filter state */
          <div className="py-20 text-center flex flex-col items-center justify-center bg-[#0B151F]/45 border border-white/5 rounded-[2rem] backdrop-blur-md shadow-2xl relative overflow-hidden">
            {/* Subtle glow behind suits */}
            <div className="absolute w-40 h-40 rounded-full bg-[#F4B942]/5 blur-3xl pointer-events-none -top-10" />

            <div className="flex gap-3 mb-5 text-4xl select-none relative z-10">
              <span className="text-white/30 hover:text-white/50 transition-colors cursor-default">♠</span>
              <span className="text-[#E23744]/45 hover:text-[#E23744]/75 transition-colors cursor-default">♥</span>
              <span className="text-[#E23744]/45 hover:text-[#E23744]/75 transition-colors cursor-default">♦</span>
              <span className="text-white/30 hover:text-white/50 transition-colors cursor-default">♣</span>
            </div>
            <h3
              className="text-xl font-medium text-[#F7EFDD] relative z-10"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Không tìm thấy bàn chơi phù hợp
            </h3>
            <p className="text-[#F7EFDD]/50 text-xs max-w-sm mt-2 leading-relaxed relative z-10">
              Hãy điều chỉnh lại từ khóa tìm kiếm, bộ lọc mức cược hoặc tự tạo một bàn chơi mới để làm chủ bàn đấu ngay!
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-7 inline-flex items-center gap-1.5 px-6 py-3 text-xs font-black text-[#060e0a] rounded-full bg-gradient-to-r from-[#F4B942] to-[#E0942A] hover:brightness-110 transition-all shadow-lg shadow-[#F4B942]/10 active:scale-95 cursor-pointer uppercase tracking-wider relative z-10"
            >
              <Plus size={14} />
              Tạo bàn chơi mới
            </button>
          </div>
        )}

        {/* Lobby Social/Stats/Leaderboard Widgets */}
        <LobbyWidgets onJoinTable={(t) => joinTableMutation.mutate(t)} />

        {/* Footer info */}
        <footer className="w-full flex flex-wrap justify-between items-center gap-4 text-[10px] text-[#F7EFDD]/30 border-t border-white/5 pt-6 mt-8 font-black uppercase tracking-wider">
          <div className="flex items-center gap-3">
            <span>Phiên bản: v1.2.0-beta</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Cpu size={12} /> {fps} FPS
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Signal size={12} className={ping > 150 ? "text-rose-500" : "text-emerald-500"} />
              Ping: {ping}ms
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" />
            <span>Mạng chủ: Đang kết nối</span>
          </div>
        </footer>
      </main>

      {/* Create Table Modal overlay */}
      <CreateTableModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(payload) => createTableMutation.mutate(payload)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0b141d]/98 border-t border-white/5 flex md:hidden items-center justify-around py-2.5 backdrop-blur-md shadow-2xl">
        <button
          onClick={() => router.push("/poker-game")}
          className="flex flex-col items-center gap-1 text-[#F4B942] transition-colors"
        >
          <Compass size={18} />
          <span className="text-[9px] font-black uppercase tracking-wider">Sảnh</span>
        </button>

        <button
          onClick={() => showToast("success", "Vui lòng xem mục nhiệm vụ ở các widget bên dưới!")}
          className="flex flex-col items-center gap-1 text-[#F7EFDD]/50 hover:text-white transition-colors"
        >
          <Award size={18} />
          <span className="text-[9px] font-black uppercase tracking-wider">Nhiệm vụ</span>
        </button>

        <button
          onClick={() => showToast("success", "Vui lòng xem bảng xếp hạng ở các widget bên dưới!")}
          className="flex flex-col items-center gap-1 text-[#F7EFDD]/50 hover:text-white transition-colors"
        >
          <Trophy size={18} />
          <span className="text-[9px] font-black uppercase tracking-wider">Xếp hạng</span>
        </button>

        <button
          onClick={() => claimFreeChipsMutation.mutate()}
          className="flex flex-col items-center gap-1 text-[#F7EFDD]/50 hover:text-white transition-colors"
        >
          <Wallet size={18} />
          <span className="text-[9px] font-black uppercase tracking-wider">Nhận phỉnh</span>
        </button>
      </nav>

      {/* Brand accent 'N' logo bottom left */}
      <div className="fixed bottom-6 left-6 pointer-events-none select-none z-0 opacity-10 hidden md:block">
        <div className="w-12 h-12 rounded-full border border-[#F4B942]/20 flex items-center justify-center font-black text-xl text-[#F4B942]/40 tracking-wider backdrop-blur-sm shadow-inner">
          N
        </div>
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