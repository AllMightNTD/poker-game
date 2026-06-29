"use client";

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useStories } from "../hooks/use-stories";
import StoryCreatorModal from "./StoryCreatorModal";
import StoryViewerModal from "./StoryViewerModal";

interface StoriesProps {
  currentUser?: any;
}

export default function Stories({ currentUser }: StoriesProps) {
  const {
    feedItems,
    isCreatorOpen,
    setIsCreatorOpen,
    activeUserIndex,
    setActiveUserIndex,
    preselectedMusicSong,
    setPreselectedMusicSong,
    fetchFeed,
  } = useStories();
  const t = useTranslations("story");

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide select-none">

        {/* Nút Tạo Tin Mới (Add Story Card) */}
        <div
          onClick={() => setIsCreatorOpen(true)}
          className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
        >
          <div className="relative w-[100px] h-[155px] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex flex-col justify-end pb-3 group-hover:border-blue-300 transition-colors shadow-sm">
            {/* Avatar hiện tại làm ảnh nền mờ nhẹ cực kỳ premium */}
            <img
              src={currentUser?.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.profile?.full_name || 'user'}`}
              alt=""
              className="absolute inset-0 w-full h-2/3 object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
            />
            {/* Overlay phủ tối */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

            {/* Vòng tròn dấu cộng nằm đè ranh giới */}
            <div className="relative z-10 flex flex-col items-center gap-1.5 w-full">
              <div className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 group-hover:scale-110 transition-transform">
                <Plus size={16} className="text-white" />
              </div>
              <span className="text-[10px] font-bold text-white tracking-wide">
                {t("addStory")}
              </span>
            </div>
          </div>
        </div>

        {/* Hàng câu chuyện của Bạn Bè và Bản Thân */}
        {feedItems.map((item, index) => {
          const firstStory = item.stories[0];
          const hasUnviewed = item.hasUnviewed;

          // Trích xuất background
          const getStoryBackground = () => {
            if (firstStory.type === "text") {
              const bg = firstStory.background_color;
              if (bg === "midnight") return "bg-gradient-to-tr from-purple-800 via-violet-900 to-indigo-950";
              if (bg === "ocean") return "bg-gradient-to-tr from-teal-400 via-emerald-500 to-cyan-600";
              if (bg === "nebula") return "bg-gradient-to-tr from-indigo-900 via-purple-900 to-pink-500";
              if (bg === "sweet") return "bg-gradient-to-tr from-rose-400 via-fuchsia-500 to-indigo-500";
              if (bg === "emerald") return "bg-gradient-to-tr from-green-400 via-teal-500 to-blue-600";
              return "bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500"; // sunset
            }
            return "";
          };

          const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
          const getStoryMedia = (url?: string) => {
            if (!url) return "";
            if (url.startsWith("http://") || url.startsWith("https://")) return url;
            return `${apiBase}${url}`;
          };

          return (
            <div
              key={item.user.id}
              className="flex-shrink-0 cursor-pointer group"
              onClick={() => setActiveUserIndex(index)}
            >
              <div className="relative w-[100px] h-[155px] rounded-2xl overflow-hidden shadow-sm">
                {firstStory.type === "text" ? (
                  <div className={cn("w-full h-full flex items-center justify-center p-3 text-center", getStoryBackground())}>
                    <p className="text-white text-[8px] font-bold leading-relaxed line-clamp-4">
                      {firstStory.text_content}
                    </p>
                  </div>
                ) : (
                  <img
                    src={getStoryMedia(firstStory.media_url)}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}

                {/* Gradient overlay che mờ ở dưới */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                {/* Vòng tròn Avatar của người dùng */}
                <div
                  className={cn(
                    "absolute top-2.5 left-2.5 w-8 h-8 rounded-full p-0.5 z-10 flex items-center justify-center border",
                    hasUnviewed
                      ? "bg-gradient-to-br from-blue-400 to-blue-600 border-transparent animate-pulse"
                      : "bg-slate-300 border-white/20"
                  )}
                >
                  <img
                    src={item.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user.full_name}`}
                    alt={item.user.full_name}
                    className="w-full h-full rounded-full object-cover border border-white"
                  />
                </div>

                {/* Tên hiển thị người dùng */}
                <p className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-bold leading-tight line-clamp-2">
                  {currentUser?.id === item.user.id ? t("yourStory") : item.user.full_name}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal tạo tin mới */}
      <StoryCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => {
          setIsCreatorOpen(false);
          setPreselectedMusicSong(null);
        }}
        onSuccess={fetchFeed}
        initialSong={preselectedMusicSong}
      />

      {/* Trình xem tin fullscreen */}
      {activeUserIndex !== null && (
        <StoryViewerModal
          isOpen={activeUserIndex !== null}
          onClose={() => setActiveUserIndex(null)}
          feedItems={feedItems}
          initialUserIndex={activeUserIndex}
          currentUser={currentUser}
          onRefresh={fetchFeed}
          onReuseMusic={(song) => {
            setPreselectedMusicSong(song);
            setIsCreatorOpen(true);
            setActiveUserIndex(null);
          }}
        />
      )}
    </>
  );
}
