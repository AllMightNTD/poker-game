"use client";

import httpClient from "@/core/api/http-client";
import { Ban, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

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
    fetchUsers();
  }, []);

  const handleBan = async (id: string) => {
    if (!confirm("Xác nhận khóa tài khoản này?")) return;
    try {
      await httpClient.post(
        `/api/v1/users/${id}/ban`,
        { reason: "Admin Action" }
      );
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "BANNED" } : u));
    } catch (e) {
      alert("Khóa tài khoản thất bại");
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
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800 text-red-400 text-xs">
                          <ShieldAlert size={12} /> Đã khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800 text-emerald-400 text-xs">
                          Hoạt động
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
                      {user.status !== "BANNED" && (
                        <button
                          onClick={() => handleBan(user.id)}
                          className="p-1.5 rounded-md text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          title="Khóa tài khoản"
                        >
                          <Ban size={16} />
                        </button>
                      )}
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
    </div>
  );
}