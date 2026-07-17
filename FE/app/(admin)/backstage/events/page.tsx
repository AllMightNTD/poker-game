"use client";

import httpClient from "@/core/api/http-client";
import {
  Coins,
  Edit,
  Megaphone,
  Plus,
  Sparkles,
  Trash2,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormInput, FormTextArea, FormSelect, FormCheckbox, FormButton } from "@/components/ui/form";
import dynamic from "next/dynamic";

const DateTimePicker = dynamic(
  () => import("@/components/ui/DateTimePicker").then((mod) => mod.DateTimePicker),
  { ssr: false, loading: () => <div className="h-10 w-full bg-slate-800/50 animate-pulse rounded-md border border-white/5" /> }
);

interface PromoEvent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  color_gradient: string;
  icon_type: string;
  link_url?: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
}

const GRADIENT_PRESETS = [
  { name: "Cúp Vàng (Gold)", class: "from-amber-500/20 via-orange-600/10 to-[#0b141d]" },
  { name: "Lấp Lánh (Blue)", class: "from-blue-500/20 via-[#0a2540]/10 to-[#0b141d]" },
  { name: "Thắng Lớn (Emerald)", class: "from-emerald-500/20 via-teal-900/10 to-[#0b141d]" },
  { name: "Kịch Tính (Rose)", class: "from-rose-500/20 via-purple-900/10 to-[#0b141d]" },
];

const ICON_PRESETS = [
  { type: "Trophy", label: "Cúp Vàng", component: <Trophy className="text-amber-400 w-5 h-5" /> },
  { type: "Sparkles", label: "Sao Lấp Lánh", component: <Sparkles className="text-blue-400 w-5 h-5" /> },
  { type: "Coins", label: "Đồng Xu Vàng", component: <Coins className="text-emerald-400 w-5 h-5" /> },
  { type: "Zap", label: "Tia Chớp Đỏ", component: <Zap className="text-rose-400 w-5 h-5" /> },
];

const eventSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  subtitle: z.string().min(1, "Tiêu đề phụ không được để trống"),
  description: z.string().min(1, "Mô tả không được để trống"),
  badge: z.string().min(1, "Nhãn không được để trống"),
  colorGradient: z.string(),
  iconType: z.string(),
  linkUrl: z.string().optional(),
  isActive: z.boolean(),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  {
    message: "Thời gian kết thúc phải sau thời gian bắt đầu",
    path: ["endDate"],
  }
);

type EventFormValues = z.infer<typeof eventSchema>;

