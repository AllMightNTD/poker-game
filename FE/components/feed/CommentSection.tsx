"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Image, 
  Smile, 
  Send, 
  Loader2, 
  X, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  MessageCircle,
  Play,
  CornerDownRight,
  Mic
} from "lucide-react";
import VoiceRecorderInput from "./VoiceRecorderInput";
import VoiceCommentPlayer from "./VoiceCommentPlayer";
import api from "@/lib/axios";
import { useSocket } from "@/components/providers/SocketProvider";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";

interface CommentSectionProps {
  postId: string;
  currentUser?: any;
  onCommentCountChange?: (newCount: number) => void;
}

const QUICK_EMOJIS = ["😀", "😂", "🥰", "👍", "❤️", "🎉", "🚀", "💻", "🔥", "😭", "😮", "😡"];

const getMediaUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
  return `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function CommentSection({ postId, currentUser, onCommentCountChange }: CommentSectionProps) {
  const t = useTranslations("comment");
  const { socket } = useSocket();
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  // Ô nhập comment gốc
  const [inputText, setInputText] = useState("");
  const [uploadedMedia, setUploadedMedia] = useState<{ file_url: string; type: "image" | "video" | "voice" } | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isRecordingMode, setIsRecordingMode] = useState(false);

  // States quản lý việc trả lời comment (Reply)
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [uploadedReplyMedia, setUploadedReplyMedia] = useState<{ file_url: string; type: "image" | "video" | "voice" } | null>(null);
  const [isReplyEmojiOpen, setIsReplyEmojiOpen] = useState(false);

  // States quản lý việc sửa comment (Edit)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [uploadedEditMedia, setUploadedEditMedia] = useState<{ file_url: string; type: "image" | "video" | "voice" } | null>(null);

  // Quản lý dropdown action 3 chấm của comment
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  // Tải danh sách comment ban đầu
  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/api/v1/comment/post/${postId}?sort=oldest&page=1&limit=10`);
      const data = res.data?.comments || res.data?.metadata?.comments || [];
      const total = res.data?.meta?.total || res.data?.metadata?.meta?.total || 0;
      setComments(data);
      setTotalCount(total);
      setPage(1);
    } catch (err: any) {
      console.error("Failed to load comments:", err);
      setError("Không thể tải bình luận.");
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  const handleLoadMoreComments = async () => {
    if (isLoadingMore) return;
    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const res = await api.get(`/api/v1/comment/post/${postId}?sort=oldest&page=${nextPage}&limit=10`);
      const newComments = res.data?.comments || res.data?.metadata?.comments || [];
      
      setComments((prev) => {
        const merged = [...prev];
        newComments.forEach((nc: any) => {
          if (!merged.some((c) => c.id === nc.id)) {
            merged.push(nc);
          }
        });
        return merged;
      });
      setPage(nextPage);
    } catch (err) {
      console.error("Failed to load more comments:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setActiveMenuId(null);
      }
      if (emojiRef.current && !emojiRef.current.contains(target)) {
        setIsEmojiPickerOpen(false);
        setIsReplyEmojiOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lắng nghe sự kiện socket realtime
  useEffect(() => {
    if (!socket) return;

    // Join room bình luận bài viết
    socket.emit("joinPostComments", { postId });

    const handleCommentCreated = (newComment: any) => {
      if (newComment.postId !== postId) return;

      setComments((prev) => {
        // Kiểm tra trùng lặp
        if (prev.some((c) => c.id === newComment.id)) return prev;

        if (newComment.parentId) {
          // Thêm reply con cấp 2
          return prev.map((comment) => {
            if (comment.id === newComment.parentId) {
              const currentReplies = comment.replies || [];
              if (currentReplies.some((r: any) => r.id === newComment.id)) return comment;
              return {
                ...comment,
                replies: [...currentReplies, newComment],
                reply_count: (comment.reply_count || 0) + 1,
              };
            }
            return comment;
          });
        } else {
          // Thêm comment gốc cấp 1
          return [...prev, { ...newComment, replies: [], reply_count: 0 }];
        }
      });

      if (onCommentCountChange) {
        // Tự động tăng đếm ở card chính
        fetchCommentsCount();
      }
    };

    const handleCommentUpdated = (updatedComment: any) => {
      if (updatedComment.postId !== postId) return;

      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === updatedComment.id) {
            return { ...comment, ...updatedComment };
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: comment.replies.map((r: any) => 
                r.id === updatedComment.id ? { ...r, ...updatedComment } : r
              ),
            };
          }
          return comment;
        })
      );
    };

    const handleCommentDeleted = (payload: { commentId: string; parentId?: string }) => {
      setComments((prev) => {
        if (payload.parentId) {
          return prev.map((comment) => {
            if (comment.id === payload.parentId) {
              return {
                ...comment,
                replies: (comment.replies || []).filter((r: any) => r.id !== payload.commentId),
                reply_count: Math.max(0, (comment.reply_count || 1) - 1),
              };
            }
            return comment;
          });
        } else {
          return prev.filter((c) => c.id !== payload.commentId);
        }
      });

      if (onCommentCountChange) {
        fetchCommentsCount();
      }
    };

    socket.on("commentCreated", handleCommentCreated);
    socket.on("commentUpdated", handleCommentUpdated);
    socket.on("commentDeleted", handleCommentDeleted);

    return () => {
      socket.off("commentCreated", handleCommentCreated);
      socket.off("commentUpdated", handleCommentUpdated);
      socket.off("commentDeleted", handleCommentDeleted);
    };
  }, [socket, postId, onCommentCountChange]);

  const fetchCommentsCount = async () => {
    try {
      const res = await api.get(`/api/v1/post`);
      const postData = res.data?.metadata?.find((p: any) => p.id === postId) || res.data?.find((p: any) => p.id === postId);
      if (postData && onCommentCountChange) {
        onCommentCountChange(postData.comment_count || 0);
      }
    } catch (err) {
      console.warn("Failed to sync comments count:", err);
    }
  };

  const uploadCommentMediaMutation = useMutation({
    mutationFn: async ({ file, mode }: { file: File, mode: "create" | "reply" | "edit" }) => {
      const formData = new FormData();
      formData.append("files", file);
      const res = await api.post("/api/v1/comment/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const media = res.data.metadata[0];
      return {
        file_url: media.file_url,
        type: media.type === "video" ? "video" : (file.type.includes("audio") ? "voice" : "image" as any),
        mode
      };
    },
    onSuccess: (data) => {
      if (data.mode === "create") setUploadedMedia(data);
      else if (data.mode === "reply") setUploadedReplyMedia(data);
      else if (data.mode === "edit") setUploadedEditMedia(data);
    },
    onError: (err) => {
      console.error("Upload file comment failed:", err);
      alert("Không thể tải tệp lên. Vui lòng thử lại!");
    }
  });

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>, mode: "create" | "reply" | "edit") => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadCommentMediaMutation.mutate({ file, mode }, {
      onSettled: () => {
        if (e.target) e.target.value = "";
      }
    });
  };

  const createCommentMutation = useMutation({
    mutationFn: async (payload: any) => {
      await api.post("/api/v1/comment", payload);
    },
    onSuccess: () => {
      setInputText("");
      setUploadedMedia(null);
      setIsEmojiPickerOpen(false);
    },
    onError: (err) => console.error("Create comment failed:", err)
  });

  const handleSubmitComment = () => {
    if (!inputText.trim() && !uploadedMedia) return;
    createCommentMutation.mutate({
      target_type: "post",
      target_id: postId,
      content: inputText,
      media_url: uploadedMedia?.file_url || undefined,
      type: uploadedMedia?.type === "voice" ? "voice" : (uploadedMedia ? "media" : "text"),
    });
  };

  const replyCommentMutation = useMutation({
    mutationFn: async (payload: any) => {
      await api.post("/api/v1/comment", payload);
    },
    onSuccess: () => {
      setReplyingToId(null);
      setReplyText("");
      setUploadedReplyMedia(null);
      setIsReplyEmojiOpen(false);
    },
    onError: (err) => console.error("Create reply failed:", err)
  });

  const handleSubmitReply = (parentId: string) => {
    if (!replyText.trim() && !uploadedReplyMedia) return;
    replyCommentMutation.mutate({
      target_type: "post",
      target_id: postId,
      parent_id: parentId,
      content: replyText,
      media_url: uploadedReplyMedia?.file_url || undefined,
      type: uploadedReplyMedia?.type === "voice" ? "voice" : (uploadedReplyMedia ? "media" : "text"),
    });
  };

  const editCommentMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string, payload: any }) => {
      await api.put(`/api/v1/comment/${id}`, payload);
    },
    onSuccess: () => {
      setEditingCommentId(null);
      setEditText("");
      setUploadedEditMedia(null);
    },
    onError: (err) => console.error("Edit comment failed:", err)
  });

  const handleSaveEdit = (commentId: string) => {
    if (!editText.trim() && !uploadedEditMedia) return;
    editCommentMutation.mutate({
      id: commentId,
      payload: {
        content: editText,
        media_url: uploadedEditMedia?.file_url || null,
      }
    });
  };

  const deleteCommentMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/comment/${id}`);
    },
    onError: (err) => console.error("Delete comment failed:", err)
  });

  const handleDeleteComment = (commentId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
    deleteCommentMutation.mutate(commentId);
  };

  // Tải thêm reply
  const handleLoadMoreReplies = async (commentId: string, currentLength: number) => {
    try {
      const page = Math.floor(currentLength / 10) + 1;
      const res = await api.get(`/api/v1/comment/${commentId}/replies?page=${page}&limit=10`);
      const newReplies = res.data?.replies || res.data?.metadata?.replies || [];

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            const currentReplies = c.replies || [];
            const merged = [...currentReplies];
            newReplies.forEach((nr: any) => {
              if (!merged.some((r) => r.id === nr.id)) {
                merged.push(nr);
              }
            });
            return {
              ...c,
              replies: merged,
            };
          }
          return c;
        })
      );
    } catch (err) {
      console.error("Load more replies failed:", err);
    }
  };

  const handleQuickEmojiSelect = (emoji: string, mode: "create" | "reply" | "edit") => {
    if (mode === "create") setInputText((prev) => prev + emoji);
    else if (mode === "reply") setReplyText((prev) => prev + emoji);
    else if (mode === "edit") setEditText((prev) => prev + emoji);
  };

  const currentAvatar = currentUser?.profile?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=me";

  return (
    <div className="space-y-4 pt-3 border-t border-slate-100 px-4 pb-4 bg-slate-50/50 rounded-b-2xl">
      {/* 🚀 Comment Form gốc */}
      <div className="flex gap-3">
        <img
          src={currentAvatar}
          alt="Avatar"
          className="w-8 h-8 rounded-full border border-slate-100 shadow-xs shrink-0 object-cover"
        />

        <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-2 shadow-xs transition-shadow focus-within:shadow-md">
          {uploadedMedia && (
            <div className="relative w-28 h-20 bg-slate-900 rounded-lg overflow-hidden mb-2 group">
              {uploadedMedia.type === "video" ? (
                <video src={getMediaUrl(uploadedMedia.file_url)} className="w-full h-full object-cover" />
              ) : (
                <img src={getMediaUrl(uploadedMedia.file_url)} className="w-full h-full object-cover" alt="upload" />
              )}
              <button
                onClick={() => setUploadedMedia(null)}
                className="absolute top-1 right-1 p-0.5 bg-black/75 hover:bg-black text-white rounded-full transition-colors"
              >
                <X size={10} />
              </button>
            </div>
          )}

          {uploadCommentMediaMutation.isPending && uploadCommentMediaMutation.variables?.mode === "create" && (
            <div className="flex items-center gap-1.5 py-1.5 px-2 bg-slate-50 border border-dashed border-slate-200 rounded-lg mb-2 text-[10px] font-bold text-slate-500">
              <Loader2 size={12} className="animate-spin text-blue-500" />
              Đang tải lên...
            </div>
          )}

          {isRecordingMode ? (
            <VoiceRecorderInput
              onRecordingComplete={(blob) => {
                const file = new File([blob], "voice.webm", { type: "audio/webm" });
                uploadCommentMediaMutation.mutate({ file, mode: "create" }, {
                  onSuccess: (data) => {
                    createCommentMutation.mutate({
                      target_type: "post",
                      target_id: postId,
                      content: "",
                      media_url: data.file_url,
                      type: "voice",
                    });
                    setIsRecordingMode(false);
                  }
                });
              }}
              onCancel={() => setIsRecordingMode(false)}
            />
          ) : (
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t("writeComment")}
              className="w-full bg-transparent text-xs text-slate-700 placeholder:text-slate-400 outline-none resize-none px-2 py-1"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
            />
          )}

          {!isRecordingMode && (
          <div className="flex items-center justify-between border-t border-slate-50 pt-1.5 mt-1 px-1">
            <div className="flex items-center gap-1 relative" ref={emojiRef}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleUploadFile(e, "create")}
                className="hidden"
                accept="image/*,video/*"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 hover:bg-slate-50 hover:text-emerald-500 rounded-full transition-colors text-slate-400"
                title="Ảnh/Video"
              >
                <Image size={15} />
              </button>

              <button
                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                className="p-1.5 hover:bg-slate-50 hover:text-amber-500 rounded-full transition-colors text-slate-400"
                title="Emoji"
              >
                <Smile size={15} />
              </button>

              <button
                onClick={() => setIsRecordingMode(true)}
                className="p-1.5 hover:bg-slate-50 hover:text-red-500 rounded-full transition-colors text-slate-400"
                title="Voice"
              >
                <Mic size={15} />
              </button>

              {/* Emoji Quick Picker */}
              <AnimatePresence>
                {isEmojiPickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-8 left-0 w-44 bg-white border border-slate-100 shadow-xl rounded-xl p-1.5 z-20 flex flex-wrap gap-1"
                  >
                    {QUICK_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleQuickEmojiSelect(emoji, "create")}
                        className="w-6 h-6 hover:bg-slate-50 text-sm flex items-center justify-center rounded-lg transition-transform hover:scale-110"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleSubmitComment}
              disabled={uploadCommentMediaMutation.isPending || createCommentMutation.isPending || (!inputText.trim() && !uploadedMedia)}
              className="p-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 text-white rounded-xl shadow-xs transition-all duration-200 flex items-center justify-center gap-1"
            >
              <Send size={12} />
            </button>
          </div>
          )}
        </div>
      </div>

      {/* 🚀 Comments List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-4">
          <Loader2 size={16} className="animate-spin text-blue-500 mr-1.5" />
          <span className="text-[10px] font-bold text-slate-400">{t("loading")}</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-3 text-[10px] font-semibold text-slate-400">
          {t("noComments")}
        </div>
      ) : (
        <div className="space-y-4">
          {totalCount > comments.length && (
            <button
              onClick={handleLoadMoreComments}
              disabled={isLoadingMore}
              className="w-full py-2 text-xs font-bold text-blue-500 hover:text-blue-600 disabled:text-slate-400 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-b border-slate-100 hover:bg-slate-50 rounded-lg"
            >
              {isLoadingMore ? (
                <Loader2 size={13} className="animate-spin text-blue-500" />
              ) : (
                t("loadMore")
              )}
            </button>
          )}

          {comments.map((comment) => {
            const author = comment.user?.profile?.full_name || comment.user?.email || t("anonymous");
            const avatar = comment.user?.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`;
            const isEditing = editingCommentId === comment.id;

            return (
              <div key={comment.id} className="group/item relative">
                {/* Bình luận Cấp 1 */}
                <div className="flex gap-3">
                  <img
                    src={avatar}
                    alt={author}
                    className="w-7 h-7 rounded-full border border-slate-100 object-cover shrink-0 shadow-xs"
                  />

                  <div className="flex-1 space-y-1">
                    {isEditing ? (
                      /* Form Sửa comment */
                      <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-xs max-w-md">
                        {uploadedEditMedia && (
                          <div className="relative w-20 h-16 bg-slate-900 rounded-lg overflow-hidden mb-2 group">
                            {uploadedEditMedia.type === "video" || uploadedEditMedia.file_url.endsWith(".mp4") || uploadedEditMedia.file_url.includes("video") ? (
                              <video src={getMediaUrl(uploadedEditMedia.file_url)} className="w-full h-full object-cover" />
                            ) : (
                              <img src={getMediaUrl(uploadedEditMedia.file_url)} className="w-full h-full object-cover" alt="upload" />
                            )}
                            <button
                              onClick={() => setUploadedEditMedia(null)}
                              className="absolute top-0.5 right-0.5 p-0.5 bg-black/75 hover:bg-black text-white rounded-full transition-colors"
                            >
                              <X size={8} />
                            </button>
                          </div>
                        )}
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full bg-transparent text-xs text-slate-700 outline-none resize-none px-1"
                          rows={2}
                        />
                        <div className="flex justify-end gap-1.5 mt-1 border-t border-slate-50 pt-1">
                          <button
                            onClick={() => setEditingCommentId(null)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-500"
                          >
                            {t("cancel")}
                          </button>
                          <button
                            onClick={() => handleSaveEdit(comment.id)}
                            className="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-[10px] font-bold shadow-xs"
                          >
                            {t("save")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Nội dung bình luận hiển thị */
                      <div className="inline-block bg-white border border-slate-100 rounded-2xl px-3.5 py-2 shadow-xs max-w-[90%] relative transition-all duration-200 hover:shadow-sm">
                        <p className="text-[11px] font-bold text-slate-800 leading-none mb-1">
                          {author}
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed break-words whitespace-pre-wrap">
                          {comment.content}
                        </p>

                        {comment.media_url && (
                          <div className="mt-2 rounded-xl overflow-hidden max-w-xs shadow-xs border border-slate-100/50">
                            {comment.type === "voice" || comment.media_url.endsWith(".webm") || comment.media_url.endsWith(".mp3") ? (
                              <VoiceCommentPlayer url={getMediaUrl(comment.media_url)} />
                            ) : comment.media_url.endsWith(".mp4") || comment.media_url.includes("video") ? (
                              <video src={getMediaUrl(comment.media_url)} className="w-full object-cover max-h-48" controls />
                            ) : (
                              <img src={getMediaUrl(comment.media_url)} className="w-full object-cover max-h-48" alt="comment asset" />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Nút bấm Reply / Edit / Delete */}
                    {!isEditing && (
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 pl-2">
                        <span>{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <button
                          onClick={() => {
                            setReplyingToId(replyingToId === comment.id ? null : comment.id);
                            setReplyText("");
                            setUploadedReplyMedia(null);
                          }}
                          className="hover:text-blue-500 transition-colors cursor-pointer flex items-center gap-0.5"
                        >
                          <CornerDownRight size={10} /> {t("reply")}
                        </button>

                        {/* Dropdown Menu actions 3 chấm */}
                        <div className="relative inline-block" ref={menuRef}>
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === comment.id ? null : comment.id)}
                            className="opacity-0 group-hover/item:opacity-100 p-0.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-md transition-all cursor-pointer"
                          >
                            <MoreHorizontal size={10} />
                          </button>

                          <AnimatePresence>
                            {activeMenuId === comment.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                className="absolute left-0 mt-1 w-28 bg-white border border-slate-100 rounded-lg shadow-lg py-0.5 z-20 overflow-hidden"
                              >
                                {comment.user_id === currentUser?.id ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingCommentId(comment.id);
                                        setEditText(comment.content || "");
                                        setUploadedEditMedia(comment.media_url ? { file_url: comment.media_url, type: "image" } : null);
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full px-3 py-1.5 hover:bg-slate-50 text-[10px] font-semibold text-slate-700 flex items-center gap-1.5"
                                    >
                                      <Edit3 size={11} className="text-blue-500" /> {t("edit")}
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm(t("deleteConfirm"))) {
                                          handleDeleteComment(comment.id);
                                          setActiveMenuId(null);
                                        }
                                      }}
                                      className="w-full px-3 py-1.5 hover:bg-slate-50 text-[10px] font-semibold text-rose-600 flex items-center gap-1.5"
                                    >
                                      <Trash2 size={11} /> {t("delete")}
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => alert(t("report"))}
                                    className="w-full px-3 py-1.5 hover:bg-slate-50 text-[10px] font-semibold text-slate-500 flex items-center gap-1.5"
                                  >
                                    {t("report")}
                                  </button>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 🚀 Phản hồi Cấp 2 (Replies Indented) */}
                <div className="pl-9 mt-2.5 space-y-3 border-l-2 border-slate-200/50 ml-3.5">
                  {comment.replies && comment.replies.map((reply: any) => {
                    const rAuthor = reply.user?.profile?.full_name || reply.user?.email || "Người dùng";
                    const rAvatar = reply.user?.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rAuthor}`;
                    const isReplyEditing = editingCommentId === reply.id;

                    return (
                      <div key={reply.id} className="group/reply relative flex gap-2.5">
                        <img
                          src={rAvatar}
                          alt={rAuthor}
                          className="w-6 h-6 rounded-full border border-slate-100 object-cover shrink-0 shadow-xs"
                        />

                        <div className="flex-1 space-y-1">
                          {isReplyEditing ? (
                            <div className="bg-white border border-slate-200 rounded-xl p-2 max-w-sm">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full bg-transparent text-xs text-slate-700 outline-none resize-none"
                                rows={2}
                              />
                              <div className="flex justify-end gap-1 mt-1">
                                <button onClick={() => setEditingCommentId(null)} className="px-2 py-0.5 bg-slate-100 rounded-md text-[9px] font-bold text-slate-500">
                                  {t("cancel")}
                                </button>
                                <button onClick={() => handleSaveEdit(reply.id)} className="px-2 py-0.5 bg-blue-600 text-white rounded-md text-[9px] font-bold">
                                  {t("save")}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="inline-block bg-white border border-slate-100 rounded-2xl px-3 py-1.5 shadow-xs max-w-[90%] relative transition-all duration-200 hover:shadow-xs">
                              <p className="text-[10px] font-bold text-slate-800 leading-none mb-0.5">
                                {rAuthor}
                              </p>
                              <p className="text-xs text-slate-600 leading-normal">
                                {reply.content}
                              </p>
                              {reply.media_url && (
                                <div className="mt-1.5 rounded-lg overflow-hidden max-w-xs border border-slate-100/50">
                                  {reply.type === "voice" || reply.media_url.endsWith(".webm") || reply.media_url.endsWith(".mp3") ? (
                                    <VoiceCommentPlayer url={getMediaUrl(reply.media_url)} />
                                  ) : reply.media_url.endsWith(".mp4") || reply.media_url.includes("video") ? (
                                    <video src={getMediaUrl(reply.media_url)} className="w-full object-cover max-h-36" controls />
                                  ) : (
                                    <img src={getMediaUrl(reply.media_url)} className="w-full object-cover max-h-36" alt="reply asset" />
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {!isReplyEditing && (
                            <div className="flex items-center gap-2.5 text-[9px] font-bold text-slate-400 pl-1.5">
                              <span>{new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              
                              <div className="relative inline-block" ref={menuRef}>
                                <button
                                  onClick={() => setActiveMenuId(activeMenuId === reply.id ? null : reply.id)}
                                  className="opacity-0 group-hover/reply:opacity-100 p-0.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                                >
                                  <MoreHorizontal size={9} />
                                </button>

                                <AnimatePresence>
                                  {activeMenuId === reply.id && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                      className="absolute left-0 mt-0.5 w-24 bg-white border border-slate-100 rounded-md shadow-lg py-0.5 z-20 overflow-hidden"
                                    >
                                      {reply.user_id === currentUser?.id ? (
                                        <>
                                          <button
                                            onClick={() => {
                                              setEditingCommentId(reply.id);
                                              setEditText(reply.content || "");
                                              setActiveMenuId(null);
                                            }}
                                            className="w-full px-2 py-1 hover:bg-slate-50 text-[9px] font-semibold text-slate-700 flex items-center gap-1"
                                          >
                                            Sửa
                                          </button>
                                          <button
                                            onClick={() => {
                                              handleDeleteComment(reply.id);
                                              setActiveMenuId(null);
                                            }}
                                            className="w-full px-2 py-1 hover:bg-slate-50 text-[9px] font-semibold text-rose-600 flex items-center gap-1"
                                          >
                                            Xóa
                                          </button>
                                        </>
                                      ) : (
                                        <button className="w-full px-2 py-1 hover:bg-slate-50 text-[9px] font-semibold text-slate-500">
                                          Báo cáo
                                        </button>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Nút Xem thêm reply con */}
                  {comment.reply_count > (comment.replies?.length || 0) && (
                    <button
                      onClick={() => handleLoadMoreReplies(comment.id, comment.replies?.length || 0)}
                      className="text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer pl-1 mt-1"
                    >
                      <CornerDownRight size={10} /> {t("loadMoreReplies", { count: comment.reply_count - (comment.replies?.length || 0) })}
                    </button>
                  )}

                  {/* Form viết phản hồi (Reply Form) */}
                  {replyingToId === comment.id && (
                    <div className="flex gap-2 pt-2 border-t border-slate-100 max-w-md">
                      <img
                        src={currentAvatar}
                        alt="Avatar"
                        className="w-6 h-6 rounded-full border shadow-xs object-cover shrink-0"
                      />
                      <div className="flex-1 bg-white border border-slate-200 rounded-xl p-2 shadow-xs transition-shadow focus-within:shadow-sm">
                        {uploadedReplyMedia && (
                          <div className="relative w-20 h-16 bg-slate-900 rounded-lg overflow-hidden mb-2 group">
                            {uploadedReplyMedia.type === "video" ? (
                              <video src={getMediaUrl(uploadedReplyMedia.file_url)} className="w-full h-full object-cover" />
                            ) : (
                              <img src={getMediaUrl(uploadedReplyMedia.file_url)} className="w-full h-full object-cover" alt="upload" />
                            )}
                            <button
                              onClick={() => setUploadedReplyMedia(null)}
                              className="absolute top-0.5 right-0.5 p-0.5 bg-black/75 hover:bg-black text-white rounded-full transition-colors"
                            >
                              <X size={8} />
                            </button>
                          </div>
                        )}

                        {uploadCommentMediaMutation.isPending && uploadCommentMediaMutation.variables?.mode === "reply" && (
                          <div className="flex items-center gap-1 py-1 px-2 bg-slate-50 border border-dashed border-slate-200 rounded-md mb-2 text-[9px] font-bold text-slate-500">
                            <Loader2 size={10} className="animate-spin text-blue-500" />
                            Đang tải lên...
                          </div>
                        )}

                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Phản hồi ${author}...`}
                          className="w-full bg-transparent text-[11px] text-slate-700 placeholder:text-slate-400 outline-none resize-none px-1"
                          rows={1}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmitReply(comment.id);
                            }
                          }}
                        />

                        <div className="flex items-center justify-between border-t border-slate-50 pt-1 mt-1 px-1">
                          <div className="flex items-center gap-1 relative" ref={emojiRef}>
                            <input
                              type="file"
                              ref={replyFileInputRef}
                              onChange={(e) => handleUploadFile(e, "reply")}
                              className="hidden"
                              accept="image/*,video/*"
                            />

                            <button
                              onClick={() => replyFileInputRef.current?.click()}
                              className="p-1 hover:bg-slate-50 hover:text-emerald-500 rounded-full transition-colors text-slate-400"
                              title="Ảnh/Video"
                            >
                              <Image size={13} />
                            </button>

                            <button
                              onClick={() => setIsReplyEmojiOpen(!isReplyEmojiOpen)}
                              className="p-1 hover:bg-slate-50 hover:text-amber-500 rounded-full transition-colors text-slate-400"
                              title="Emoji"
                            >
                              <Smile size={13} />
                            </button>

                            {/* Emoji Quick Picker for Reply */}
                            <AnimatePresence>
                              {isReplyEmojiOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className="absolute bottom-6 left-0 w-36 bg-white border border-slate-100 shadow-xl rounded-lg p-1 z-20 flex flex-wrap gap-0.5"
                                >
                                  {QUICK_EMOJIS.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => handleQuickEmojiSelect(emoji, "reply")}
                                      className="w-5 h-5 hover:bg-slate-50 text-xs flex items-center justify-center rounded transition-transform hover:scale-110"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <button
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={uploadCommentMediaMutation.isPending || replyCommentMutation.isPending || (!replyText.trim() && !uploadedReplyMedia)}
                            className="p-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 text-white rounded-md shadow-xs transition-colors flex items-center justify-center gap-1"
                          >
                            <Send size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
