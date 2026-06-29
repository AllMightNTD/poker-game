"use client";
import React, { useState, useRef } from "react";
import {
  Image as ImageIcon, MoreHorizontal, Plus, Loader2,
  X, ChevronLeft, ChevronRight, Trash2, ArrowUpDown,
  CalendarArrowDown, CalendarArrowUp, Upload,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/axios";

const getMediaUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
  return `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`;
};

type SortOrder = "desc" | "asc";

// ----- Sort Modal -----
function SortModal({
  onClose,
  sortOrder,
  onChangeSort,
}: {
  onClose: () => void;
  sortOrder: SortOrder;
  onChangeSort: (o: SortOrder) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white w-full sm:w-80 rounded-t-2xl sm:rounded-2xl p-4 z-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">Sắp xếp theo</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-1">
          <button
            onClick={() => { onChangeSort("desc"); onClose(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${sortOrder === "desc" ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"}`}
          >
            <CalendarArrowDown size={18} />
            Mới nhất trước
          </button>
          <button
            onClick={() => { onChangeSort("asc"); onClose(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${sortOrder === "asc" ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"}`}
          >
            <CalendarArrowUp size={18} />
            Cũ nhất trước
          </button>
        </div>
      </div>
    </div>
  );
}

// ----- Upload Modal -----
function UploadModal({
  onClose,
  onUpload,
  isUploading,
}: {
  onClose: () => void;
  onUpload: (files: File[]) => void;
  isUploading: boolean;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;
    onUpload(images);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white w-full max-w-md mx-4 rounded-2xl p-6 z-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-800 text-base">Thêm ảnh</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X size={18} />
          </button>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            dragOver ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {isUploading ? (
            <Loader2 size={36} className="text-blue-500 animate-spin mb-3" />
          ) : (
            <Upload size={36} className="text-slate-400 mb-3" />
          )}
          <p className="text-sm font-bold text-slate-700 text-center">
            {isUploading ? "Đang tải lên..." : "Kéo thả hoặc click để chọn ảnh"}
          </p>
          <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP, GIF (tối đa 5MB)</p>
        </div>
      </div>
    </div>
  );
}

// ----- Main Component -----
export function ProfilePhotosTab({ user, isOwnProfile }: { user: any; isOwnProfile: boolean }) {
  const queryClient = useQueryClient();
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showSortModal, setShowSortModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: mediaData, isFetching } = useQuery({
    queryKey: ["profile-photos", user?.id, sortOrder],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await api.get(
        `/api/v1/user/${user.id}/media?type=IMAGE&page=1&limit=60&order=${sortOrder}`
      );
      return res.data?.metadata || res.data || { data: [], meta: {} };
    },
    enabled: !!user?.id,
    placeholderData: keepPreviousData,
  });

  const photos = mediaData?.data || [];
  const totalCount = mediaData?.meta?.total || 0;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (mediaId: string) => api.delete(`/api/v1/post/media/${mediaId}`),
    onMutate: (mediaId) => setDeletingId(mediaId),
    onSettled: () => {
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ["profile-photos", user?.id] });
    },
  });

  // Upload mutation — upload then create post with media
  const [isUploading, setIsUploading] = useState(false);
  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      const uploadRes = await api.post("/api/v1/post/upload", formData);
      const uploadedFiles: { file_url: string; type: string }[] = uploadRes.data?.metadata || [];

      await api.post("/api/v1/post", {
        content: "",
        audience: "public",
        type: "photo",
        media: uploadedFiles.map((f, i) => ({ file_url: f.file_url, type: "image", sort_order: i })),
      });

      queryClient.invalidateQueries({ queryKey: ["profile-photos", user?.id] });
      setShowUploadModal(false);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, mediaId: string) => {
    e.stopPropagation();
    if (window.confirm("Xóa ảnh này?")) {
      deleteMutation.mutate(mediaId);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-300 w-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Ảnh</h2>
            <p className="text-sm text-slate-400 font-medium">{totalCount} ảnh</p>
          </div>
          <div className="flex items-center gap-2">
            {isOwnProfile && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
              >
                <Plus size={16} /> Thêm ảnh
              </button>
            )}
            <button
              onClick={() => setShowSortModal(true)}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors relative"
              title="Sắp xếp"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Sort pill indicator */}
        {sortOrder === "asc" && (
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-2 text-xs font-semibold text-blue-600">
            <CalendarArrowUp size={12} /> Đang hiển thị: Cũ nhất trước
          </div>
        )}

        {/* Grid */}
        {(!mediaData && isFetching) ? (
          <div className="p-16 flex justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
        ) : photos.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <ImageIcon size={48} className="opacity-30" />
            <p className="text-sm font-semibold">Chưa có ảnh nào</p>
            <p className="text-xs text-center max-w-xs">Những ảnh từ bài viết sẽ xuất hiện ở đây.</p>
          </div>
        ) : (
          <div className={`p-4 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
            {photos.map((photo: any, idx: number) => (
              <div
                key={photo.id}
                onClick={() => setLightboxIdx(idx)}
                className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer bg-slate-100"
              >
                <img
                  src={getMediaUrl(photo.file_url)}
                  alt={photo.alt_text || "Photo"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                {isOwnProfile && (
                  <button
                    onClick={(e) => handleDelete(e, photo.id)}
                    disabled={deletingId === photo.id}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 z-10"
                    title="Xóa ảnh"
                  >
                    {deletingId === photo.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sort Modal */}
      {showSortModal && (
        <SortModal sortOrder={sortOrder} onChangeSort={setSortOrder} onClose={() => setShowSortModal(false)} />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} onUpload={handleUpload} isUploading={isUploading} />
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && photos[lightboxIdx] && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxIdx(null)}>
          <button onClick={() => setLightboxIdx(null)} className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20 z-10">
            <X size={24} />
          </button>
          {lightboxIdx > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i! > 0 ? i! - 1 : i)); }}
              className="absolute left-4 text-white p-3 rounded-full bg-white/10 hover:bg-white/20 z-10"
            >
              <ChevronLeft size={28} />
            </button>
          )}
          <img
            src={getMediaUrl(photos[lightboxIdx].file_url)}
            alt="Photo"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          />
          {lightboxIdx < photos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i! < photos.length - 1 ? i! + 1 : i)); }}
              className="absolute right-4 text-white p-3 rounded-full bg-white/10 hover:bg-white/20 z-10"
            >
              <ChevronRight size={28} />
            </button>
          )}
          <div className="absolute bottom-4 text-white/60 text-xs font-medium">{lightboxIdx + 1} / {photos.length}</div>
        </div>
      )}
    </>
  );
}
