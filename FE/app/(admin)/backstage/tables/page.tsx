"use client";

import httpClient from "@/core/api/http-client";
import { CircleDollarSign, PowerOff, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminTablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchTables = async (cursor?: string | null) => {
    try {
      if (cursor) setLoadingMore(true);
      else setLoading(true);

      const res = await httpClient.get("/api/v1/admin/tables", {
        params: cursor ? { cursor } : {}
      });
      if (res.data?.data) {
        setTables(prev => cursor ? [...prev, ...res.data.data] : res.data.data);
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
    fetchTables();
  }, []);

  const handleClose = async (id: string) => {
    if (!confirm("Đóng bàn này? Tất cả người chơi sẽ bị rời khỏi bàn.")) return;
    try {
      await httpClient.post(`/api/v1/admin/tables/${id}/close`);
      setTables(prev => prev.map(t => t.id === id ? { ...t, status: "closed" } : t));
    } catch (e) {
      alert("Đóng bàn thất bại");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Quản lý bàn</h1>
        <p className="text-slate-500 text-sm mt-1">Theo dõi bàn đang hoạt động, cấu hình rake và thao tác đóng bàn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-slate-500">Đang tải danh sách bàn...</div>
        ) : tables.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500">Không có bàn nào đang hoạt động.</div>
        ) : (
          tables.map((table) => (
            <div key={table.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative flex flex-col">
              {table.status === "closed" && (
                <div className="absolute inset-0 bg-slate-900/90 z-10 flex items-center justify-center rounded-xl">
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-400 text-xs rounded-md">Đã đóng</span>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">{table.name}</h3>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {table.id}</div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
              </div>

              <div className="space-y-2.5 mb-5 flex-1 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-2">
                    <CircleDollarSign size={14} /> Mức cược
                  </span>
                  <span className="font-medium text-slate-200">
                    ${table.small_blind} / ${table.big_blind}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Users size={14} /> Người chơi
                  </span>
                  <span className="font-medium text-slate-200">4 / {table.max_players}</span>
                </div>
              </div>

              <button
                onClick={() => handleClose(table.id)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm border border-slate-800"
              >
                <PowerOff size={15} /> Đóng bàn
              </button>
            </div>
          ))
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => fetchTables(nextCursor)}
            disabled={loadingMore}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loadingMore ? "Đang tải..." : "Tải thêm"}
          </button>
        </div>
      )}
    </div>
  );
}