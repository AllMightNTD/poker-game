import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { formatChips } from "./utils";
import { Trophy, History, Users, Flame, ExternalLink, Award, CheckCircle2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface LobbyWidgetsProps {
  onJoinTable: (table: any) => void;
}

export const LobbyWidgets: React.FC<LobbyWidgetsProps> = ({ onJoinTable }) => {
  const router = useRouter();

  // 1. Fetch Recently Played Rooms
  const { data: recentRooms = [] } = useQuery({
    queryKey: ["rooms", "recent"],
    queryFn: async () => {
      const res = await api.get("/api/v1/lobby/recent");
      return res.data;
    },
    staleTime: 30_000,
  });

  // 2. Fetch Leaderboard
  const { data: leaderboard = [] } = useQuery({
    queryKey: ["lobby", "leaderboard"],
    queryFn: async () => {
      const res = await api.get("/api/v1/lobby/leaderboard");
      return res.data;
    },
    staleTime: 60_000,
  });

  // 3. Fetch Active Players (Friends Playing simulation)
  const { data: activePlayers = [] } = useQuery({
    queryKey: ["lobby", "active-players"],
    queryFn: async () => {
      const res = await api.get("/api/v1/lobby/active-players");
      return res.data;
    },
    staleTime: 15_000,
  });

  // Mock Missions (can be stored in localStorage later if needed)
  const missions = [
    { id: 1, title: "Chơi 100 Ván Bài (Texas/Omaha)", progress: 45, target: 100, reward: "500K Chips", status: "in_progress" },
    { id: 2, title: "Thắng Showdown với Mậu Thầu/Đôi", progress: 3, target: 5, reward: "200K Chips", status: "in_progress" },
    { id: 3, title: "Nhận Chips miễn phí hôm nay", progress: 1, target: 1, reward: "5M Chips", status: "completed" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
      {/* Column 1: Recently Played & Friends Playing */}
      <div className="space-y-6">
        {/* Recently Played Widget */}
        <div className="bg-[#0b141d]/75 border border-white/5 rounded-3xl p-5 backdrop-blur-md shadow-2xl flex flex-col justify-between h-fit min-h-[220px]">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
              <History size={16} className="text-[#F4B942]" />
              <h3 className="font-black text-sm text-[#F7EFDD] uppercase tracking-wider">Bàn chơi vừa qua</h3>
            </div>

            {recentRooms.length > 0 ? (
              <div className="space-y-2.5">
                {recentRooms.slice(0, 3).map((room: any) => (
                  <div
                    key={room.room_id}
                    onClick={() => router.push(`/poker-game/table/${room.room_id}`)}
                    className="flex justify-between items-center bg-[#08121a]/80 hover:bg-[#0c1b26] border border-white/5 hover:border-[#F4B942]/20 rounded-2xl p-3 transition-all cursor-pointer group"
                  >
                    <div className="text-left space-y-1">
                      <span className="text-xs font-bold text-[#F7EFDD] group-hover:text-[#F4B942] transition-colors block">
                        {room.room_name}
                      </span>
                      <span className="text-[10px] text-[#F7EFDD]/40 font-bold uppercase tracking-wider block">
                        Blind: {formatChips(room.small_blind)}/{formatChips(room.big_blind)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-[#F7EFDD]/60 bg-white/5 border border-white/5 rounded-lg px-2 py-1">
                        {room.current_players_count}/{room.max_players} Players
                      </span>
                      <ExternalLink size={12} className="text-[#F7EFDD]/40 group-hover:text-[#F4B942] transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-[#F7EFDD]/40">
                <span className="text-xs font-medium">Bạn chưa chơi bàn nào gần đây.</span>
                <span className="text-[10px] uppercase font-bold mt-1 text-[#F4B942]/60">Vào bàn chơi để ghi lịch sử</span>
              </div>
            )}
          </div>
        </div>

        {/* Active Players / Friends Online Widget */}
        <div className="bg-[#0b141d]/75 border border-white/5 rounded-3xl p-5 backdrop-blur-md shadow-2xl flex flex-col justify-between h-fit min-h-[260px]">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
              <Users size={16} className="text-[#F4B942]" />
              <h3 className="font-black text-sm text-[#F7EFDD] uppercase tracking-wider">Cao thủ đang chơi</h3>
            </div>

            {activePlayers.length > 0 ? (
              <div className="space-y-2.5 max-h-[190px] overflow-y-auto no-scrollbar">
                {activePlayers.map((player: any) => (
                  <div
                    key={`${player.user_id}-${player.table_id}`}
                    className="flex justify-between items-center bg-[#08121a]/80 border border-white/5 rounded-2xl p-3"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-8 h-8 rounded-full border border-[#F4B942]/20 overflow-hidden bg-black/40 flex items-center justify-center shrink-0">
                        {player.avatar ? (
                          <Image src={player.avatar} alt={player.username} className="w-full h-full object-cover" width={32} height={32} />
                        ) : (
                          <span className="text-[10px] font-black text-[#F4B942]">{player.username[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-[#F7EFDD] block">{player.username}</span>
                        <span className="text-[9px] text-[#F4B942]/70 font-semibold block flex items-center gap-1">
                          <Flame size={10} /> Đang chơi tại: {player.table_name}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onJoinTable({ id: player.table_id.toString(), name: player.table_name })}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#F4B942] to-[#E0942A] hover:brightness-110 text-[#142019] text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      Vào Bàn
                      <ChevronRight size={10} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-[#F7EFDD]/40">
                <span className="text-xs font-medium">Hiện tại không có người chơi khác trực tuyến.</span>
                <span className="text-[10px] uppercase font-bold mt-1 text-[#F4B942]/60">Mời thêm bạn bè cùng tham gia</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Column 2: Leaderboard & Missions */}
      <div className="space-y-6">
        {/* Leaderboard Widget */}
        <div className="bg-[#0b141d]/75 border border-white/5 rounded-3xl p-5 backdrop-blur-md shadow-2xl flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
              <Trophy size={16} className="text-[#F4B942]" />
              <h3 className="font-black text-sm text-[#F7EFDD] uppercase tracking-wider">Bảng xếp hạng cao thủ</h3>
            </div>

            {leaderboard.length > 0 ? (
              <div className="space-y-2 max-h-[280px] overflow-y-auto no-scrollbar">
                {leaderboard.map((user: any, index: number) => {
                  const isTop3 = index < 3;
                  const rankColors = [
                    "bg-gradient-to-r from-amber-400 to-amber-600 text-black",
                    "bg-gradient-to-r from-slate-300 to-slate-400 text-black",
                    "bg-gradient-to-r from-amber-700 to-amber-800 text-white",
                  ];
                  return (
                    <div
                      key={user.username + index}
                      className="flex justify-between items-center bg-[#08121a]/60 border border-white/5 rounded-2xl p-2.5 hover:bg-[#08121a]/90 transition-all"
                    >
                      <div className="flex items-center gap-3 text-left">
                        {/* Rank Badge */}
                        <div
                          className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                            isTop3 ? rankColors[index] : "bg-white/5 text-[#F7EFDD]/60 border border-white/5"
                          }`}
                        >
                          {user.rank}
                        </div>

                        {/* User info */}
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full border border-white/5 overflow-hidden bg-black/30 flex items-center justify-center shrink-0">
                            {user.avatar ? (
                              <Image src={user.avatar} alt={user.username} className="w-full h-full object-cover" width={28} height={28} />
                            ) : (
                              <span className="text-[9px] font-black text-[#F4B942]">{user.username[0].toUpperCase()}</span>
                            )}
                          </div>
                          <span className="text-xs font-bold text-[#F7EFDD] truncate max-w-[120px]">
                            {user.username}
                          </span>
                        </div>
                      </div>

                      {/* Chip Balance */}
                      <span className="text-xs font-black text-[#F4B942] tracking-tight">
                        {formatChips(user.chips)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-[#F7EFDD]/40">
                <span className="text-xs font-medium">Đang tải bảng xếp hạng...</span>
              </div>
            )}
          </div>
        </div>

        {/* Missions Widget */}
        <div className="bg-[#0b141d]/75 border border-white/5 rounded-3xl p-5 backdrop-blur-md shadow-2xl flex flex-col justify-between min-h-[180px]">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
              <Award size={16} className="text-[#F4B942]" />
              <h3 className="font-black text-sm text-[#F7EFDD] uppercase tracking-wider">Nhiệm vụ hàng ngày</h3>
            </div>

            <div className="space-y-3.5">
              {missions.map((mission) => {
                const isDone = mission.status === "completed";
                return (
                  <div key={mission.id} className="space-y-1.5 text-left">
                    <div className="flex justify-between items-center text-xs">
                      <span className={`font-bold ${isDone ? "text-[#F7EFDD]/40 line-through" : "text-[#F7EFDD]"}`}>
                        {mission.title}
                      </span>
                      <span className="text-[10px] font-black text-[#F4B942]">
                        {isDone ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 size={12} /> Đã Nhận
                          </span>
                        ) : (
                          `Thưởng: ${mission.reward}`
                        )}
                      </span>
                    </div>

                    <div className="relative w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isDone ? "bg-emerald-500/80" : "bg-gradient-to-r from-[#F4B942] to-[#E0942A]"
                        }`}
                        style={{ width: `${(mission.progress / mission.target) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
