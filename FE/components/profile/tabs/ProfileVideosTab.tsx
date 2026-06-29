"use client";
import React, { useState, useRef } from "react";
import { Play, MoreHorizontal, Video, Loader2, X, Trash2, CalendarArrowDown, CalendarArrowUp, Upload } from "lucide-react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import api from "@/lib/axios";

const getMediaUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
  return `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`;
};

const formatDuration = (seconds?: number) => {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60), s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

type SortOrder = "desc" | "asc";

function SortModal({ onClose, sortOrder, onChangeSort, t }: { onClose: () => void; sortOrder: SortOrder; onChangeSort: (o: SortOrder) => void; t: any }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white w-full sm:w-80 rounded-t-2xl sm:rounded-2xl p-4 z-10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">{t("sortBy")}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button>
        </div>
        <div className="space-y-1">
          <button onClick={() => { onChangeSort("desc"); onClose(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${sortOrder === "desc" ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"}`}>
            <CalendarArrowDown size={18} /> {t("sortNewest")}
          </button>
          <button onClick={() => { onChangeSort("asc"); onClose(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${sortOrder === "asc" ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"}`}>
            <CalendarArrowUp size={18} /> {t("sortOldest")}
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadVideoModal({ onClose, onUpload, isUploading, t }: { onClose: () => void; onUpload: (file: File) => void; isUploading: boolean; t: any }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFiles = (files: FileList | null) => {
    const video = Array.from(files || []).find((f) => f.type.startsWith("video/"));
    if (video) onUpload(video);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white w-full max-w-md mx-4 rounded-2xl p-6 z-10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-800 text-base">{t("uploadTitle")}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button>
        </div>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${dragOver ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"}`}
        >
          <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          {isUploading ? <Loader2 size={36} className="text-blue-500 animate-spin mb-3" /> : <Upload size={36} className="text-slate-400 mb-3" />}
          <p className="text-sm font-bold text-slate-700 text-center">{isUploading ? t("uploading") : t("uploadDrag")}</p>
          <p className="text-xs text-slate-400 mt-1">{t("uploadHint")}</p>
        </div>
      </div>
    </div>
  );
}

export function ProfileVideosTab({ user, isOwnProfile }: { user: any; isOwnProfile: boolean }) {
  const t = useTranslations("profile.videos");
  const queryClient = useQueryClient();
  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showSortModal, setShowSortModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: mediaData, isFetching } = useQuery({
    queryKey: ["profile-videos", user?.id, sortOrder],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await api.get(`/api/v1/user/${user.id}/media?type=VIDEO&page=1&limit=30&order=${sortOrder}`);
      return res.data?.metadata || res.data || { data: [], meta: {} };
    },
    enabled: !!user?.id,
    placeholderData: keepPreviousData,
  });

  const videos = mediaData?.data || [];
  const totalCount = mediaData?.meta?.total || 0;

  const deleteMutation = useMutation({
    mutationFn: (mediaId: string) => api.delete(`/api/v1/post/media/${mediaId}`),
    onMutate: (mediaId) => setDeletingId(mediaId),
    onSettled: () => { setDeletingId(null); queryClient.invalidateQueries({ queryKey: ["profile-videos", user?.id] }); },
  });

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const uploadRes = await api.post("/api/v1/post/upload", formData);
      const uploadedFiles: { file_url: string }[] = uploadRes.data?.metadata || [];
      await api.post("/api/v1/post", {
        content: "", audience: "public", type: "video",
        media: uploadedFiles.map((f, i) => ({ file_url: f.file_url, type: "video", sort_order: i })),
      });
      queryClient.invalidateQueries({ queryKey: ["profile-videos", user?.id] });
      setShowUploadModal(false);
    } catch (err) { console.error("Upload failed", err); }
    finally { setIsUploading(false); }
  };

  const handleDelete = (e: React.MouseEvent, mediaId: string) => {
    e.stopPropagation();
    if (window.confirm(t("deleteConfirm"))) deleteMutation.mutate(mediaId);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-300 w-full">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{t("title")}</h2>
            <p className="text-sm text-slate-400 font-medium">{t("count", { count: totalCount })}</p>
          </div>
          <div className="flex items-center gap-2">
            {isOwnProfile && (
              <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors">
                <Video size={16} /> {t("addBtn")}
              </button>
            )}
            <button onClick={() => setShowSortModal(true)} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {sortOrder === "asc" && (
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-2 text-xs font-semibold text-blue-600">
            <CalendarArrowUp size={12} /> {t("sortingOldest")}
          </div>
        )}

        {(!mediaData && isFetching) ? (
          <div className="p-16 flex justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
        ) : videos.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Video size={48} className="opacity-30" />
            <p className="text-sm font-semibold">{t("empty")}</p>
            <p className="text-xs text-center max-w-xs">{t("emptyDesc")}</p>
          </div>
        ) : (
          <div className={`p-4 grid grid-cols-2 md:grid-cols-3 gap-4 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
            {videos.map((video: any) => (
              <div key={video.id} className="relative group cursor-pointer" onClick={() => setActiveVideo(video)}>
                <div className="relative aspect-video rounded-xl overflow-hidden mb-2 bg-slate-100">
                  {video.thumbnail_url ? (
                    <img src={getMediaUrl(video.thumbnail_url)} alt="Thumbnail" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200"><Video size={32} className="text-slate-400" /></div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                      <Play className="text-white fill-white ml-1" size={22} />
                    </div>
                  </div>
                  {video.duration_seconds && (
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{formatDuration(video.duration_seconds)}</span>
                  )}
                  {isOwnProfile && (
                    <button onClick={(e) => handleDelete(e, video.id)} disabled={deletingId === video.id} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 z-10">
                      {deletingId === video.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    </button>
                  )}
                </div>
                <p className="text-xs font-medium text-slate-400 text-center">{new Date(video.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showSortModal && <SortModal t={t} sortOrder={sortOrder} onChangeSort={setSortOrder} onClose={() => setShowSortModal(false)} />}
      {showUploadModal && <UploadVideoModal t={t} onClose={() => setShowUploadModal(false)} onUpload={handleUpload} isUploading={isUploading} />}

      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setActiveVideo(null)}>
          <button onClick={() => setActiveVideo(null)} className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20 z-10"><X size={24} /></button>
          <div className="w-full max-w-4xl mx-4" onClick={(e) => e.stopPropagation()}>
            <video src={getMediaUrl(activeVideo.file_url)} controls autoPlay className="w-full rounded-xl max-h-[85vh] bg-black" />
          </div>
        </div>
      )}
    </>
  );
}
