"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Search, Eye, X, ShieldAlert, Ban, UserX } from "lucide-react";
import httpClient from "@/core/api/http-client";

export default function FinancialAuditPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await httpClient.get("/api/v1/admin/financial-audit/chip-dumping");
      if (res.data && res.data.data) {
        setAlerts(res.data.data);
      }
    } catch (e) {
      console.error(e);
      alert("Không thể tải danh sách cảnh báo bơm chip");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Define fetch logic inline to satisfy react-hooks/set-state-in-effect rule
    (async () => {
      try {
        setLoading(true);
        const res = await httpClient.get("/api/v1/admin/financial-audit/chip-dumping");
        if (res.data && res.data.data) {
          setAlerts(res.data.data);
        }
      } catch (e) {
        console.error(e);
        alert("Không thể tải danh sách cảnh báo bơm chip");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleBanUser = async (userId: string, username: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn KHÓA tài khoản của người chơi "${username}"?`)) {
      return;
    }
    setActionLoading(true);
    try {
      await httpClient.post(`/api/v1/admin/users/${userId}/ban`, {
        reason: "Hệ thống phát hiện hành vi bơm chip/rửa tiền",
      });
      alert(`Đã khóa thành công tài khoản "${username}"`);
      setSelectedAlert(null);
      fetchAlerts();
    } catch (err: any) {
      console.error(err);
      alert(`Khóa tài khoản thất bại: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBanBoth = async (dumperId: string, dumperName: string, receiverId: string, receiverName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn KHÓA CẢ HAI tài khoản "${dumperName}" và "${receiverName}"?`)) {
      return;
    }
    setActionLoading(true);
    try {
      await httpClient.post(`/api/v1/admin/users/${dumperId}/ban`, {
        reason: "Hệ thống phát hiện hành vi bơm chip/rửa tiền (Tài khoản Dumper)",
      });
      await httpClient.post(`/api/v1/admin/users/${receiverId}/ban`, {
        reason: "Hệ thống phát hiện hành vi bơm chip/rửa tiền (Tài khoản Receiver)",
      });
      alert(`Đã khóa thành công cả hai tài khoản "${dumperName}" và "${receiverName}"`);
      setSelectedAlert(null);
      fetchAlerts();
    } catch (err: any) {
      console.error(err);
      alert(`Khóa hai tài khoản thất bại: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const term = searchQuery.toLowerCase();
    return (
      alert.dumper.username.toLowerCase().includes(term) ||
      alert.receiver.username.toLowerCase().includes(term) ||
      alert.dumper.id.includes(term) ||
      alert.receiver.id.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" />
            Kiểm toán tài chính & Phát hiện Bơm Chip (Chip Dumping)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Theo dõi và phát hiện các hành vi bơm chip bất thường giữa các tài khoản người chơi thông qua các ván bài chung.
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm người chơi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-slate-700 placeholder-slate-600 transition-colors"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-800/40 border-b border-slate-800 text-xs text-slate-500">
                <th className="p-3 font-medium">Tài khoản chuyển (Dumper)</th>
                <th className="p-3 font-medium">Tài khoản nhận (Receiver)</th>
                <th className="p-3 font-medium">Số ván chơi chung</th>
                <th className="p-3 font-medium">Tổng lượng chip đã cược</th>
                <th className="p-3 font-medium">Lượng chip nhận ròng</th>
                <th className="p-3 font-medium">Mức độ rủi ro</th>
                <th className="p-3 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">Đang phân tích dòng tiền...</td>
                </tr>
              ) : filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">Chưa phát hiện hành vi bơm chip bất thường nào.</td>
                </tr>
              ) : (
                filteredAlerts.map((alert, idx) => {
                  let riskColor = "text-emerald-400 bg-emerald-950/20 border-emerald-900/50";
                  if (alert.risk_level === "HIGH") {
                    riskColor = "text-rose-400 bg-rose-950/20 border-rose-900/50 font-bold";
                  } else if (alert.risk_level === "MEDIUM") {
                    riskColor = "text-amber-400 bg-amber-950/20 border-amber-900/50";
                  }

                  return (
                    <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                      <td className="p-3">
                        <div className="font-medium text-slate-200">{alert.dumper.username}</div>
                        <div className="text-[10px] text-slate-500 font-mono select-all">{alert.dumper.id}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-200">{alert.receiver.username}</div>
                        <div className="text-[10px] text-slate-500 font-mono select-all">{alert.receiver.id}</div>
                      </td>
                      <td className="p-3 text-slate-300 font-medium">{alert.joint_hands} ván</td>
                      <td className="p-3 text-slate-400 font-mono">{Number(alert.total_dumper_bet).toLocaleString()} chips</td>
                      <td className="p-3 text-emerald-400 font-mono font-medium">+{Number(alert.total_receiver_net).toLocaleString()} chips</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${riskColor}`}>
                          {alert.risk_level}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedAlert(alert)}
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
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 shrink-0">
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <ShieldAlert size={18} className="text-rose-500" />
                Chi tiết dòng tiền nghi vấn
              </h2>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Tài khoản chuyển (Dumper)</span>
                  <span className="text-slate-200 font-semibold block">{selectedAlert.dumper.username}</span>
                  <span className="text-[10px] text-slate-500 font-mono block select-all">{selectedAlert.dumper.id}</span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Tài khoản nhận (Receiver)</span>
                  <span className="text-slate-200 font-semibold block">{selectedAlert.receiver.username}</span>
                  <span className="text-[10px] text-slate-500 font-mono block select-all">{selectedAlert.receiver.id}</span>
                </div>
              </div>

              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-300">Thông tin dòng tiền ván bài chung</span>
                  <span className={`px-2 py-0.5 border rounded text-xs ${selectedAlert.risk_level === "HIGH" ? "text-rose-400 bg-rose-950/20 border-rose-900/50" : "text-amber-400 bg-amber-950/20 border-amber-900/50"}`}>
                    Rủi ro: {selectedAlert.risk_level}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Số ván chơi chung:</span>
                    <span className="text-slate-200 font-medium">{selectedAlert.joint_hands} ván</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tổng lượng chip dumper đã cược:</span>
                    <span className="text-slate-200 font-medium">{Number(selectedAlert.total_dumper_bet).toLocaleString()} chips</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tổng chip receiver đã thắng:</span>
                    <span className="text-slate-200 font-medium">{Number(selectedAlert.total_receiver_won).toLocaleString()} chips</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Lượng chip chênh lệch ròng:</span>
                    <span className="text-emerald-400 font-semibold">+{Number(selectedAlert.total_receiver_net).toLocaleString()} chips</span>
                  </div>
                </div>
              </div>

              {/* Actions panel */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hành động xử lý của Admin</h3>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleBanBoth(selectedAlert.dumper.id, selectedAlert.dumper.username, selectedAlert.receiver.id, selectedAlert.receiver.username)}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    <Ban size={16} />
                    Khóa cả hai tài khoản nghi vấn
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleBanUser(selectedAlert.dumper.id, selectedAlert.dumper.username)}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-sm font-medium rounded-xl transition-colors border border-slate-700"
                    >
                      <UserX size={14} className="text-rose-400" />
                      Khóa Dumper
                    </button>
                    <button
                      onClick={() => handleBanUser(selectedAlert.receiver.id, selectedAlert.receiver.username)}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-sm font-medium rounded-xl transition-colors border border-slate-700"
                    >
                      <UserX size={14} className="text-rose-400" />
                      Khóa Receiver
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
