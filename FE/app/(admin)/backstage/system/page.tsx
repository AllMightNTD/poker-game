"use client";

import { FormTextArea } from "@/components/ui/form";
import httpClient from "@/core/api/http-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Clock, Globe, Laptop, Send, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const systemBroadcastSchema = z.object({
  message: z
    .string()
    .min(1, "Vui lòng nhập nội dung thông báo")
    .max(200, "Nội dung thông báo tối đa 200 ký tự")
    .transform((val) => val.trim()),
});

type SystemBroadcastValues = z.infer<typeof systemBroadcastSchema>;

export default function AdminSystemPage() {
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SystemBroadcastValues>({
    resolver: zodResolver(systemBroadcastSchema),
    defaultValues: {
      message: "",
    },
  });

  const messageValue = useWatch({ control, name: "message" }) || "";

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    httpClient.get("/api/v1/admin/sessions", { signal: controller.signal })
      .then((res) => {
        if (active) {
          setSessions(res.data || []);
          setLoadingSessions(false);
        }
      })
      .catch((err) => {
        if (active && err.name !== "CanceledError") {
          console.error("Failed to load sessions", err);
          setLoadingSessions(false);
        }
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [refreshTrigger]);

  const handleRevoke = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn đăng xuất thiết bị này từ xa?")) return;
    try {
      await httpClient.delete(`/api/v1/admin/sessions/${id}`);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to revoke session", err);
      alert("Không thể thu hồi phiên đăng nhập.");
    }
  };

  const onSubmit = async (data: SystemBroadcastValues) => {
    setStatus(null);
    try {
      const res = await httpClient.post("/api/v1/admin/system/broadcast", {
        message: data.message,
      });
      if (res.data?.success) {
        setStatus({ type: "success", text: "Thông báo đã được phát thành công tới toàn bộ người chơi online!" });
        reset({ message: "" });
      } else {
        setStatus({ type: "error", text: res.data?.message || "Không thể phát thông báo" });
      }
    } catch (e: any) {
      console.error(e);
      setStatus({
        type: "error",
        text: e.response?.data?.message || "Có lỗi xảy ra khi kết nối máy chủ"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Quản trị Hệ thống</h1>
        <p className="text-slate-500 text-sm mt-1">Cấu hình các cài đặt hệ thống, phát thông báo và quản lý các thiết bị hoạt động.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Column 1: Broadcast */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-medium text-slate-200">Thông điệp hệ thống</h2>

          <div className="flex gap-4 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-sm text-indigo-300">
            <AlertCircle size={20} className="shrink-0 text-indigo-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-200">Lưu ý khi phát thông báo:</p>
              <p className="text-slate-400 leading-relaxed">
                Thông điệp sẽ hiển thị tức thì trên thanh chạy chữ của tất cả người chơi trong phòng chờ và bàn đấu.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <FormTextArea
                label="Nội dung thông báo"
                placeholder="Nhập thông báo hệ thống tại đây (tối đa 200 ký tự)..."
                rows={4}
                maxLength={200}
                error={errors.message?.message}
                disabled={isSubmitting}
                {...register("message")}
              />
              <div className="text-right text-xs text-slate-600">{messageValue.length}/200 ký tự</div>
            </div>

            {status && (
              <div className={`p-4 rounded-xl text-sm border ${status.type === "success"
                ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400"
                : "bg-rose-500/5 border-rose-500/10 text-rose-400"
                }`}>
                {status.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !messageValue.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-indigo-600/15 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send size={16} /> {isSubmitting ? "Đang gửi..." : "Phát thông báo"}
            </button>
          </form>
        </div>

        {/* Column 2: Your Active Sessions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-slate-200">Phiên Đăng Nhập Hoạt Động</h2>
            <button
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition cursor-pointer"
            >
              Làm mới
            </button>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed">
            Danh sách các thiết bị/trình duyệt đang đăng nhập vào tài khoản admin của bạn. Bạn có thể thu hồi (đăng xuất) bất kỳ phiên hoạt động đáng ngờ nào từ xa.
          </p>

          <div className="space-y-4">
            {loadingSessions ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
                Không tìm thấy phiên hoạt động nào.
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-700/60 transition group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 group-hover:text-indigo-400 transition">
                      <Laptop size={18} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-200">
                        {session.device_info || "Thiết bị không xác định"}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Globe size={12} /> {session.ip_address || "No IP"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {new Date(session.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevoke(session.id)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg transition-colors cursor-pointer"
                    title="Thu hồi phiên đăng nhập"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}