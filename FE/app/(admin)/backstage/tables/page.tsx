"use client";

import httpClient from "@/core/api/http-client";
import { CircleDollarSign, PowerOff, Users, Play, Pause, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminTablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for creating a table
  const [formData, setFormData] = useState({
    name: "",
    game_type: "TEXAS",
    small_blind: "5",
    ante: "0",
    max_players: 9,
    min_buyin: "400",
    max_buyin: "2000",
    rake_rate: 5.0,
    rake_cap: "30",
    allow_bomb_pot: false,
    allow_rit: false,
  });

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

  const handlePause = async (id: string) => {
    try {
      await httpClient.post(`/api/v1/admin/tables/${id}/pause`);
      setTables(prev => prev.map(t => t.id === id ? { ...t, status: "paused" } : t));
    } catch (e) {
      alert("Tạm dừng bàn thất bại");
    }
  };

  const handleResume = async (id: string) => {
    try {
      await httpClient.post(`/api/v1/admin/tables/${id}/resume`);
      setTables(prev => prev.map(t => t.id === id ? { ...t, status: "waiting" } : t));
    } catch (e) {
      alert("Tiếp tục bàn thất bại");
    }
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await httpClient.post("/api/v1/admin/tables", {
        name: formData.name,
        game_type: formData.game_type,
        small_blind: formData.small_blind,
        ante: formData.ante,
        max_players: Number(formData.max_players),
        min_buyin: formData.min_buyin,
        max_buyin: formData.max_buyin,
        rake_rate: Number(formData.rake_rate),
        rake_cap: formData.rake_cap,
        custom_settings: {
          allow_bomb_pot: formData.allow_bomb_pot,
          allow_rit: formData.allow_rit,
        }
      });
      if (res.data?.success) {
        setIsModalOpen(false);
        fetchTables();
        // Reset form
        setFormData({
          name: "",
          game_type: "TEXAS",
          small_blind: "5",
          ante: "0",
          max_players: 9,
          min_buyin: "400",
          max_buyin: "2000",
          rake_rate: 5.0,
          rake_cap: "30",
          allow_bomb_pot: false,
          allow_rit: false,
        });
      }
    } catch (e) {
      alert("Tạo bàn chơi thất bại");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Quản lý bàn</h1>
          <p className="text-slate-500 text-sm mt-1">Theo dõi bàn đang hoạt động, cấu hình cược và các thao tác admin.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-600/10"
        >
          <Plus size={16} /> Tạo bàn mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-slate-500">Đang tải danh sách bàn...</div>
        ) : tables.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500">Không có bàn nào đang hoạt động.</div>
        ) : (
          tables.map((table) => (
            <div key={table.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative flex flex-col hover:border-slate-700 transition-colors">
              {table.status === "closed" && (
                <div className="absolute inset-0 bg-slate-950/90 z-10 flex items-center justify-center rounded-xl">
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-400 text-xs rounded-md font-medium border border-slate-700">Đã đóng</span>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">{table.name}</h3>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {table.id}</div>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full ${table.status === "paused" ? "bg-amber-500 animate-pulse" : table.status === "closed" ? "bg-slate-600" : "bg-emerald-500"} mt-1.5`} />
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
                {table.ante && table.ante !== "0" && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Ante</span>
                    <span className="font-medium text-slate-200">${table.ante}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Users size={14} /> Số ghế tối đa
                  </span>
                  <span className="font-medium text-slate-200">{table.max_players}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Rake Rate / Cap</span>
                  <span className="font-medium text-slate-200">{table.rake_rate}% / ${table.rake_cap}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Trạng thái</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${table.status === "paused" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                    {table.status?.toUpperCase() || "WAITING"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-slate-800/60">
                {table.status === "paused" ? (
                  <button
                    onClick={() => handleResume(table.id)}
                    className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors text-xs border border-emerald-500/20"
                  >
                    <Play size={13} /> Tiếp tục
                  </button>
                ) : (
                  <button
                    onClick={() => handlePause(table.id)}
                    className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors text-xs border border-amber-500/20"
                  >
                    <Pause size={13} /> Tạm dừng
                  </button>
                )}
                <button
                  onClick={() => handleClose(table.id)}
                  className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-xs border border-rose-500/20"
                >
                  <PowerOff size={13} /> Đóng bàn
                </button>
              </div>
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

      {/* Create Table Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-slate-100">Tạo bàn Poker mới</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTable} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Tên bàn chơi</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: High Roller Club"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Small Blind ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.small_blind}
                    onChange={(e) => setFormData(prev => ({ ...prev, small_blind: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Ante ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.ante}
                    onChange={(e) => setFormData(prev => ({ ...prev, ante: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Số ghế</label>
                  <select
                    value={formData.max_players}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_players: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="9">9 players</option>
                    <option value="6">6 players</option>
                    <option value="2">Heads Up (2)</option>
                  </select>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-medium text-slate-400">Kiểu chơi</label>
                  <select
                    value={formData.game_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, game_type: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="TEXAS">Texas Hold'em</option>
                    <option value="OMAHA">Omaha (PLO)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Min Buy-in ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.min_buyin}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_buyin: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Max Buy-in ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.max_buyin}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_buyin: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Tỉ lệ Rake (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={formData.rake_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, rake_rate: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Trần Rake Cap ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.rake_cap}
                    onChange={(e) => setFormData(prev => ({ ...prev, rake_cap: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-4 py-2.5 rounded-lg border border-slate-850/60 select-none">
                  <input
                    type="checkbox"
                    checked={formData.allow_bomb_pot}
                    onChange={(e) => setFormData(prev => ({ ...prev, allow_bomb_pot: e.target.checked }))}
                    className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-900 w-4 h-4"
                  />
                  <span className="text-xs font-medium text-slate-300">Cho phép Bomb Pot</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-4 py-2.5 rounded-lg border border-slate-850/60 select-none">
                  <input
                    type="checkbox"
                    checked={formData.allow_rit}
                    onChange={(e) => setFormData(prev => ({ ...prev, allow_rit: e.target.checked }))}
                    className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-900 w-4 h-4"
                  />
                  <span className="text-xs font-medium text-slate-300">Cho phép RIT</span>
                </label>
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-750"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-600/10"
                >
                  Tạo ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}