"use client";

import { useSocket } from "@/components/providers/SocketProvider";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Image as ImageIcon,
  Minus,
  RefreshCw,
  Send,
  Smile,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MiniChatContact, useMiniChat } from "./MiniChatContext";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  type: string;
  conversation_id: string;
  status?: "sending" | "sent" | "seen" | "failed";
  reply_to?: ChatMessage;
}

const QUICK_EMOJIS = ["😂", "❤️", "👍", "😮", "😢", "😡"];

// ---------------------------------------------------------------------------
// Helper: media URL resolution
// ---------------------------------------------------------------------------
function getMediaUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface MiniChatWindowProps {
  contact: MiniChatContact;
  currentUser?: any;
  /** Horizontal offset index (0 = rightmost) */
  index: number;
}

export default function MiniChatWindow({
  contact,
  currentUser,
  index,
}: MiniChatWindowProps) {
  const { closePopup, toggleMinimize, minimizedIds } = useMiniChat();
  const { socket } = useSocket();
  const isMinimized = minimizedIds.has(contact.id);

  // ---- State ----
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOpponentTyping, setIsOpponentTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // ---- Refs ----
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCurrentlyTypingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Media upload hook ----
  const { uploadingFiles, handleFileChange, handleRetry } = useMediaUpload({
    conversationId,
    socket,
    replyToId: null,
  });

  // ---- Fetch conversation & messages ----
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const convRes = await api.get(`/api/v1/chat/conversation/${contact.id}`);
        const convId = convRes.data.conversation_id;
        if (mounted && convId) {
          setConversationId(convId);
          const msgRes = await api.get(`/api/v1/chat/messages/${convId}`);
          if (mounted) setMessages(msgRes.data.data || []);
        }
      } catch (e) {
        console.error("[MiniChatWindow] fetch error", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [contact.id]);

  // ---- Auto scroll ----
  useEffect(() => {
    if (scrollRef.current && !isMinimized) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, uploadingFiles, isOpponentTyping, isMinimized]);

  // ---- Socket listeners ----
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit("joinConversation", { conversation_id: conversationId });

    const onNewMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        if (msg.sender_id === currentUser?.id) {
          const idx = prev.findIndex(
            (m) => m.status === "sending" && m.content === msg.content
          );
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = { ...msg, status: "sent" };
            return updated;
          }
        }
        return [...prev, { ...msg, status: "sent" }];
      });
      // Send seen receipt
      if (msg.sender_id !== currentUser?.id) {
        socket.emit("seenMessage", {
          conversation_id: conversationId,
          message_id: msg.id,
        });
      }
    };

    const onTypingStart = (data: { conversation_id: string; user_id: string }) => {
      if (data.conversation_id === conversationId && data.user_id !== currentUser?.id) {
        setIsOpponentTyping(true);
      }
    };

    const onTypingStop = (data: { conversation_id: string; user_id: string }) => {
      if (data.conversation_id === conversationId && data.user_id !== currentUser?.id) {
        setIsOpponentTyping(false);
      }
    };

    socket.on("newMessage", onNewMessage);
    socket.on("user_typing_start", onTypingStart);
    socket.on("user_typing_stop", onTypingStop);

    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("user_typing_start", onTypingStart);
      socket.off("user_typing_stop", onTypingStop);
      if (isCurrentlyTypingRef.current && conversationId) {
        socket.emit("typing_stop", { conversation_id: conversationId });
      }
    };
  }, [socket, conversationId, currentUser?.id]);

  // ---- Send text message ----
  const handleSend = (customText?: string) => {
    const content = customText !== undefined ? customText : text;
    if (!content.trim() || !socket || !conversationId) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    isCurrentlyTypingRef.current = false;
    socket.emit("typing_stop", { conversation_id: conversationId });

    const tempId = "tmp-" + Date.now();
    const optimistic: ChatMessage = {
      id: tempId,
      sender_id: currentUser?.id || "",
      content,
      created_at: new Date().toISOString(),
      type: "text",
      conversation_id: conversationId,
      status: "sending",
    };
    setMessages((prev) => [...prev, optimistic]);
    socket.emit("sendMessage", {
      conversation_id: conversationId,
      content,
      type: "text",
      reply_to_id: null,
    });
    if (customText === undefined) setText("");
    setShowEmojiPicker(false);
  };

  // ---- Typing emit handler ----
  const handleTextChange = (val: string) => {
    setText(val);
    if (!socket || !conversationId) return;
    if (!isCurrentlyTypingRef.current) {
      isCurrentlyTypingRef.current = true;
      socket.emit("typing_start", { conversation_id: conversationId });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isCurrentlyTypingRef.current = false;
      socket.emit("typing_stop", { conversation_id: conversationId });
    }, 2500);
  };

  // ---- Computed right offset ----
  const rightOffset = 16 + index * 336; // 320px width + 16px gap

  // ---- Status label ----
  const statusLabel =
    contact.status === "online"
      ? "Đang hoạt động"
      : contact.status === "away"
      ? "Tạm vắng"
      : "";

  // ---- Render media bubble ----
  const renderBubble = (msg: ChatMessage, isMe: boolean) => {
    const isImage = msg.type === "image";
    const isVideo = msg.type === "video";
    const mediaUrl = isImage || isVideo ? getMediaUrl(msg.content) : null;

    return (
      <div
        className={cn(
          "max-w-[200px] rounded-2xl text-[12.5px] leading-snug",
          isImage || isVideo ? "p-0.5 bg-transparent overflow-hidden rounded-xl" : "px-3 py-2",
          isMe
            ? "bg-blue-500 text-white rounded-br-sm"
            : "bg-slate-100 text-slate-800 rounded-bl-sm"
        )}
      >
        {isImage && mediaUrl ? (
          <img
            src={mediaUrl}
            alt="image"
            className="max-w-[180px] rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setLightboxUrl(mediaUrl)}
          />
        ) : isVideo && mediaUrl ? (
          <video
            src={mediaUrl}
            controls
            className="max-w-[180px] rounded-xl"
          />
        ) : (
          <span>{msg.content}</span>
        )}
      </div>
    );
  };

  return (
    <>
      {/* ── Lightbox overlay ── */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center backdrop-blur-sm"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            onClick={() => setLightboxUrl(null)}
          >
            <X size={18} />
          </button>
          <img
            src={lightboxUrl}
            alt="preview"
            className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── Chat Window ── */}
      <div
        className="fixed bottom-0 z-50 flex flex-col pointer-events-auto"
        style={{ right: rightOffset, width: 320 }}
      >
        {/* ── Header ── */}
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 cursor-pointer select-none",
            isMinimized
              ? "rounded-2xl shadow-lg"
              : "rounded-t-2xl border-b-0 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
          )}
          onDoubleClick={() => toggleMinimize(contact.id)}
        >
          {/* Avatar + status dot */}
          <div className="relative flex-shrink-0">
            {contact.avatar ? (
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                {contact.name.charAt(0).toUpperCase()}
              </div>
            )}
            {contact.status === "online" && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
            )}
            {contact.status === "away" && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-yellow-400 border-2 border-white rounded-full" />
            )}
          </div>

          {/* Name + status */}
          <div className="flex-1 min-w-0" onClick={() => toggleMinimize(contact.id)}>
            <p className="text-sm font-bold text-slate-800 truncate leading-tight">
              {contact.name}
            </p>
            {statusLabel && (
              <p className="text-[10px] text-slate-400 leading-tight">{statusLabel}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => toggleMinimize(contact.id)}
              className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
              title="Thu nhỏ"
            >
              {isMinimized ? <ChevronDown size={14} /> : <Minus size={14} />}
            </button>
            <button
              onClick={() => closePopup(contact.id)}
              className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
              title="Đóng"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* ── Body + Footer (hidden when minimized) ── */}
        {!isMinimized && (
          <div className="flex flex-col bg-white border border-t-0 border-slate-200 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-b-2xl overflow-hidden">
            {/* Message list */}
            <div
              ref={scrollRef}
              className="flex flex-col gap-1.5 px-3 py-3 overflow-y-auto scroll-smooth"
              style={{ height: 280 }}
            >
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 && uploadingFiles.length === 0 ? (
                <p className="text-center text-xs text-slate-400 mt-8">
                  Chưa có tin nhắn nào.
                  <br />Hãy bắt đầu cuộc trò chuyện! 👋
                </p>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUser?.id;
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex items-end gap-1.5",
                          isMe ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        {/* Opponent avatar */}
                        {!isMe && (
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase flex-shrink-0">
                            {contact.name.charAt(0)}
                          </div>
                        )}
                        {renderBubble(msg, isMe)}
                      </div>
                    );
                  })}

                  {/* Upload progress thumbnails */}
                  {uploadingFiles.map((f) => (
                    <div key={f.id} className="flex flex-row-reverse items-end gap-1.5">
                      <div className="relative max-w-[180px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                        {f.type === "image" ? (
                          <img
                            src={f.previewUrl}
                            alt="upload preview"
                            className="w-24 h-24 object-cover"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-slate-200 flex items-center justify-center">
                            <ImageIcon size={20} className="text-slate-400" />
                          </div>
                        )}

                        {/* Overlay: progress or status */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                          {f.status === "uploading" ? (
                            <>
                              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-1" />
                              <span className="text-[10px] text-white font-bold">{f.progress}%</span>
                            </>
                          ) : f.status === "failed" ? (
                            <button
                              onClick={() => handleRetry(f.id)}
                              className="flex flex-col items-center text-white"
                            >
                              <RefreshCw size={16} className="mb-0.5" />
                              <span className="text-[9px]">Thử lại</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-green-300 font-bold">✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Typing indicator */}
              {isOpponentTyping && (
                <div className="flex items-end gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase flex-shrink-0">
                    {contact.name.charAt(0)}
                  </div>
                  <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-3 py-2.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Quick emoji row */}
            {showEmojiPicker && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-t border-slate-100 bg-slate-50/60">
                {QUICK_EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => handleSend(e)}
                    className="text-lg hover:scale-125 transition-transform"
                  >
                    {e}
                  </button>
                ))}
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="ml-auto text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Footer input */}
            <div className="flex items-center gap-1.5 px-2 py-2 border-t border-slate-100">
              {/* Emoji toggle */}
              <button
                onClick={() => setShowEmojiPicker((v) => !v)}
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0",
                  showEmojiPicker
                    ? "bg-blue-100 text-blue-500"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                )}
              >
                <Smile size={15} />
              </button>

              {/* Image/video upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors flex-shrink-0"
                title="Gửi ảnh / video"
              >
                <ImageIcon size={15} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Text input */}
              <input
                type="text"
                placeholder="Aa"
                className="flex-1 h-8 bg-slate-50 border border-transparent focus:border-blue-200 rounded-full px-3 text-xs outline-none text-slate-700 placeholder:text-slate-400 transition-all"
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && text.trim()) handleSend();
                }}
              />

              {/* Send button */}
              <button
                onClick={() => handleSend()}
                disabled={!text.trim()}
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center transition-all flex-shrink-0",
                  text.trim()
                    ? "bg-blue-500 text-white hover:bg-blue-600 shadow-sm"
                    : "text-slate-300"
                )}
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
