"use client";

import React, { useEffect, useState } from "react";
import { X, FileText, Download, TrendingUp, TrendingDown } from "lucide-react";
import { usePokerGame } from "../hooks/usePokerGame";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PlayerStats {
  user_id: string;
  username: string;
  seat_number: number;
  purchase_count: number;
  current_chips: number;
  cashout_chips: number;
  net_pnl: number;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose }) => {
  const { tableId, fetchStats } = usePokerGame();
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await fetchStats();
        if (data && Array.isArray(data.players)) {
          setStats(data.players);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [isOpen, fetchStats]);

  if (!isOpen) return null;

  const handleExportCsv = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
    window.open(`${apiBase}/api/v1/rooms/${tableId}/stats/export`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="text-emerald-500 w-5 h-5" />
            <h3 className="text-base font-black text-slate-100 uppercase tracking-wider">
              Thống Kê Tài Chính & Báo Cáo Phiên Chơi
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Chi tiết lãi/lỗ từng người chơi
            </span>
            <button
              onClick={handleExportCsv}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <Download size={14} /> Xuất Báo Cáo CSV
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-xs text-slate-500 animate-pulse">
              Đang tải báo cáo từ máy chủ...
            </div>
          ) : (
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-3">Ghế</th>
                    <th className="p-3">Tên Người Chơi</th>
                    <th className="p-3 text-right">Tổng Mua (Buy-in)</th>
                    <th className="p-3 text-right">Còn Lại (Stack)</th>
                    <th className="p-3 text-right">Đã Rút (Cashout)</th>
                    <th className="p-3 text-right">Lãi/Lỗ ròng (P&L)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {stats.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-600">
                        Chưa có dữ liệu thống kê nào.
                      </td>
                    </tr>
                  ) : (
                    stats.map((s) => {
                      const isProfit = s.net_pnl >= 0;
                      return (
                        <tr key={s.user_id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="p-3 font-mono text-slate-500">#{s.seat_number}</td>
                          <td className="p-3 font-black text-slate-300 uppercase">{s.username}</td>
                          <td className="p-3 text-right font-bold text-slate-400">
                            {s.purchase_count.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-bold text-amber-500">
                            {s.current_chips.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-bold text-slate-400">
                            {s.cashout_chips.toLocaleString()}
                          </td>
                          <td
                            className={`p-3 text-right font-black flex items-center justify-end gap-1 ${
                              isProfit ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {isProfit ? (
                              <TrendingUp size={12} className="inline animate-pulse" />
                            ) : (
                              <TrendingDown size={12} className="inline animate-pulse" />
                            )}
                            {isProfit ? "+" : ""}
                            {s.net_pnl.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
