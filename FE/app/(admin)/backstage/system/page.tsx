"use client";

import httpClient from "@/core/api/http-client";
import { Megaphone, AlertCircle, Send } from "lucide-react";
import { useState } from "react";

export default function AdminSystemPage() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || !message.trim()) {
      alert("Vui lòng nhập nội dung thông báo");
      return;
    }
    
    setSending(true);
    setStatus(null);
    try {
      const res = await httpClient.post("/api/v1/admin/system/broadcast", {
        message: message.trim()
      });
      if (res.data?.success) {
        setStatus({ type: "success", text: "Thông báo đã được phát thành công tới toàn bộ người chơi online!" });
        setMessage("");
      } else {
        setStatus({ type: "error", text: res.data?.message || "Không thể phát thông báo" });
      }
    } catch (e) {
      console.error(e);
      setStatus({ type: "error", text: "Có lỗi xảy ra khi kết nối máy chủ" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Thông điệp hệ thống</h1>
        <p className="text-slate-500 text-sm mt-1">Phát thông báo chạy chữ (Marquee) thời gian thực tới tất cả người chơi đang online.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex gap-4 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-sm text-indigo-300">
          <AlertCircle size={20} className="shrink-0 text-indigo-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-200">Lưu ý khi phát thông báo:</p>
            <p className="text-slate-400 leading-relaxed">
              Thông điệp sẽ hiển thị tức thì trên thanh chạy chữ của tất cả người chơi trong phòng chờ và bàn đấu.
              Sử dụng tính năng này để thông báo lịch bảo trì, sự kiện đặc biệt, hoặc nhắc nhở quy tắc game.
            </p>
          </div>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nội dung thông báo</label>
            <textarea
              required
              rows={4}
              maxLength={200}
              placeholder="Nhập thông báo hệ thống tại đây (tối đa 200 ký tự)..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-medium"
            />
            <div className="text-right text-xs text-slate-600">{message.length}/200 ký tự</div>
          </div>

          {status && (
            <div className={`p-4 rounded-xl text-sm border ${
              status.type === "success" 
                ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" 
                : "bg-rose-500/5 border-rose-500/10 text-rose-400"
            }`}>
              {status.text}
            </div>
          )}

          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-indigo-600/15"
          >
            <Send size={16} /> {sending ? "Đang gửi..." : "Phát thông báo"}
          </button>
        </form>
      </div>
    </div>
  );
}
