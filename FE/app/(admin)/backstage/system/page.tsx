"use client";

import httpClient from "@/core/api/http-client";
import { AlertCircle, Send } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormTextArea } from "@/components/ui/form";

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
            disabled={isSubmitting || !messageValue.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-indigo-600/15 cursor-pointer disabled:cursor-not-allowed"
          >
            <Send size={16} /> {isSubmitting ? "Đang gửi..." : "Phát thông báo"}
          </button>
        </form>
      </div>
    </div>
  );
}
