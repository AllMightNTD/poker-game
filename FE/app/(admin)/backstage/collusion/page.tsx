"use client";

import { FormButton } from "@/components/ui/form";
import { RHFInput } from "@/components/ui/form/RhfFields";
import httpClient from "@/core/api/http-client";
import { Ban, Eye, Search, ShieldAlert, UserMinus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

export default function AdminCollusionPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const { control, getValues } = useForm({
    defaultValues: {
      searchQuery: "",
    },
  });

  const searchQuery = useWatch({ control, name: "searchQuery" });

  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLogs = useCallback(async (cursor?: string | null, clear = false) => {
    try {
      if (cursor) setLoadingMore(true);
      else setLoading(true);

      const params: any = { limit: 20 };
      if (cursor) params.cursor = cursor;
      if (searchQuery) params.search = searchQuery;

      const res = await httpClient.get("/api/v1/admin/security-logs", { params });

      if (res.data) {
        const newLogs = res.data.data || [];
        if (clear || !cursor) {
          setLogs(newLogs);
        } else {
          setLogs((prev) => [...prev, ...newLogs]);
        }
        setNextCursor(res.data.meta?.next_cursor || null);
        setHasMore(res.data.meta?.has_more || false);
      }
    } catch (e) {
      console.error(e);
      alert("Unable to load security alert logs");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchLogs();
    });
  }, [fetchLogs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (getValues("searchQuery") !== "" && getValues("searchQuery").trim().length > 0)
      fetchLogs(null, true);
  };

  const handleViewDetail = (log: any) => {
    setSelectedLogId(log.id);
    setDetail(log);
  };

  const handleBanUser = async (userId: string, username: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn KHÓA vĩnh viễn tài khoản của người chơi "${username}"?`)) {
      return;
    }
    setActionLoading(true);
    try {
      await httpClient.post(`/api/v1/admin/users/${userId}/ban`, {
        reason: "System detected collusion/fraud",
      });
      alert(`Đã khóa thành công tài khoản "${username}"`);
      setSelectedLogId(null);
      setDetail(null);
      fetchLogs(null, true);
    } catch (err: any) {
      console.error(err);
      alert(`Khóa tài khoản thất bại: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleKickPlayer = async (userId: string, username: string, roomId: string) => {
    if (!roomId) {
      alert("Missing room ID to perform eviction");
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn TRỤC XUẤT người chơi "${username}" ra khỏi phòng #${roomId}?`)) {
      return;
    }
    setActionLoading(true);
    try {
      await httpClient.post(`/api/v1/admin/users/${userId}/kick`, {
        roomId: String(roomId),
      });
      alert(`Đã trục xuất thành công người chơi "${username}" khỏi phòng`);
      setSelectedLogId(null);
      setDetail(null);
      fetchLogs(null, true);
    } catch (err: any) {
      console.error(err);
      alert(`Trục xuất thất bại: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="text-rose-500" />
            Anti-Collusion Logs
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Look up risk alert history for players sharing networks/devices or engaging in money laundering.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto items-center">
          <div className="flex-1 md:w-64">
            <RHFInput
              control={control}
              name="searchQuery"
              type="text"
              placeholder="Search username, IP..."
              leftIcon={<Search size={16} />}
              size="small"
            />
          </div>
          <FormButton
            type="submit"
            variant="contained"
            color="primary"
            size="medium"
            className="shrink-0"
          >
            Search
          </FormButton>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-800/40 border-b border-slate-800 text-xs text-slate-500">
                <th className="p-3 font-medium">Time</th>
                <th className="p-3 font-medium">Players</th>
                <th className="p-3 font-medium">Game room</th>
                <th className="p-3 font-medium">Risk Score</th>
                <th className="p-3 font-medium">Primary reason</th>
                <th className="p-3 font-medium">IP address</th>
                <th className="p-3 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">Loading alert data...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">No collusion alerts recorded.</td>
                </tr>
              ) : (
                logs.map((log) => {
                  const riskScore = log.metadata?.risk_score || 0;
                  let scoreColor = "text-emerald-400 bg-emerald-950/20 border-emerald-900/50";
                  if (riskScore >= 60) {
                    scoreColor = "text-rose-400 bg-rose-950/20 border-rose-900/50 font-bold";
                  } else if (riskScore >= 30) {
                    scoreColor = "text-amber-400 bg-amber-950/20 border-amber-900/50";
                  }

                  const reasons = log.metadata?.reasons || [];
                  const reasonsSnippet = reasons.length > 0 ? reasons.join(", ") : "N/A";

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="p-3 text-slate-400 text-xs font-mono">
                        {new Date(log.created_at).toLocaleString("vi-VN")}
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium text-slate-200">{log.user?.user_name || "Unknown"}</div>
                          <div className="text-[10px] text-slate-500 font-mono select-all">{log.user_id}</div>
                        </div>
                      </td>
                      <td className="p-3 text-slate-300">
                        {log.room?.name ? `${log.room.name} (#${log.room_id})` : `#${log.room_id || "N/A"}`}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${scoreColor}`}>
                          {riskScore}/100
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 max-w-[240px] truncate" title={reasonsSnippet}>
                        {reasonsSnippet}
                      </td>
                      <td className="p-3 text-slate-400 font-mono text-xs">{log.ip_address || "-"}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleViewDetail(log)}
                          className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <div className="p-4 border-t border-slate-800 text-center bg-slate-900/50">
            <FormButton
              onClick={() => fetchLogs(nextCursor)}
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

      {/* Log Detail Modal */}
      {selectedLogId && detail && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  <ShieldAlert size={18} className="text-rose-500" />
                  Detailed collusion alert
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Alert ID: {detail.id}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedLogId(null);
                  setDetail(null);
                }}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Summary row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Flagged players</span>
                  <span className="text-slate-200 font-semibold block">{detail.user?.user_name || "Unknown"}</span>
                  <span className="text-[10px] text-slate-500 font-mono block select-all">{detail.user_id}</span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Related tables</span>
                  <span className="text-slate-200 font-semibold block">
                    {detail.room?.name ? `${detail.room.name}` : `Phòng #${detail.room_id}`}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block">Room ID: {detail.room_id || "N/A"}</span>
                </div>
              </div>

              {/* Collusion Metrics details */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-300">Risk Score and Reasons</span>
                  <span className={`px-2 py-0.5 border rounded text-xs ${(detail.metadata?.risk_score || 0) >= 60
                    ? 'text-rose-400 bg-rose-950/20 border-rose-900/50 font-semibold'
                    : 'text-amber-400 bg-amber-950/20 border-amber-900/50'
                    }`}>
                    Risk Score: {detail.metadata?.risk_score || 0}/100
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">List of duplicate factors</span>
                  <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
                    {(detail.metadata?.reasons || []).map((reason: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Technical context */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Environment / Device Parameters</h3>
                <div className="grid grid-cols-1 gap-3 text-xs font-mono">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60">
                    <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-1">IP address</span>
                    <span className="text-slate-300 select-all">{detail.ip_address || "Unknown"}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60">
                    <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-1">Browser User Agent</span>
                    <span className="text-slate-300 select-all break-all leading-normal text-xs">{detail.user_agent || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0 flex gap-3 justify-end">
              <FormButton
                onClick={() => {
                  setSelectedLogId(null);
                  setDetail(null);
                }}
                disabled={actionLoading}
                variant="outlined"
                className="text-slate-400 hover:text-slate-200"
              >
                Close
              </FormButton>

              {detail.room_id && (
                <FormButton
                  onClick={() => handleKickPlayer(detail.user_id, detail.user?.user_name || "Unknown", detail.room_id)}
                  disabled={actionLoading}
                  isLoading={actionLoading}
                  variant="contained"
                  color="warning"
                  startIcon={<UserMinus size={14} />}
                >
                  Kick from table
                </FormButton>
              )}

              <FormButton
                onClick={() => handleBanUser(detail.user_id, detail.user?.user_name || "Unknown")}
                disabled={actionLoading}
                isLoading={actionLoading}
                variant="contained"
                color="error"
                startIcon={<Ban size={14} />}
              >
                Lock account
              </FormButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
