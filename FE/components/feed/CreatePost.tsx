"use client";
import { useState, useRef, useEffect } from "react";
import { 
  Image, 
  MoreHorizontal, 
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
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";

interface CreatePostProps {
  currentUser?: any;
  onPostCreated?: () => void;
  groupId?: string;
}

const FEELINGS = [
  { emoji: "🤩", value: "excited" },
  { emoji: "😊", value: "happy" },
  { emoji: "🥰", value: "loved" },
  { emoji: "😢", value: "sad" },
  { emoji: "🙏", value: "thankful" },
  { emoji: "😌", value: "relaxed" },
  { emoji: "💻", value: "focused" },
  { emoji: "🧐", value: "curious" },
];

const GRADIENTS = [
  { id: "none", class: "bg-transparent text-slate-700" },
  { id: "sunset", class: "bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white font-bold" },
  { id: "ocean", class: "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold" },
  { id: "forest", class: "bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-white font-bold" },
  { id: "cosmic", class: "bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-white font-bold" },
  { id: "neon", class: "bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-700 text-white font-bold" },
  { id: "fire", class: "bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 text-white font-bold" },
];

const getMediaUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
  return `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function CreatePost({ currentUser, onPostCreated, groupId }: CreatePostProps) {
  const t = useTranslations("createPost");
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

  // File Upload Mutation
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
      setError(t("uploadError"));
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  });

  // Create Post Mutation
  const createPostMutation = useMutation({
    mutationFn: async (payload: any) => {
      await api.post("/api/v1/post", payload);
    },
    onSuccess: () => {
      setText("");
      setSelectedFeeling(null);
      setSelectedBg(GRADIENTS[0]);
      setUploadedMedia([]);
      if (onPostCreated) {
        onPostCreated();
      }
    },
    onError: (err: any) => {
      console.error("Failed to create post:", err);
      setError(err.response?.data?.message || t("postError"));
    }
  });

  // Handle Photo/Video button click
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

  // Remove media preview
  const removeMedia = (index: number) => {
    setUploadedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  // Select Gradient Background
  const handleBgSelect = (bg: typeof GRADIENTS[0]) => {
    setSelectedBg(bg);
    if (bg.id !== "none" && uploadedMedia.length > 0) {
      // Nếu chọn gradient, tự động xóa media cũ (gradient không đi kèm media)
      setUploadedMedia([]);
    }
    setIsBgPickerOpen(false);
  };

  const handlePost = () => {
    if (!text.trim() && uploadedMedia.length === 0) return;

    setError(null);

    const payload: any = {
      content: text,
      audience: audience,
      feeling: selectedFeeling ? `${selectedFeeling.emoji} ${t(`feelings.${selectedFeeling.value}`)}` : undefined,
      post_background: selectedBg.id !== "none" ? selectedBg.class : undefined,
    };

    if (groupId) {
      payload.group_id = groupId;
    }

    if (uploadedMedia.length > 0) {
      payload.media = uploadedMedia.map((m, index) => ({
        file_url: m.file_url,
        type: m.type,
        sort_order: index,
      }));
    }

    createPostMutation.mutate(payload);
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
        return t("public");
      case "friends":
        return t("friends");
      case "only_me":
        return t("onlyMe");
      default:
        return t("public");
    }
  };

  const avatarUrl = currentUser?.profile?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=default";
  const displayName = currentUser?.profile?.full_name || currentUser?.email || t("user");

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 transition-all duration-300 hover:shadow-md">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-sm font-semibold text-slate-800">
                {displayName}
              </span>
              {selectedFeeling && (
                <span className="text-xs text-slate-500 flex items-center gap-0.5 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 animate-in fade-in zoom-in duration-200">
                  {t("feelingAction", { feeling: `${selectedFeeling.emoji} ${t(`feelings.${selectedFeeling.value}`)}` })}
                  <button 
                    type="button" 
                    onClick={() => setSelectedFeeling(null)}
                    className="hover:text-red-500 ml-1"
                  >
                    <X size={10} />
                  </button>
                </span>
              )}
            </div>
            
            {/* Audience Dropdown */}
            <div className="relative mt-0.5" ref={audienceRef}>
              <button
                type="button"
                onClick={() => setIsAudienceOpen(!isAudienceOpen)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-100 text-xs font-medium text-slate-500 transition-all select-none outline-none focus:ring-1 focus:ring-blue-100"
              >
                {getAudienceIcon(audience)}
                <span>{getAudienceLabel(audience)}</span>
                <ChevronDown size={10} className={`transition-transform duration-200 ${isAudienceOpen ? "rotate-180" : ""}`} />
              </button>

              {isAudienceOpen && (
                <div className="absolute left-0 mt-1.5 w-40 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                  {(["public", "friends", "only_me"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setAudience(type);
                        setIsAudienceOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left transition-colors ${
                        audience === type ? "bg-blue-50/50 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {getAudienceIcon(type)}
                      <span>{getAudienceLabel(type)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <button className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-all">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Main Textarea Container with Gradient Background capability */}
      <div 
        className={`rounded-2xl transition-all duration-300 relative ${
          selectedBg.id !== "none" 
            ? `${selectedBg.class} p-6 min-h-[160px] flex items-center justify-center text-center shadow-inner` 
            : "p-0"
        }`}
      >
        <textarea
          rows={selectedBg.id !== "none" ? 4 : 3}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError(null);
          }}
          placeholder={
            selectedBg.id !== "none" 
              ? t("writeImpressive")
              : t("shareKnowledge")
          }
          disabled={createPostMutation.isPending}
          className={`w-full resize-none text-sm outline-none bg-transparent leading-relaxed transition-all duration-300 ${
            createPostMutation.isPending ? "opacity-50" : ""
          } ${
            selectedBg.id !== "none" 
              ? "text-center font-bold text-lg text-white placeholder:text-white/70 overflow-hidden" 
              : "text-slate-700 placeholder:text-slate-400"
          }`}
          style={selectedBg.id !== "none" ? { verticalAlign: "middle" } : {}}
        />

        {/* Small reset background button if selected */}
        {selectedBg.id !== "none" && (
          <button
            type="button"
            onClick={() => setSelectedBg(GRADIENTS[0])}
            className="absolute top-2 right-2 p-1.5 bg-black/10 hover:bg-black/25 text-white rounded-full transition-all"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Media Upload Preview Grid */}
      {uploadedMedia.length > 0 && (
        <div className={`mt-3 grid gap-2 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 p-2 ${
          uploadedMedia.length === 1 ? "grid-cols-1" : "grid-cols-2"
        }`}>
          {uploadedMedia.map((media, idx) => (
            <div key={idx} className="relative aspect-[4/3] group rounded-lg overflow-hidden bg-slate-900 border border-slate-200/50 shadow-sm">
              {media.type === "video" ? (
                <video src={getMediaUrl(media.file_url)} controls className="w-full h-full object-cover" />
              ) : (
                <img src={getMediaUrl(media.file_url)} alt="upload-preview" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              )}
              
              <button
                type="button"
                onClick={() => removeMedia(idx)}
                className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploadMutation.isPending && (
        <div className="mt-3 flex items-center justify-center gap-2 p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs font-semibold">
          <Loader2 size={16} className="animate-spin text-blue-500" />
          <span>{t("uploadingLocal")}</span>
        </div>
      )}

      {error && (
        <p className="text-xs font-medium text-red-500 mt-2 mb-1 animate-pulse">
          {error}
        </p>
      )}

      {/* Footer controls */}
      <div className="border-t border-slate-100 mt-3 pt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-0.5">
          {/* Photos Upload Trigger */}
          <button 
            type="button"
            disabled={createPostMutation.isPending || uploadMutation.isPending} 
            onClick={triggerFileSelect}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 text-slate-500 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <span className="w-5 h-5 rounded-md bg-green-50 flex items-center justify-center">
              <Image size={11} className="text-green-500" />
            </span>
            <span className="text-xs">{t("photoVideo")}</span>
          </button>

          {/* Feeling Trigger */}
          <div className="relative" ref={feelingRef}>
            <button 
              type="button"
              disabled={createPostMutation.isPending}
              onClick={() => setIsFeelingOpen(!isFeelingOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 text-slate-500 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <span className="w-5 h-5 rounded-md bg-yellow-50 flex items-center justify-center">
                <Smile size={11} className="text-yellow-500" />
              </span>
              <span className="text-xs">{t("feeling")}</span>
            </button>

            {isFeelingOpen && (
              <div className="absolute left-0 mt-2 w-60 bg-white border border-slate-100 rounded-xl shadow-xl p-3 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                <h4 className="text-xs font-bold text-slate-400 mb-2 px-1">{t("howAreYouFeeling")}</h4>
                <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
                  {FEELINGS.map((feel) => (
                    <button
                      key={feel.value}
                      type="button"
                      onClick={() => {
                        setSelectedFeeling(feel);
                        setIsFeelingOpen(false);
                      }}
                      className="flex items-center gap-1.5 p-1.5 hover:bg-slate-50 rounded-lg text-left text-xs font-medium text-slate-600 transition-colors"
                    >
                      <span className="text-base">{feel.emoji}</span>
                      <span className="truncate">{t(`feelings.${feel.value}`)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Background Picker Trigger */}
          <div className="relative" ref={bgPickerRef}>
            <button 
              type="button"
              disabled={createPostMutation.isPending}
              onClick={() => setIsBgPickerOpen(!isBgPickerOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 text-slate-500 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <span className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center">
                <Palette size={11} className="text-blue-500" />
              </span>
              <span className="text-xs">{t("background")}</span>
            </button>

            {isBgPickerOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-100 rounded-xl shadow-xl p-3 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                <h4 className="text-xs font-bold text-slate-400 mb-2 px-1">{t("chooseBackground")}</h4>
                <div className="grid grid-cols-4 gap-1.5">
                  {GRADIENTS.map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => handleBgSelect(bg)}
                      className={`h-10 rounded-lg border flex items-center justify-center text-[10px] font-bold overflow-hidden transition-all duration-200 active:scale-95 ${
                        bg.id === "none" 
                          ? "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100" 
                          : `${bg.class} border-white shadow-sm hover:scale-105`
                      } ${selectedBg.id === bg.id ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
                      title={t(`gradients.${bg.id}`)}
                    >
                      {bg.id === "none" ? "None" : "Aa"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(text.trim() || uploadedMedia.length > 0) && (
            <button
              type="button"
              onClick={handlePost}
              disabled={createPostMutation.isPending || uploadMutation.isPending}
              className="bg-blue-500 text-white text-xs font-semibold px-4 h-8 rounded-xl hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-1.5 shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 disabled:opacity-50"
            >
              {createPostMutation.isPending ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>{t("posting")}</span>
                </>
              ) : (
                <span>{t("postBtn")}</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
