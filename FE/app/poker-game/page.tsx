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
import { CheckCircle2, Coins, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreateTableModal } from "./components/CreateTableModal";
import { HeroBanner } from "./components/HeroBanner";
import { SearchFiltersBar } from "./components/SearchFiltersBar";
import { TableCard } from "./components/TableCard";

// Mock initial tables để lobby có dữ liệu ngay cả khi API chưa sẵn sàng
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
];

const DEFAULT_CHIPS_BALANCE = "50000000";

// ---- Hàm map dữ liệu API -> UI, tách riêng để tái sử dụng & dễ test
function mapRoomsResponse(data: any) {
  if (!data?.rooms) return [];
  return data.rooms.map((t: any) => ({
    id: t.room_id.toString(),
    name: t.room_name,
    game_type: "Texas Hold'em",
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

  const [lobbyStats, setLobbyStats] = useState({
    online_players: 1428,
    active_tables: 38,
    total_jackpot_pot: 1200000000,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedGameType] = useState("all");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  // ---------------------------------------------------------------------
  // 🗂️ Query: danh sách bàn
  // queryKey CHỈ dùng giá trị nguyên thủy (search/filter/status)
  // -> không phụ thuộc reference của currentUser nên mở modal không
  //    còn kích hoạt refetch nữa.
  // ---------------------------------------------------------------------
  const roomsQueryKey = ["rooms", searchQuery, selectedFilter, selectedStatus] as const;

  const {
    data: tables = MOCK_TABLES,
    isFetching: loading,
  } = useQuery({
    queryKey: roomsQueryKey,
    queryFn: async () => {
      const res = await api.get("/api/v1/rooms", {
        params: {
          search_name: searchQuery,
          blind_category: selectedFilter,
          status: selectedStatus,
          page: 1,
          limit: 50,
        },
      });
      return mapRoomsResponse(res.data);
    },
    placeholderData: keepPreviousData, // giữ list cũ khi filter thay đổi, tránh giật UI
    staleTime: 15_000,
  });

  // ---------------------------------------------------------------------
  // 💰 Query: ví chips — key dùng currentUser?.id (primitive), không dùng
  // cả object currentUser để tránh refetch thừa vì reference đổi.
  // ---------------------------------------------------------------------
  const { data: chipsBalance = DEFAULT_CHIPS_BALANCE } = useQuery({
    queryKey: ["wallet", "chips", currentUser?.id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/user/chips`);
      return res.data?.chips_balance ?? DEFAULT_CHIPS_BALANCE;
    },
    enabled: !!currentUser?.id,
  });

  // ---------------------------------------------------------------------
  // 🎁 Mutation: nhận free chips
  // ---------------------------------------------------------------------
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

  // ---------------------------------------------------------------------
  // 🛠️ Mutation: tạo bàn mới
  // ---------------------------------------------------------------------
  const createTableMutation = useMutation({
    mutationFn: async (payload: {
      room_name: string;
      game_type: string;
      small_blind: number;
      big_blind: number;
      max_players: number;
      min_buyin: number;
      max_buyin: number;
    }) => {
      const res = await api.post("/api/v1/rooms", payload);
      return res.data;
    },
    onSuccess: (data, payload) => {
      if (!data?.success) return;

      const newTableObj = {
        id: data.room_id.toString(),
        name: data.room_name,
        game_type: payload.game_type,
        small_blind: data.small_blind.toString(),
        big_blind: data.big_blind.toString(),
        max_players: data.max_players,
        current_players: data.current_players_count,
        min_buyin: data.min_buy_in.toString(),
        max_buyin: data.max_buy_in.toString(),
        is_active: true,
      };

      // Chèn bàn mới vào mọi query "rooms" đang cache, không cần gọi lại API
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

  // ---------------------------------------------------------------------
  // 🚪 Mutation: tham gia bàn
  // ---------------------------------------------------------------------
  const joinTableMutation = useMutation({
    mutationFn: async (table: any) => {
      const res = await api.post("/api/v1/rooms/join-request", { room_id: table.id });
      return { res: res.data, table };
    },
    onSuccess: ({ res, table }) => {
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

  // ---------------------------------------------------------------------
  // 👀 Mutation: xem bàn (spectate)
  // ---------------------------------------------------------------------
  const spectateTableMutation = useMutation({
    mutationFn: async (table: any) => {
      const res = await api.post("/api/v1/rooms/spectate", { room_id: table.id });
      return { res: res.data, table };
    },
    onSuccess: ({ res, table }) => {
      if (!res?.success) return;
      showToast("success", `Ghế khán giả tại "${table.name}" đã có bạn!`);
      setTimeout(() => {
        router.push(`/poker-game/table/${table.id}?spectate=true`);
      }, 800);
    },
    onError: (e: any) => {
      showToast("error", e.response?.data?.message || "Không thể xem bàn chơi lúc này.");
    },
  });

  // ---------------------------------------------------------------------
  // 🔌 WebSocket: cập nhật cache của React Query thay vì local state
  // ---------------------------------------------------------------------
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
      socket.off("lobby:stats-update");
      socket.off("lobby:room-status-changed");
    };
  }, [socket, isConnected, queryClient]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B3D2E]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-[#F4B942]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#F4B942] animate-spin" />
            <Coins size={20} className="absolute inset-0 m-auto text-[#F4B942]" />
          </div>
          <p className="text-[#F7EFDD]/70 font-semibold tracking-wide text-sm">Đang dọn bàn, mời quý khách chờ chút…</p>
        </div>
      </div>
    );
  }

  // Filter tables (client-side, giữ nguyên logic cũ)
  const filteredTables = tables.filter((t: { name: string; game_type: string; big_blind: string; }) => {
    const nameMatch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const typeMatch = selectedGameType === "all" || t.game_type === selectedGameType;

    const bb = parseInt(t.big_blind);
    let blindMatch = true;
    if (selectedFilter === "micro") blindMatch = bb <= 2000;
    else if (selectedFilter === "low") blindMatch = bb > 2000 && bb <= 10000;
    else if (selectedFilter === "medium") blindMatch = bb > 10000 && bb <= 50000;
    else if (selectedFilter === "high") blindMatch = bb > 50000;

    return nameMatch && typeMatch && blindMatch;
  });

  return (
    <div
      className="min-h-screen text-[#F7EFDD] py-8 px-4 md:px-8 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, #12221b 0%, #060e0a 50%, #020504 100%)",
      }}
    >
      {/* Brand N Indicator in bottom-left */}
      <div className="fixed bottom-6 left-6 w-9 h-9 rounded-full border border-white/10 flex items-center justify-center bg-black/40 backdrop-blur-sm z-30 select-none pointer-events-none">
        <span className="text-white/50 text-xs font-black">N</span>
      </div>

      <div className="pointer-events-none fixed inset-0 opacity-[0.03] select-none overflow-hidden">
        {["♠", "♥", "♦", "♣", "♠", "♦"].map((s, i) => (
          <span
            key={i}
            className="absolute text-[12rem] md:text-[18rem] font-black leading-none"
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

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-semibold backdrop-blur-md text-white ${toast.type === "success"
                ? "bg-[#1b2b36]/95 border-[#F4B942]/40"
                : "bg-[#E23744]/95 border-[#E23744]"
                }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 size={18} className="shrink-0 text-[#F4B942]" />
              ) : (
                <X size={18} className="shrink-0 text-rose-100" />
              )}
              <span>{toast.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <HeroBanner
          chipsBalance={chipsBalance}
          lobbyStats={lobbyStats}
          onClaimFreeChips={() => claimFreeChipsMutation.mutate()}
          onCreateTableClick={() => setIsCreateModalOpen(true)}
        />

        <SearchFiltersBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-[#F4B942]/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#F4B942] animate-spin" />
            </div>
            <span className="text-[#F7EFDD]/60 font-medium text-sm">Đang xếp bàn cho bạn...</span>
          </div>
        ) : filteredTables.length > 0 ? (
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
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="flex gap-2 mb-4 text-4xl select-none">
              <span className="text-white/60">♠</span>
              <span className="text-[#E23744]/80">♥</span>
              <span className="text-[#E23744]/80">♦</span>
              <span className="text-white/60">♣</span>
            </div>
            <h3 className="text-xl font-bold text-[#F7EFDD]">Chưa có bàn nào khớp bộ lọc</h3>
            <p className="text-[#F7EFDD]/50 text-sm max-w-sm mt-2 leading-relaxed">
              Thử đổi từ khóa tìm kiếm hoặc mức cược, hoặc tự mở một bàn mới — bạn làm chủ ván bài.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-6 inline-flex items-center gap-1.5 px-6 py-3 text-xs font-black text-[#142019] rounded-xl bg-[#F4B942] hover:bg-[#E0942A] transition-all shadow-lg active:scale-95"
            >
              <Plus size={14} />
              Tạo Bàn Chơi Mới
            </button>
          </div>
        )}

        <CreateTableModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={(payload) => createTableMutation.mutate(payload)}
        />
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