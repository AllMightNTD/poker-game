"use client";

import httpClient from "@/core/api/http-client";
import { Check, Clock, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FormButton } from "@/components/ui/form";

export default function AdminFinancePage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchTxns = async (cursor?: string | null) => {
    try {
      if (cursor) setLoadingMore(true);
      else setLoading(true);

      const res = await httpClient.get("/api/v1/admin/transactions", {
        params: cursor ? { cursor } : {}
      });
      if (res.data?.data) {
        setTransactions(prev => cursor ? [...prev, ...res.data.data] : res.data.data);
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
      fetchTxns();
    });
  }, []);

  const handleProcess = async (id: string, status: "APPROVED" | "REJECTED") => {
    const label = status === "APPROVED" ? "approve" : "reject";
    if (!confirm(`Xác nhận ${label} giao dịch này?`)) return;
    try {
      await httpClient.post(
        `/api/v1/admin/transactions/${id}/process`,
        { status, notes: "Processed by Admin" }
      );
      setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status } : tx));
    } catch {
      alert("Failed to process transaction");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Financial Transactions</h1>
        <p className="text-slate-500 text-sm mt-1">Approve or reject player deposit/withdrawal requests.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-800/40 border-b border-slate-800 text-xs text-slate-500">
                <th className="p-3 font-medium">User / Transaction ID</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Amount</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Time</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading transactions...
                                                        </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No transactions found.
                                                            </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <div className="font-medium text-slate-100">{tx.user?.user_name || "Unknown"}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{tx.id.substring(0, 8)}...</div>
                    </td>
                    <td className="p-3">
                      <span className="text-xs px-2 py-1 rounded-md bg-slate-800 text-slate-300">
                        {tx.type === "DEPOSIT" ? "Deposit" : "Withdraw"}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-100">
                      ${parseInt(tx.amount || "0").toLocaleString()}
                    </td>
                    <td className="p-3">
                      {tx.status === "PENDING" && (
                        <span className="flex items-center gap-1.5 text-xs text-amber-400">
                          <Clock size={12} /> Waiting
                                                            </span>
                      )}
                      {tx.status === "APPROVED" && (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <Check size={12} /> Approved
                                                            </span>
                      )}
                      {tx.status === "REJECTED" && (
                        <span className="flex items-center gap-1.5 text-xs text-red-400">
                          <X size={12} /> Rejected
                                                            </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500">
                      {new Date(tx.created_at).toLocaleString("vi-VN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </td>
                    <td className="p-3 text-right">
                      {tx.status === "PENDING" && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleProcess(tx.id, "APPROVED")}
                            className="p-1.5 rounded-md text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleProcess(tx.id, "REJECTED")}
                            className="p-1.5 rounded-md text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
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
            <FormButton
              onClick={() => fetchTxns(nextCursor)}
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
    </div>
  );
}