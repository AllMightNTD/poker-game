"use client";

import React, { useEffect, useState } from "react";
import { X, FileText, Download, TrendingUp, TrendingDown } from "lucide-react";
import { usePokerGame } from "../hooks/usePokerGame";
import { httpClient } from "@/core/api/http-client";

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
  const { tableId, fetchStats, players, gameStage } = usePokerGame();
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Group key for player seats at table
  const playerIdsKey = players.map((p) => p?.id).filter(Boolean).join(",");
  const isHandEnded = gameStage === "ended";

  useEffect(() => {
    if (!isOpen) return;

    const loadStats = async () => {
      try {
        setStats((prev) => {
          if (prev.length === 0) setLoading(true);
          return prev;
        });
        const data = (await fetchStats()) as { players?: PlayerStats[] };
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
  }, [isOpen, fetchStats, playerIdsKey, isHandEnded]);

  if (!isOpen) return null;

  const handleExportCsv = async () => {
    try {
      const res = await httpClient.get(`/api/v1/rooms/${tableId}/stats/export`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `poker_stats_room_${tableId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Export CSV error:", e);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="text-emerald-500 w-4 h-4 sm:w-5 sm:h-5" />
            <h3 className="text-xs sm:text-base font-black text-slate-100 uppercase tracking-wider">
              Financial Statistics & Session Reports
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
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">
              Player Profit/Loss Details
            </span>
            <button
              onClick={handleExportCsv}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <Download size={12} /> Export CSV Report
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-xs text-slate-500 animate-pulse">
              Loading report from server...
            </div>
          ) : (
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40 overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px] sm:text-xs min-w-[450px] sm:min-w-0">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px] sm:text-xs">
                    <th className="p-3 hidden sm:table-cell">Seat</th>
                    <th className="p-3">Player Name</th>
                    <th className="p-3 text-right">Total Buy-in</th>
                    <th className="p-3 text-right">Stack</th>
                    <th className="p-3 text-right hidden sm:table-cell">Cashout</th>
                    <th className="p-3 text-right">Net P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {stats.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-600">
                        No stats available.
                      </td>
                    </tr>
                  ) : (
                    stats.map((s) => {
                      const livePlayer = players.find(
                        (p) => p && String(p.id) === String(s.user_id)
                      );
                      const current_chips = livePlayer
                        ? parseInt(livePlayer.chips || "0")
                        : s.current_chips;
                      const net_pnl = current_chips + s.cashout_chips - s.purchase_count;
                      const isProfit = net_pnl >= 0;

                      return (
                        <tr key={s.user_id} className="hover:bg-slate-900/30 transition-colors text-[11px] sm:text-xs">
                          <td className="p-3 font-mono text-slate-500 hidden sm:table-cell">#{s.seat_number}</td>
                          <td className="p-3 font-black text-slate-300 uppercase truncate max-w-[80px] sm:max-w-none">{s.username}</td>
                          <td className="p-3 text-right font-bold text-slate-400">
                            {s.purchase_count.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-bold text-amber-500">
                            {current_chips.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-bold text-slate-400 hidden sm:table-cell">
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
                            {net_pnl.toLocaleString()}
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
