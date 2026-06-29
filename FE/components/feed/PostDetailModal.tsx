"use client";
import { useState, useRef, useEffect } from "react";
import { X, MessageCircle, Share2, ThumbsUp, MoreHorizontal, Bookmark, Edit3, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatCount } from "../../lib/utils";
import CommentSection from "./CommentSection";
import EmojiPickerPopup from "./EmojiPickerPopup";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface PostDetailModalProps {
  post: any;
  currentUser: any;
  isOpen: boolean;
  onClose: () => void;
  commentCount: number;
  onCommentCountChange: (newCount: number) => void;
  likeCount: number;
  currentReaction: string | null;
  stats: Record<string, number>;
  onReactionSelect: (reactionType: string | null) => void;
}

export default function PostDetailModal({
  post,
  currentUser,
  isOpen,
  onClose,
  commentCount,
  onCommentCountChange,
  likeCount,
  currentReaction,
  stats,
  onReactionSelect,
}: PostDetailModalProps) {
  const t = useTranslations("post");
  const REACTIONS = [
    { type: "like", label: t("like"), emoji: "👍", color: "text-blue-500" },
    { type: "love", label: t("love"), emoji: "❤️", color: "text-rose-500" },
    { type: "haha", label: t("haha"), emoji: "😆", color: "text-amber-500" },
    { type: "wow", label: t("wow"), emoji: "😮", color: "text-yellow-500" },
    { type: "sad", label: t("sad"), emoji: "😢", color: "text-blue-400" },
    { type: "angry", label: t("angry"), emoji: "😡", color: "text-orange-600" },
  ];

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Dọn dẹp timeout picker
  useEffect(() => {
    return () => {
      if (pickerTimeoutRef.current) clearTimeout(pickerTimeoutRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const hasMedia = post.images && post.images.length > 0;
  const isVideo = hasMedia && (post.images[0].endsWith(".mp4") || post.images[0].endsWith(".webm") || post.images[0].includes("video"));

  const handleQuickLike = () => {
    if (currentReaction) {
      onReactionSelect(null);
    } else {
      onReactionSelect("👍");
    }
  };

  const handleMouseEnter = () => {
    if (pickerTimeoutRef.current) clearTimeout(pickerTimeoutRef.current);
    setIsPickerOpen(true);
  };

  const handleMouseLeave = () => {
    pickerTimeoutRef.current = setTimeout(() => {
      setIsPickerOpen(false);
    }, 400);
  };

  // Lấy icon reaction hiện tại
  const getReactionDisplay = () => {
    if (!currentReaction) return { emoji: "👍", label: t("like"), color: "text-slate-500" };
    const react = REACTIONS.find((r) => r.type === currentReaction || r.emoji === currentReaction);
    return react ? { emoji: react.emoji, label: react.label, color: react.color } : { emoji: currentReaction, label: t("like"), color: "text-blue-500" };
  };

  const activeReaction = getReactionDisplay();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-black/80 backdrop-blur-md">
        {/* Nút đóng góc phải trên cho cả Modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={cn(
            "w-full h-full md:h-[90vh] bg-white rounded-none md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative",
            hasMedia ? "max-w-6xl" : "max-w-xl"
          )}
        >
          {/* 🎬 Cột bên trái: Hiển thị Media (Ảnh/Video rộng lẫy) */}
          {hasMedia && (
            <div className="flex-1 bg-slate-950 flex items-center justify-center relative min-h-[300px] md:min-h-0 group">
              {isVideo ? (
                <video
                  src={post.images[0]}
                  controls
                  autoPlay
                  className="w-full h-full max-h-[40vh] md:max-h-[90vh] object-contain"
                />
              ) : (
                <img
                  src={post.images[0]}
                  alt="Post media"
                  className="w-full h-full max-h-[40vh] md:max-h-[90vh] object-contain"
                />
              )}

              {/* Grid nếu có nhiều ảnh */}
              {post.images.length > 1 && (
                <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full text-white text-xs font-semibold">
                  {t("otherImages", { count: post.images.length - 1 })}
                </div>
              )}
            </div>
          )}

          {/* 💬 Cột bên phải: Tương tác, Nội dung & Bình luận */}
          <div className={cn(
            "flex flex-col bg-white overflow-hidden",
            hasMedia ? "w-full md:w-[400px] shrink-0 border-l border-slate-100" : "w-full"
          )}>
            {/* Header tác giả */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 shrink-0">
              <img
                src={post.user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=post"}
                alt={post.user.name}
                className="w-10 h-10 rounded-full border object-cover shadow-xs"
              />
              <div className="flex-grow min-w-0">
                <h3 className="font-bold text-sm text-slate-800 truncate leading-tight">
                  {post.user.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>{post.time}</span>
                  {post.audience && (
                    <span className="capitalize px-1.5 py-0.2 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-500">
                      {post.audience}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Vùng Content scroll được */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 flex flex-col">
              {/* Nội dung bài viết */}
              {post.content && (
                <div className={cn(
                  "text-slate-700 leading-relaxed text-sm break-words whitespace-pre-wrap",
                  post.post_background && "p-6 rounded-2xl text-center font-bold text-white text-lg flex items-center justify-center min-h-[140px] shadow-inner"
                )}
                style={post.post_background ? { background: post.post_background } : undefined}
                >
                  {post.content}
                </div>
              )}

              {/* Reaction Stats */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-medium">
                    {t("interactions", { count: formatCount(likeCount) })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{t("comments", { count: commentCount })}</span>
                  <span>{t("shares", { count: post.shares || 0 })}</span>
                </div>
              </div>

              {/* Action Buttons (Like / Comment / Share) */}
              <div className="flex items-center border-y border-slate-100 py-1 shrink-0 relative">
                {/* Nút Like kèm Hover Reaction Picker */}
                <div
                  className="flex-1 relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  ref={pickerRef}
                >
                  <button
                    onClick={handleQuickLike}
                    className="w-full flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-xl transition-colors duration-200"
                  >
                    <span className={cn("text-base", activeReaction.color)}>
                      {activeReaction.emoji}
                    </span>
                    <span className={cn("text-xs font-bold transition-all duration-200", activeReaction.color)}>
                      {activeReaction.label}
                    </span>
                  </button>

                  {/* Reaction Picker Popup */}
                  <AnimatePresence>
                    {isPickerOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white/95 backdrop-blur-md border border-slate-100/80 shadow-2xl rounded-full px-3 py-2 flex items-center gap-2 z-50 shrink-0 select-none animate-in fade-in slide-in-from-bottom-2 duration-200"
                      >
                        {REACTIONS.map((react, index) => (
                          <motion.button
                            key={react.type}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => {
                              onReactionSelect(react.emoji === currentReaction ? null : react.emoji);
                              setIsPickerOpen(false);
                            }}
                            className="w-9 h-9 hover:bg-slate-50 rounded-full flex flex-col items-center justify-center transition-all duration-200 hover:scale-130 active:scale-95 cursor-pointer"
                            title={react.label}
                          >
                            <span className="text-xl leading-none">{react.emoji}</span>
                          </motion.button>
                        ))}
                        
                        <div className="relative">
                          <motion.button
                            type="button"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: REACTIONS.length * 0.03 }}
                            whileHover={{ scale: 1.1, y: -2 }}
                            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-500 shrink-0 ml-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsPickerOpen(true);
                            }}
                          >
                            <Plus size={16} />
                          </motion.button>
                          {isPickerOpen && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2">
                              <EmojiPickerPopup
                                onEmojiSelect={(emojiData) => {
                                  onReactionSelect(emojiData.native);
                                  setIsPickerOpen(false);
                                }}
                                onClickOutside={() => {}}
                                position="top"
                              />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex-1">
                  <button className="w-full flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors">
                    <MessageCircle size={15} />
                    <span className="text-xs font-bold">{t("comment")}</span>
                  </button>
                </div>

                <div className="flex-1">
                  <button className="w-full flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors">
                    <Share2 size={15} />
                    <span className="text-xs font-bold">{t("share")}</span>
                  </button>
                </div>
              </div>

              {/* 🚀 Comments Section độc lập */}
              <div className="flex-1 overflow-y-auto">
                <CommentSection
                  postId={post.id}
                  currentUser={currentUser}
                  onCommentCountChange={onCommentCountChange}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
