"use client";

import httpClient from "@/core/api/http-client";
import { Ban, ShieldAlert, ShieldCheck, LogOut, BarChart3, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FormInput } from "@/components/ui/form";

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
  const [kickRoomId, setKickRoomId] = useState("");

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
      setKickRoomId("");
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
        <h1 className="text-2xl font-semibold text-slate-100">Quản lý người dùng</h1>
        <p className="text-slate-500 text-sm mt-1">Quản lý tài khoản người chơi, khóa bảo mật và hồ sơ.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-800/40 border-b border-slate-800 text-xs text-slate-500">
                <th className="p-3 font-medium">UID / Tên đăng nhập</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Trạng thái</th>
                <th className="p-3 font-medium">Ngày tham gia</th>
                <th className="p-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Không có người dùng nào.
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
                          <ShieldAlert size={12} /> Đã khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
                          <ShieldCheck size={12} /> Hoạt động
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
                            title="Khóa tài khoản"
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
            <button
              onClick={() => fetchUsers(nextCursor)}
              disabled={loadingMore}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loadingMore ? "Đang tải..." : "Tải thêm"}
            </button>
          </div>
        )}
      </div>

      {/* User details and stats modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-slate-100">Chi tiết người chơi</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-slate-400">Thông tin cơ bản</h3>
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 mt-2 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tên đăng nhập:</span>
                    <span className="font-semibold text-slate-200">{selectedUser.user_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-slate-300">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trạng thái:</span>
                    <span className={`font-semibold ${selectedUser.status === "BANNED" ? "text-rose-400" : "text-emerald-400"}`}>
                      {selectedUser.status === "BANNED" ? "Đã khóa" : "Hoạt động"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-400">Thống kê Game</h3>
                {statsLoading ? (
                  <div className="text-center text-slate-500 py-6 text-sm">Đang tải thống kê...</div>
                ) : userStats ? (
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl text-center">
                      <div className="text-slate-500 text-[11px] uppercase tracking-wider">Số Hand</div>
                      <div className="text-lg font-semibold text-slate-100 mt-1">{userStats.hands_played}</div>
                    </div>
                    <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl text-center">
                      <div className="text-slate-500 text-[11px] uppercase tracking-wider">Rake đóng</div>
                      <div className="text-lg font-semibold text-amber-500 mt-1">${userStats.rake_contributed}</div>
                    </div>
                    <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl text-center">
                      <div className="text-slate-500 text-[11px] uppercase tracking-wider">Net Win/Loss</div>
                      <div className={`text-lg font-semibold mt-1 ${userStats.net_win_loss >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {userStats.net_win_loss >= 0 ? "+" : ""}${userStats.net_win_loss}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-6 text-sm">Không tìm thấy thống kê.</div>
                )}
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-3">
                <h3 className="text-sm font-medium text-slate-400">Trục xuất khỏi bàn chơi</h3>
                <div className="flex gap-2">
                  <FormInput
                    type="text"
                    placeholder="Nhập ID bàn đấu"
                    value={kickRoomId}
                    onChange={(e) => setKickRoomId(e.target.value)}
                    className="flex-1"
                  />
                  <button
                    onClick={() => handleForceKick(selectedUser.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-slate-100 text-sm font-medium rounded-lg transition-colors shadow-lg shadow-rose-600/10"
                  >
                    <LogOut size={14} /> Trục xuất
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}