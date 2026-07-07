"use client";

import httpClient from "@/core/api/http-client";
import { DollarSign, Landmark, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminRevenuePage() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await httpClient.get("/api/v1/admin/revenue/stats");
      if (res.data) {
        setStats(res.data);
      }
    } catch (e) {
      console.error(e);
      alert("Không thể tải báo cáo doanh thu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Báo cáo doanh thu</h1>
        <p className="text-slate-500 text-sm mt-1">Giám sát dòng tiền nạp rút, thống kê phí Rake thu về từ các ván bài Poker.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Đang tải dữ liệu doanh thu...</div>
      ) : stats ? (
        <>
          {/* Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between hover:border-slate-700 transition-colors">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block">Phí Rake thu về</span>
                <span className="text-2xl font-bold text-amber-500 mt-1 block">${stats.summary.total_rake}</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <DollarSign size={20} className="text-amber-500" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between hover:border-slate-700 transition-colors">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block">Tổng tiền Nạp</span>
                <span className="text-2xl font-bold text-emerald-500 mt-1 block">${stats.summary.total_deposit}</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <ArrowUpRight size={20} className="text-emerald-500" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between hover:border-slate-700 transition-colors">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block">Tổng tiền Rút</span>
                <span className="text-2xl font-bold text-rose-500 mt-1 block">${stats.summary.total_withdraw}</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <ArrowDownRight size={20} className="text-rose-500" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between hover:border-slate-700 transition-colors">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block">Dòng tiền ròng (Net Flow)</span>
                <span className={`text-2xl font-bold mt-1 block ${stats.summary.net_flow >= 0 ? "text-indigo-400" : "text-rose-400"}`}>
                  {stats.summary.net_flow >= 0 ? "+" : ""}${stats.summary.net_flow}
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Wallet size={20} className="text-indigo-400" />
              </div>
            </div>
          </div>

          {/* Daily reports grids */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Rake */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/60">
                <h3 className="text-sm font-semibold text-slate-100">Báo cáo phí Rake theo ngày</h3>
              </div>
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-800/20 border-b border-slate-800 text-xs text-slate-500">
                      <th className="p-3 font-medium">Ngày</th>
                      <th className="p-3 font-medium text-right">Phí Rake</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {stats.daily_rake.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="p-6 text-center text-slate-500">Không có dữ liệu 30 ngày qua.</td>
                      </tr>
                    ) : (
                      stats.daily_rake.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-800/10 transition-colors">
                          <td className="p-3 text-slate-300">{item.date}</td>
                          <td className="p-3 text-right font-medium text-amber-500">${item.amount}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Daily Transactions */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/60">
                <h3 className="text-sm font-semibold text-slate-100">Báo cáo nạp rút theo ngày</h3>
              </div>
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-800/20 border-b border-slate-800 text-xs text-slate-500">
                      <th className="p-3 font-medium">Ngày</th>
                      <th className="p-3 font-medium text-right">Nạp tiền</th>
                      <th className="p-3 font-medium text-right">Rút tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {stats.daily_transactions.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-6 text-center text-slate-500">Không có dữ liệu 30 ngày qua.</td>
                      </tr>
                    ) : (
                      stats.daily_transactions.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-800/10 transition-colors">
                          <td className="p-3 text-slate-300">{item.date}</td>
                          <td className="p-3 text-right font-medium text-emerald-400">${item.deposit}</td>
                          <td className="p-3 text-right font-medium text-rose-400">${item.withdraw}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-12 text-center text-slate-500">Không có dữ liệu.</div>
      )}
    </div>
  );
}