export default function AdminEventsPage() {
  const [events, setEvents] = useState<PromoEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PromoEvent | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      badge: "Sự Kiện Hot",
      colorGradient: GRADIENT_PRESETS[0].class,
      iconType: "Trophy",
      linkUrl: "",
      isActive: true,
      startDate: "",
      endDate: "",
    },
  });

  const currentColorGradient = useWatch({ control, name: "colorGradient" });

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await httpClient.get("/api/v1/admin/events", {
        params: search ? { search } : {},
      });
      setEvents(res.data || []);
    } catch (e) {
      console.error("Lỗi lấy danh sách sự kiện:", e);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchEvents();
    });
  }, [fetchEvents]);

  const openAddModal = () => {
    setEditingEvent(null);
    reset({
      title: "",
      subtitle: "",
      description: "",
      badge: "Sự Kiện Hot",
      colorGradient: GRADIENT_PRESETS[0].class,
      iconType: "Trophy",
      linkUrl: "",
      isActive: true,
      startDate: "",
      endDate: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (event: PromoEvent) => {
    setEditingEvent(event);
    reset({
      title: event.title,
      subtitle: event.subtitle,
      description: event.description,
      badge: event.badge,
      colorGradient: event.color_gradient,
      iconType: event.icon_type,
      linkUrl: event.link_url || "",
      isActive: event.is_active,
      startDate: event.start_date ? event.start_date.substring(0, 16) : "",
      endDate: event.end_date ? event.end_date.substring(0, 16) : "",
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: EventFormValues) => {
    const payload = {
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      badge: data.badge,
      color_gradient: data.colorGradient,
      icon_type: data.iconType,
      link_url: data.linkUrl || undefined,
      is_active: data.isActive,
      start_date: data.startDate ? new Date(data.startDate).toISOString() : undefined,
      end_date: data.endDate ? new Date(data.endDate).toISOString() : undefined,
    };

    try {
      if (editingEvent) {
        await httpClient.put(`/api/v1/admin/events/${editingEvent.id}`, payload);
      } else {
        await httpClient.post("/api/v1/admin/events", payload);
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (e) {
      console.error("Lỗi lưu sự kiện:", e);
      alert("Không thể lưu sự kiện. Vui lòng kiểm tra lại dữ liệu.");
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await httpClient.patch(`/api/v1/admin/events/${id}/toggle`);
      fetchEvents();
    } catch (e) {
      console.error("Lỗi bật tắt trạng thái:", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.")) {
      return;
    }
    try {
      await httpClient.delete(`/api/v1/admin/events/${id}`);
      fetchEvents();
    } catch (e) {
      console.error("Lỗi xóa sự kiện:", e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2.5">
            <Megaphone className="text-indigo-400" size={24} /> Quản lý Sự kiện & Khuyến mãi
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Cấu hình danh sách banner hiển thị tại sảnh chính của CG Poker.
          </p>
        </div>
        <FormButton
          onClick={openAddModal}
          variant="contained"
          color="primary"
          startIcon={<Plus size={16} />}
        >
          Thêm sự kiện mới
        </FormButton>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <FormInput
          type="text"
          placeholder="Tìm tên sự kiện, nhãn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          className="!w-80"
        />
      </div>

      {/* Events Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Đang tải danh sách sự kiện...</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Không tìm thấy sự kiện nào. Hãy click nút ở trên để tạo.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Nhãn & Icon</th>
                  <th className="px-6 py-4">Thông tin sự kiện</th>
                  <th className="px-6 py-4">Thời gian áp dụng</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {events.map((event) => {
                  const matchedIcon = ICON_PRESETS.find((i) => i.type === event.icon_type);
                  return (
                    <tr key={event.id} className="hover:bg-slate-800/20 transition-colors text-sm">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs rounded-full font-medium">
                            {event.badge}
                          </span>
                          <span className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-850">
                            {matchedIcon?.component || <Megaphone className="w-4 h-4 text-slate-400" />}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-sm">
                        <div>
                          <div className="font-semibold text-slate-200">{event.title}</div>
                          <div className="text-xs text-slate-400 font-bold mt-0.5">{event.subtitle}</div>
                          <div className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {event.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-xs text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 w-8">Từ:</span>
                            <span>
                              {event.start_date
                                ? new Date(event.start_date).toLocaleString("vi-VN")
                                : "Bất đầu lập tức"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 w-8">Đến:</span>
                            <span>
                              {event.end_date
                                ? new Date(event.end_date).toLocaleString("vi-VN")
                                : "Vô thời hạn"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(event.id)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            event.is_active
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-800 text-slate-500 border border-slate-700"
                          }`}
                        >
                          {event.is_active ? "Hoạt động" : "Tạm ẩn"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(event)}
                            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-850 rounded-lg transition-colors cursor-pointer"
                            title="Sửa"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-850 rounded-lg transition-colors cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-slate-100">
                {editingEvent ? "Chỉnh sửa sự kiện" : "Thêm sự kiện mới"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Tiêu đề chính (Title)"
                  required
                  placeholder="Ví dụ: Weekly Freeroll $5,000 GTD"
                  error={errors.title?.message}
                  className="col-span-2"
                  {...register("title")}
                />

                <FormInput
                  label="Tiêu đề phụ (Subtitle)"
                  required
                  placeholder="Ví dụ: Giải đấu miễn phí mỗi Chủ Nhật"
                  error={errors.subtitle?.message}
                  className="col-span-2"
                  {...register("subtitle")}
                />

                <FormTextArea
                  label="Mô tả sự kiện"
                  required
                  placeholder="Nhập thông tin mô tả chi tiết giải thưởng, điều kiện..."
                  error={errors.description?.message}
                  className="col-span-2"
                  rows={3}
                  {...register("description")}
                />

                <FormInput
                  label="Nhãn (Badge)"
                  placeholder="Ví dụ: Sự Kiện Hot, Khuyến Mãi"
                  error={errors.badge?.message}
                  {...register("badge")}
                />

                <FormSelect
                  label="Icon đại diện"
                  options={ICON_PRESETS.map((i) => ({ value: i.type, label: i.label }))}
                  {...register("iconType")}
                />

                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-slate-400">Template màu nền banner</label>
                  <div className="grid grid-cols-2 gap-2">
                    {GRADIENT_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setValue("colorGradient", p.class)}
                        className={`p-3 rounded-lg text-left text-xs font-semibold transition-all border cursor-pointer ${
                          currentColorGradient === p.class
                            ? "border-indigo-500 bg-slate-850/50"
                            : "border-slate-850 bg-slate-950 hover:bg-slate-850/20"
                        }`}
                      >
                        <div className="font-medium text-slate-300">{p.name}</div>
                        <div className={`h-2 rounded mt-1 bg-gradient-to-r ${p.class}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <FormInput
                  label="Đường dẫn hành động (Action Link - Tùy chọn)"
                  placeholder="Ví dụ: /poker-game hoặc https://..."
                  className="col-span-2"
                  {...register("linkUrl")}
                />

                <DateTimePicker
                  label="Thời gian bắt đầu"
                  {...register("startDate")}
                  error={errors.startDate?.message}
                />

                <DateTimePicker
                  label="Thời gian kết thúc"
                  {...register("endDate")}
                  error={errors.endDate?.message}
                />

                <div className="col-span-2 pt-2">
                  <FormCheckbox
                    label="Kích hoạt ngay (Hiển thị lên sảnh)"
                    {...register("isActive")}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-800 mt-6">
                <FormButton
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  variant="outlined"
                  className="flex-1"
                >
                  Hủy bỏ
                </FormButton>
                <FormButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  className="flex-1"
                >
                  {editingEvent ? "Lưu thay đổi" : "Tạo sự kiện"}
                </FormButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
