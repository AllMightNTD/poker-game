"use client";

import { FormButton } from "@/components/ui/form";
import { RHFInput } from "@/components/ui/form/RhfFields";
import httpClient from "@/core/api/http-client";
import { Ban, BarChart3, LogOut, ShieldAlert, ShieldCheck, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Selected user for showing stats & extra actions
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userStats, setUserStats] = useState<any | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const { control } = useForm({
    defaultValues: { kickRoomId: "" },
  });
  const kickRoomId = useWatch({ control, name: "kickRoomId" });


  const fetchUsers = async (cursor?: string | null) => {
    try {
      if (cursor) setLoadingMore(true);
      else setLoading(true);

      const res = await httpClient.get("/api/v1/users", {
        params: cursor ? { cursor } : {}
      });
      if (res.data?.data) {
        setUsers(prev => cursor ? [...prev, ...res.data.data] : res.data.data);
        setNextCursor(res.data.meta?.next_cursor || null);
        setHasMore(res.data.meta?.has_more || false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchUsers();
    });
  }, []);

  const handleBan = async (id: string) => {
    if (!confirm("Xác nhận khóa tài khoản này?")) return;
    try {
      await httpClient.post(
        `/api/v1/users/${id}/ban`,
        { reason: "Admin Action" }
      );
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "BANNED" } : u));
      if (selectedUser?.id === id) {
        setSelectedUser({ ...selectedUser, status: "BANNED" });
      }
    } catch {
      alert("Khóa tài khoản thất bại");
    }
  };

  const handleUnban = async (id: string) => {
    if (!confirm("Xác nhận mở khóa tài khoản này?")) return;
    try {
      await httpClient.post(`/api/v1/users/${id}/unban`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "ACTIVE" } : u));
      if (selectedUser?.id === id) {
        setSelectedUser({ ...selectedUser, status: "ACTIVE" });
      }
    } catch {
      alert("Mở khóa tài khoản thất bại");
    }
  };

  const handleForceKick = async (id: string) => {
    if (!kickRoomId) {
      alert("Vui lòng nhập Room ID để trục xuất");
      return;
    }
    if (!confirm(`Xác nhận trục xuất người chơi khỏi bàn ${kickRoomId}?`)) return;
    try {
      await httpClient.post(`/api/v1/users/${id}/kick`, { roomId: kickRoomId });
      alert("Đã gửi yêu cầu trục xuất người chơi thành công");
      // To reset, we would need setValue from useForm, but this is a minor detail
    } catch {
      alert("Trục xuất người chơi thất bại");
    }
  };

  const handleViewStats = async (user: any) => {
    setSelectedUser(user);
    setStatsLoading(true);
    setUserStats(null);
    try {
      const res = await httpClient.get(`/api/v1/users/${user.id}/stats`);
      if (res.data) {
        setUserStats(res.data);
      }
    } catch (e) {
      console.error(e);
      alert("Không thể lấy thống kê chi tiết người chơi");
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">User management</h1>
        <p className="text-slate-500 text-sm mt-1">Manage player accounts, security keys, and profiles.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-800/40 border-b border-slate-800 text-xs text-slate-500">
                <th className="p-3 font-medium">UID / Username</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Joined Date</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Loading data...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    There are no users.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <div className="font-medium text-slate-100">{user.user_name}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{user.id.substring(0, 8)}...</div>
                    </td>
                    <td className="p-3 text-slate-300">{user.email}</td>
                    <td className="p-3">
                      {user.status === "BANNED" ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 text-red-400 text-xs border border-red-500/20">
                          <ShieldAlert size={12} /> Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
                          <ShieldCheck size={12} /> Active
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500">
                      {new Date(user.created_at).toLocaleDateString("vi-VN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleViewStats(user)}
                          className="p-1.5 rounded-md text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors"
                          title="Chi tiết & Thống kê"
                        >
                          <BarChart3 size={16} />
                        </button>
                        {user.status === "BANNED" ? (
                          <button
                            onClick={() => handleUnban(user.id)}
                            className="p-1.5 rounded-md text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                            title="Mở khóa tài khoản"
                          >
                            <ShieldCheck size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBan(user.id)}
                            className="p-1.5 rounded-md text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                            title="Lock account"
                          >
                            <Ban size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {hasMore && (
          <div className="p-4 border-t border-slate-800 text-center">
            <FormButton
              onClick={() => fetchUsers(nextCursor)}
              disabled={loadingMore}
              isLoading={loadingMore}
              variant="contained"
              color="primary"
              size="small"
            >
              Load more
            </FormButton>
          </div>
        )}
      </div>

      {/* User details and stats modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">

            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]" />
                <h2 className="text-base font-bold text-slate-100 tracking-tight">Chi tiết người chơi</h2>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">

              {/* 1. Thông tin cơ bản */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <User size={14} className="text-slate-500" />
                  <span>Account information</span>
                </div>

                <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 space-y-3 text-sm shadow-inner">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Username</span>
                    <span className="font-bold text-slate-100 font-mono">{selectedUser.user_name}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-900 pt-3">
                    <span className="text-slate-500">Email</span>
                    <span className="text-slate-300 font-medium">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-900 pt-3">
                    <span className="text-slate-500">Status</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${selectedUser.status === "BANNED"
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      }`}>
                      <span className={`size-1.5 rounded-full mr-1.5 ${selectedUser.status === "BANNED" ? "bg-rose-400" : "bg-emerald-400"}`} />
                      {selectedUser.status === "BANNED" ? "Đã khóa" : "Active"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Thống kê dữ liệu ván đấu */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <BarChart3 size={14} className="text-slate-500" />
                  <span>Performance statistics</span>
                </div>

                {statsLoading ? (
                  <div className="flex flex-col items-center justify-center bg-slate-950/40 border border-slate-850 rounded-xl py-8 gap-2">
                    <div className="size-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-slate-500">Loading statistics...</span>
                  </div>
                ) : userStats ? (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl text-center shadow-sm">
                      <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Number of Hands</div>
                      <div className="text-xl font-bold text-slate-100 font-mono mt-1">{userStats.hands_played}</div>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl text-center shadow-sm">
                      <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Rake đóng</div>
                      <div className="text-xl font-bold text-amber-500 font-mono mt-1">${userStats.rake_contributed}</div>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl text-center shadow-sm">
                      <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Net Win/Loss</div>
                      <div className={`text-xl font-bold font-mono mt-1 ${userStats.net_win_loss >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {userStats.net_win_loss >= 0 ? "+" : ""}${userStats.net_win_loss}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 bg-slate-950/40 border border-slate-850 rounded-xl py-6 text-xs italic">
                    No statistics found for this player.
                  </div>
                )}
              </div>

              {/* 3. Vùng Hành động nguy hiểm (Danger Zone) - Có nền riêng tách biệt hẳn */}
              <div className="border border-rose-950/40 bg-rose-950/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
                  <ShieldAlert size={14} />
                  <span>Admin quick actions</span>
                </div>

                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <RHFInput
                      control={control}
                      name="kickRoomId"
                      type="text"
                      placeholder="Nhập chính xác ID bàn đấu..."
                      className="bg-slate-950 border-slate-800 rounded-xl focus:border-rose-500/50 text-sm h-10"
                    />
                  </div>
                  <FormButton
                    onClick={() => handleForceKick(selectedUser.id)}
                    variant="contained"
                    className="!bg-rose-600 hover:!bg-rose-500 !text-white h-10 px-4 rounded-xl flex items-center gap-1.5 text-sm font-semibold shadow-md shrink-0"
                  >
                    <LogOut size={14} />
                    <span>Kick</span>
                  </FormButton>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}