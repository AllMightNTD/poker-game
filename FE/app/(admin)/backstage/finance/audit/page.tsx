"use client";

import { FormButton, FormInput } from "@/components/ui/form";
import httpClient from "@/core/api/http-client";
import { AnimatePresence, motion } from "framer-motion";
import { Ban, Eye, Search, ShieldAlert, TrendingUp, UserX, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
    <div className="space-y-8 p-1">
      {/* Header Panel */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-r from-red-950/20 via-slate-900/40 to-transparent border border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-wide text-white uppercase flex items-center gap-2">
              <ShieldAlert className="text-red-400" size={24} />
              Phát hiện bơm chip (Chip Dumping)
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Giám sát giao dịch phi pháp & hành vi chuyển tiền bất thường giữa các tài khoản game thông qua các bàn chơi Poker.
            </p>
          </div>

          <div className="w-full md:w-64 shrink-0">
            <FormInput
              type="text"
              placeholder="Tìm kiếm người chơi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} className="text-slate-400" />}
              size="small"
              className="bg-slate-950/40 border-white/10"
            />
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-[#080d1a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Tài khoản chuyển (Dumper)</th>
                <th className="p-4">Tài khoản nhận (Receiver)</th>
                <th className="p-4">Số ván chơi chung</th>
                <th className="p-4">Tổng lượng cược</th>
                <th className="p-4">Chip nhận ròng</th>
                <th className="p-4">Mức độ rủi ro</th>
                <th className="p-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold tracking-wider text-slate-400">Đang phân tích dữ liệu dòng tiền...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 font-medium">
                    Chưa phát hiện hành vi bơm chip bất thường nào trong hệ thống.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert, idx) => {
                  let riskBadge = "text-emerald-400 bg-emerald-950/20 border-emerald-900/50";
                  if (alert.risk_level === "HIGH") {
                    riskBadge = "text-rose-400 bg-rose-950/30 border-rose-900/40 font-black";
                  } else if (alert.risk_level === "MEDIUM") {
                    riskBadge = "text-amber-400 bg-amber-950/20 border-amber-900/50";
                  }

                  return (
                    <tr key={idx} className="group hover:bg-white/[0.02] transition-colors duration-200">
                      <td className="p-4">
                        <div className="font-semibold text-slate-200">{alert.dumper.username}</div>
                        <div className="text-[10px] text-slate-500 font-mono select-all mt-0.5">ID: {alert.dumper.id.slice(0, 16)}…</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-200">{alert.receiver.username}</div>
                        <div className="text-[10px] text-slate-500 font-mono select-all mt-0.5">ID: {alert.receiver.id.slice(0, 16)}…</div>
                      </td>
                      <td className="p-4 text-slate-300 font-medium">{alert.joint_hands} ván</td>
                      <td className="p-4 text-slate-400 font-mono text-xs">{Number(alert.total_dumper_bet).toLocaleString()} chips</td>
                      <td className="p-4 text-emerald-400 font-mono font-bold">+{Number(alert.total_receiver_net).toLocaleString()} chips</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border tracking-wider uppercase font-bold ${riskBadge}`}>
                          {alert.risk_level}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer inline-flex"
                          aria-label="Xem chi tiết"
                        >
                          <Eye size={14} />
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

      {/* Alert Detail Modal with Animations */}
      <AnimatePresence>
        {selectedAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop close */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedAlert(null)} />

            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl bg-[#090f1d] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="relative px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <ShieldAlert size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-wide">Chi tiết cảnh báo bơm chip</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Financial Audit Log</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                  aria-label="Đóng"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Dumper (Chuyển tiền)</span>
                    <span className="text-slate-200 font-bold block text-sm">{selectedAlert.dumper.username}</span>
                    <span className="text-[9px] text-slate-500 font-mono block select-all truncate">ID: {selectedAlert.dumper.id}</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Receiver (Nhận tiền)</span>
                    <span className="text-slate-200 font-bold block text-sm">{selectedAlert.receiver.username}</span>
                    <span className="text-[9px] text-slate-500 font-mono block select-all truncate">ID: {selectedAlert.receiver.id}</span>
                  </div>
                </div>

                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-teal-400" /> Phân tích dòng tiền nghi vấn
                    </span>
                    <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedAlert.risk_level === "HIGH" ? "text-rose-400 bg-rose-950/20 border-rose-900/50" : "text-amber-400 bg-amber-950/20 border-amber-900/50"}`}>
                      {selectedAlert.risk_level} Risk
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Số ván chơi chung:</span>
                      <span className="text-slate-200 font-bold text-sm">{selectedAlert.joint_hands} ván đấu</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Dumper đã cược:</span>
                      <span className="text-slate-200 font-mono font-bold text-sm">{Number(selectedAlert.total_dumper_bet).toLocaleString()} chips</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Receiver đã thắng:</span>
                      <span className="text-slate-200 font-mono font-bold text-sm">{Number(selectedAlert.total_receiver_won).toLocaleString()} chips</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Nhận ròng (Net):</span>
                      <span className="text-emerald-400 font-mono font-black text-sm">+{Number(selectedAlert.total_receiver_net).toLocaleString()} chips</span>
                    </div>
                  </div>
                </div>

                {/* Actions panel */}
                <div className="space-y-3 pt-2 border-t border-white/5">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Biện pháp xử lý tài khoản</h3>
                  <div className="flex flex-col gap-2">
                    <FormButton
                      onClick={() => handleBanBoth(selectedAlert.dumper.id, selectedAlert.dumper.username, selectedAlert.receiver.id, selectedAlert.receiver.username)}
                      disabled={actionLoading}
                      isLoading={actionLoading}
                      variant="contained"
                      color="error"
                      startIcon={<Ban size={15} />}
                      className="bg-red-500 hover:bg-red-400 text-slate-950 font-bold py-2.5 rounded-xl transition-all"
                      fullWidth
                    >
                      Khóa cả hai tài khoản nghi vấn
                    </FormButton>
                    <div className="grid grid-cols-2 gap-2">
                      <FormButton
                        onClick={() => handleBanUser(selectedAlert.dumper.id, selectedAlert.dumper.username)}
                        disabled={actionLoading}
                        isLoading={actionLoading}
                        variant="outlined"
                        color="error"
                        startIcon={<UserX size={14} />}
                        className="border-red-500/20 text-red-400 hover:bg-red-950/20 py-2.5 rounded-xl transition-all"
                      >
                        Khóa Dumper
                      </FormButton>
                      <FormButton
                        onClick={() => handleBanUser(selectedAlert.receiver.id, selectedAlert.receiver.username)}
                        disabled={actionLoading}
                        isLoading={actionLoading}
                        variant="outlined"
                        color="error"
                        startIcon={<UserX size={14} />}
                        className="border-red-500/20 text-red-400 hover:bg-red-950/20 py-2.5 rounded-xl transition-all"
                      >
                        Khóa Receiver
                      </FormButton>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
