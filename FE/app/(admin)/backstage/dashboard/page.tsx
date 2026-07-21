"use client";

import httpClient from "@/core/api/http-client";
import { Gamepad2, ShieldCheck, Users, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [statsData, setStatsData] = useState({
    users: "...",
    tables: "...",
    pendingAmount: "...",
    pendingCount: "...",
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersRes, tablesRes, txnsRes] = await Promise.all([
          httpClient.get("/api/v1/users"),
          httpClient.get("/api/v1/admin/tables"),
          httpClient.get("/api/v1/admin/transactions"),
        ]);

        const usersCount = usersRes.data?.data?.length || 0;
        
        const activeTables = tablesRes.data?.data?.filter((t: any) => t.status !== "closed")?.length || 0;
        
        const pendingTxns = txnsRes.data?.data?.filter((tx: any) => tx.status === "PENDING" && tx.type === "DEPOSIT") || [];
        const pendingAmount = pendingTxns.reduce((sum: number, tx: any) => sum + parseInt(tx.amount || "0"), 0);

        setStatsData({
          users: usersCount.toLocaleString(),
          tables: activeTables.toString(),
          pendingAmount: `$${pendingAmount.toLocaleString()}`,
          pendingCount: `${pendingTxns.length} giao dịch`,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    { title: "Total users", value: statsData.users, change: "Registered" },
    { title: "Active tables", value: statsData.tables, change: "Real-time" },
    { title: "Pending deposits", value: statsData.pendingAmount, change: statsData.pendingCount },
    { title: "Security alerts", value: "0", change: "System stable" },
  ];

  const icons = [Users, Gamepad2, WalletCards, ShieldCheck];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">System overview</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time metrics and operational status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = icons[i];
          return (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center mb-3 text-slate-400">
                <Icon size={18} />
              </div>
              <div className="text-2xl font-semibold text-slate-100 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500 flex items-center justify-between">
                {stat.title}
                <span className="text-slate-400">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 h-80 flex flex-col">
          <h2 className="text-sm font-medium text-slate-300 mb-4">Revenue & table fees (last 7 days)</h2>
          <div className="flex-1 flex items-center justify-center text-sm text-slate-600 border border-dashed border-slate-800 rounded-lg">
            [ Chart component ]
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          <h2 className="text-sm font-medium text-slate-300 mb-4">Recent logs</h2>
          <div className="flex-1 flex items-center justify-center text-sm text-slate-600 border border-dashed border-slate-800 rounded-lg">
            [ Audit log feed ]
          </div>
        </div>
      </div>
    </div>
  );
}