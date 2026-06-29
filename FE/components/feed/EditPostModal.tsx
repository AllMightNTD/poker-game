"use client";
import { useState, useRef, useEffect } from "react";
import {
  Image,
  Smile,
  Video,
  Globe,
  Users,
  Lock,
  ChevronDown,
  Loader2,
  X,
  Palette 
} from "lucide-react";
import api from "@/lib/axios";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  currentUser?: any;
}

const FEELINGS = [
  { label: "Hào hứng", emoji: "🤩", value: "excited" },
  { label: "Vui vẻ", emoji: "😊", value: "happy" },
  { label: "Yêu thương", emoji: "🥰", value: "loved" },
  { label: "Buồn bã", emoji: "😢", value: "sad" },
  { label: "Biết ơn", emoji: "🙏", value: "thankful" },
  { label: "Thư giãn", emoji: "😌", value: "relaxed" },
  { label: "Tập trung", emoji: "💻", value: "focused" },
  { label: "Tò mò", emoji: "🧐", value: "curious" },
];

const GRADIENTS = [
  { id: "none", name: "Mặc định", class: "bg-transparent text-slate-700" },
  { id: "sunset", name: "Hoàng hôn", class: "bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white font-bold" },
  { id: "ocean", name: "Đại dương", class: "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold" },
  { id: "forest", name: "Rừng xanh", class: "bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-white font-bold" },
  { id: "cosmic", name: "Vũ trụ", class: "bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-white font-bold" },
  { id: "neon", name: "Đêm Neon", class: "bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-700 text-white font-bold" },
  { id: "fire", name: "Ngọn lửa", class: "bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 text-white font-bold" },
];

const getMediaUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
  return `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function EditPostModal({ isOpen, onClose, post, currentUser }: EditPostModalProps) {
  const [text, setText] = useState("");
  const [audience, setAudience] = useState<"public" | "friends" | "only_me">("public");
  const [isAudienceOpen, setIsAudienceOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States nâng cao
  const [selectedFeeling, setSelectedFeeling] = useState<typeof FEELINGS[0] | null>(null);
  const [isFeelingOpen, setIsFeelingOpen] = useState(false);
  const [selectedBg, setSelectedBg] = useState(GRADIENTS[0]);
  const [isBgPickerOpen, setIsBgPickerOpen] = useState(false);

  // Media States
  const [uploadedMedia, setUploadedMedia] = useState<{ file_url: string; type: "image" | "video" }[]>([]);

  const audienceRef = useRef<HTMLDivElement>(null);
  const feelingRef = useRef<HTMLDivElement>(null);
  const bgPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Điền dữ liệu cũ (Pre-fill states)
  useEffect(() => {
    if (post && isOpen) {
      setText(post.content || "");
      setAudience(post.audience || "public");

      // Feeling parser
      if (post.feeling) {
        const matchingFeeling = FEELINGS.find(
          (f) => `${f.emoji} ${f.label}` === post.feeling
        );
        if (matchingFeeling) {
          setSelectedFeeling(matchingFeeling);
        } else {
          // parse custom emoji/label
          const parts = post.feeling.split(" ");
          const emoji = parts[0] || "😊";
          const label = parts.slice(1).join(" ") || "Vui vẻ";
          setSelectedFeeling({ label, emoji, value: "custom" });
        }
      } else {
        setSelectedFeeling(null);
      }

      // Background parser
      if (post.post_background) {
        const matchingBg = GRADIENTS.find((g) => g.class === post.post_background);
        if (matchingBg) {
          setSelectedBg(matchingBg);
        } else {
          setSelectedBg({ id: "custom", name: "Tùy chỉnh", class: post.post_background });
        }
      } else {
        setSelectedBg(GRADIENTS[0]);
      }

      // Media parser
      if (post.rawMedia && post.rawMedia.length > 0) {
        setUploadedMedia(post.rawMedia.map((m: any) => ({
          file_url: m.file_url,
          type: m.type === "video" ? "video" : "image"
        })));
      } else {
        setUploadedMedia([]);
      }
    }
  }, [post, isOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (audienceRef.current && !audienceRef.current.contains(target)) {
        setIsAudienceOpen(false);
      }
      if (feelingRef.current && !feelingRef.current.contains(target)) {
        setIsFeelingOpen(false);
      }
      if (bgPickerRef.current && !bgPickerRef.current.contains(target)) {
        setIsBgPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post("/api/v1/post/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.metadata.map((item: any) => ({
        file_url: item.file_url,
        type: item.type === "video" ? "video" : "image",
      }));
    },
    onSuccess: (newMedia) => {
      setUploadedMedia((prev) => [...prev, ...newMedia]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (err) => {
      console.error("Upload failed:", err);
      setError("Không thể tải ảnh/video lên server. Vui lòng thử lại!");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  });

  const editMutation = useMutation({
    mutationFn: async (payload: any) => {
      await api.put(`/api/v1/post/${post.id}`, payload);
    },
    onSuccess: () => {
      onClose();
    },
    onError: (err: any) => {
      console.error("Failed to edit post:", err);
      setError(err.response?.data?.message || "Không thể lưu thay đổi bài viết. Vui lòng thử lại!");
    }
  });

  const triggerFileSelect = () => {
    if (selectedBg.id !== "none") {
      setSelectedBg(GRADIENTS[0]);
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    uploadMutation.mutate(formData);
  };

  const removeMedia = (index: number) => {
    setUploadedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBgSelect = (bg: typeof GRADIENTS[0]) => {
    setSelectedBg(bg);
    if (bg.id !== "none" && uploadedMedia.length > 0) {
      setUploadedMedia([]);
    }
    setIsBgPickerOpen(false);
  };

  const handleSaveChanges = () => {
    if (!text.trim() && uploadedMedia.length === 0) return;

    setError(null);

    const payload: any = {
      content: text,
      audience: audience,
      feeling: selectedFeeling ? `${selectedFeeling.emoji} ${selectedFeeling.label}` : null,
      post_background: selectedBg.id !== "none" ? selectedBg.class : null,
      media: uploadedMedia.map((m, index) => ({
        file_url: m.file_url,
        type: m.type,
        sort_order: index,
      })),
    };

    editMutation.mutate(payload);
  };

  const getAudienceIcon = (type: string) => {
    switch (type) {
      case "public":
        return <Globe size={12} className="text-blue-500" />;
      case "friends":
        return <Users size={12} className="text-emerald-500" />;
      case "only_me":
        return <Lock size={12} className="text-amber-500" />;
      default:
        return <Globe size={12} />;
    }
  };

  const getAudienceLabel = (type: string) => {
    switch (type) {
      case "public":
        return "Công khai";
      case "friends":
        return "Bạn bè";
      case "only_me":
        return "Chỉ mình tôi";
      default:
        return "Công khai";
    }
  };

  const avatarUrl = currentUser?.profile?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=default";
  const displayName = currentUser?.profile?.full_name || currentUser?.email || "Người dùng";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Glassmorphism */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] relative z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span>✏️</span> Chỉnh sửa bài viết
              </h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Author row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                    />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-sm font-semibold text-slate-800">
                        {displayName}
                      </span>
                      {selectedFeeling && (
                        <span className="text-xs text-slate-500">
                          đang {selectedFeeling.emoji} {selectedFeeling.label}
                        </span>
                      )}
                    </div>

                    {/* Audience dropdown selector */}
                    <div className="relative mt-1" ref={audienceRef}>
                      <button
                        onClick={() => setIsAudienceOpen(!isAudienceOpen)}
                        className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-100 text-[10px] font-bold text-slate-500 transition-colors"
                      >
                        {getAudienceIcon(audience)}
                        <span>{getAudienceLabel(audience)}</span>
                        <ChevronDown size={10} />
                      </button>

                      <AnimatePresence>
                        {isAudienceOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute left-0 mt-1 w-36 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-20"
                          >
                            <button
                              onClick={() => { setAudience("public"); setIsAudienceOpen(false); }}
                              className="w-full px-3 py-1.5 text-left text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2 font-medium"
                            >
                              <Globe size={12} className="text-blue-500" /> Công khai
                            </button>
                            <button
                              onClick={() => { setAudience("friends"); setIsAudienceOpen(false); }}
                              className="w-full px-3 py-1.5 text-left text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2 font-medium"
                            >
                              <Users size={12} className="text-emerald-500" /> Bạn bè
                            </button>
                            <button
                              onClick={() => { setAudience("only_me"); setIsAudienceOpen(false); }}
                              className="w-full px-3 py-1.5 text-left text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2 font-medium"
                            >
                              <Lock size={12} className="text-amber-500" /> Chỉ mình tôi
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Input area */}
              {selectedBg.id !== "none" ? (
                <div className={`rounded-xl p-6 min-h-[150px] flex items-center justify-center text-center shadow-inner relative transition-all duration-300 ${selectedBg.class}`}>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Hãy viết gì đó thật ấn tượng..."
                    className="w-full bg-transparent border-none text-white text-center text-lg font-bold placeholder-white/70 focus:ring-0 focus:outline-hidden resize-none"
                    rows={3}
                    maxLength={150}
                  />
                  <span className="absolute bottom-2 right-3 text-[10px] text-white/50 font-bold">
                    {text.length}/150
                  </span>
                </div>
              ) : (
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Hôm nay bạn muốn chia sẻ kiến thức gì?"
                  className="w-full min-h-[100px] text-slate-700 text-sm placeholder-slate-400 border-none focus:ring-0 focus:outline-hidden resize-none whitespace-pre-wrap"
                />
              )}

              {/* Media Preview grid */}
              {uploadedMedia.length > 0 && selectedBg.id === "none" && (
                <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden max-h-[220px]">
                  {uploadedMedia.map((m, index) => (
                    <div key={index} className="relative aspect-video bg-slate-900 group overflow-hidden">
                      {m.type === "video" ? (
                        <video src={getMediaUrl(m.file_url)} className="w-full h-full object-cover" controls />
                      ) : (
                        <img src={getMediaUrl(m.file_url)} alt="preview" className="w-full h-full object-cover" />
                      )}
                      <button
                        onClick={() => removeMedia(index)}
                        className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors shadow-sm"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploadMutation.isPending && (
                <div className="flex items-center justify-center py-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Loader2 size={16} className="animate-spin text-blue-500 mr-2" />
                  <span className="text-[11px] font-bold text-slate-500">Đang tải đa phương tiện lên server...</span>
                </div>
              )}

              {/* Error boundary alert */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-500 text-xs font-bold shrink-0">
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* Footer Control bar (Add media / select bg / submit changes) */}
            <div className="border-t border-slate-100 p-4 bg-slate-50 flex flex-col gap-3 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">
                  Thêm vào bài viết của bạn:
                </span>

                {/* Icons row */}
                <div className="flex items-center gap-1">
                  {/* Photo upload button */}
                  <button
                    onClick={triggerFileSelect}
                    disabled={uploadMutation.isPending}
                    className="p-2 hover:bg-white hover:shadow-xs text-emerald-500 rounded-full transition-all duration-200"
                    title="Ảnh/Video"
                  >
                    <Image size={18} />
                  </button>

                  {/* Feeling Picker button */}
                  <div className="relative" ref={feelingRef}>
                    <button
                      onClick={() => setIsFeelingOpen(!isFeelingOpen)}
                      className={`p-2 hover:bg-white hover:shadow-xs text-amber-500 rounded-full transition-all duration-200 ${selectedFeeling ? "bg-amber-50" : ""
                        }`}
                      title="Cảm xúc"
                    >
                      <Smile size={18} />
                    </button>

                    <AnimatePresence>
                      {isFeelingOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 bottom-10 w-52 bg-white border border-slate-100 shadow-xl rounded-xl p-2.5 z-20 grid grid-cols-4 gap-1.5"
                        >
                          {FEELINGS.map((feel) => (
                            <button
                              key={feel.value}
                              onClick={() => {
                                setSelectedFeeling(
                                  selectedFeeling?.value === feel.value ? null : feel
                                );
                                setIsFeelingOpen(false);
                              }}
                              className={`p-1.5 rounded-lg text-lg flex items-center justify-center transition-all ${selectedFeeling?.value === feel.value
                                ? "bg-amber-100 scale-105"
                                : "hover:bg-slate-50"
                                }`}
                              title={feel.label}
                            >
                              {feel.emoji}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Background Picker button */}
                  <div className="relative" ref={bgPickerRef}>
                    <button
                      onClick={() => setIsBgPickerOpen(!isBgPickerOpen)}
                      className={`p-2 hover:bg-white hover:shadow-xs text-purple-500 rounded-full transition-all duration-200 ${selectedBg.id !== "none" ? "bg-purple-50" : ""
                        }`}
                      title="Màu nền"
                    >
                      <Palette size={18} />
                    </button>

                    <AnimatePresence>
                      {isBgPickerOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 bottom-10 w-44 bg-white border border-slate-100 shadow-xl rounded-xl p-2 z-20 flex flex-wrap gap-1.5 justify-center"
                        >
                          {GRADIENTS.map((bg) => (
                            <button
                              key={bg.id}
                              onClick={() => handleBgSelect(bg)}
                              className={`w-7 h-7 rounded-full border border-slate-200 transition-transform ${bg.id === "none" ? "bg-slate-100" : bg.class
                                } ${selectedBg.id === bg.id
                                  ? "ring-2 ring-blue-500 scale-110"
                                  : "hover:scale-105"
                                }`}
                              title={bg.name}
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveChanges}
                disabled={editMutation.isPending || uploadMutation.isPending || (!text.trim() && uploadedMedia.length === 0)}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition-all duration-200 flex items-center justify-center gap-1.5 hover:shadow-md"
              >
                {editMutation.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <span>Lưu thay đổi</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
