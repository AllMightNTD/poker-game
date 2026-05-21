"use client";

import { useSocket } from "@/components/providers/SocketProvider";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Smile,
  X,
  Settings,
  Image as ImageIcon,
  Play,
  Pause,
  Trash2,
  Copy,
  CornerUpLeft,
  Loader2,
  RefreshCw,
  Check,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

interface ChatBoxProps {
  contact: {
    id: string;
    name: string;
    avatar: string;
  };
  currentUser?: any;
  onClose: () => void;
}

const getMediaUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
  return `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`;
};

const THEME_MAP = {
  blue: {
    bg: "bg-blue-600",
    text: "text-blue-600",
    border: "border-blue-200",
    hover: "hover:bg-blue-50",
    fill: "bg-blue-50",
    bubbleMe: "bg-blue-600 text-white rounded-tr-none",
    borderInput: "focus:border-blue-300 focus:ring-blue-100",
  },
  purple: {
    bg: "bg-purple-600",
    text: "text-purple-600",
    border: "border-purple-200",
    hover: "hover:bg-purple-50",
    fill: "bg-purple-50",
    bubbleMe: "bg-purple-600 text-white rounded-tr-none",
    borderInput: "focus:border-purple-300 focus:ring-purple-100",
  },
  pink: {
    bg: "bg-pink-600",
    text: "text-pink-600",
    border: "border-pink-200",
    hover: "hover:bg-pink-50",
    fill: "bg-pink-50",
    bubbleMe: "bg-pink-600 text-white rounded-tr-none",
    borderInput: "focus:border-pink-300 focus:ring-pink-100",
  },
  green: {
    bg: "bg-emerald-600",
    text: "text-emerald-600",
    border: "border-emerald-200",
    hover: "hover:bg-emerald-50",
    fill: "bg-emerald-50",
    bubbleMe: "bg-emerald-600 text-white rounded-tr-none",
    borderInput: "focus:border-emerald-300 focus:ring-emerald-100",
  },
  orange: {
    bg: "bg-amber-600",
    text: "text-amber-600",
    border: "border-amber-200",
    hover: "hover:bg-amber-50",
    fill: "bg-amber-50",
    bubbleMe: "bg-amber-600 text-white rounded-tr-none",
    borderInput: "focus:border-amber-300 focus:ring-amber-100",
  },
};

const WALLPAPER_PRESETS = [
  { id: "default", name: "Mặc định", value: "" },
  { id: "sunset", name: "Sunset", value: "linear-gradient(to right bottom, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)" },
  { id: "midnight", name: "Midnight", value: "linear-gradient(to top, #30cfd0 0%, #330867 100%)" },
  { id: "emerald", name: "Emerald", value: "linear-gradient(to top, #0ba360 0%, #3cba92 100%)" },
  { id: "grid", name: "Lưới Grid", value: "repeating-linear-gradient(0deg, #f1f5f9, #f1f5f9 1px, transparent 1px, transparent 15px), repeating-linear-gradient(90deg, #f1f5f9, #f1f5f9 1px, transparent 1px, transparent 15px)" },
  { id: "dot", name: "Chấm Dot", value: "radial-gradient(#e2e8f0 1.5px, transparent 1.5px), radial-gradient(#e2e8f0 1.5px, #f8fafc 1.5px)" },
];

const EMOJI_LIST = [
  { emoji: "👍", tags: "like thumbs up ok yes agree" },
  { emoji: "❤️", tags: "heart love red" },
  { emoji: "😂", tags: "laugh tear crying laugh happy" },
  { emoji: "😮", tags: "wow surprise shock face" },
  { emoji: "😢", tags: "sad cry tear face unhappy" },
  { emoji: "🔥", tags: "fire lit hot trend burn" },
  { emoji: "😀", tags: "smile face grin happy" },
  { emoji: "😃", tags: "smile face happy" },
  { emoji: "😄", tags: "smile face happy laughing" },
  { emoji: "😁", tags: "grin smile face happy" },
  { emoji: "😆", tags: "smile face laugh" },
  { emoji: "😅", tags: "sweat laugh happy" },
  { emoji: "🤣", tags: "laugh roll face" },
  { emoji: "😊", tags: "blush smile face" },
  { emoji: "😇", tags: "angel halo face" },
  { emoji: "🙂", tags: "slight smile" },
  { emoji: "🙃", tags: "upside down" },
  { emoji: "😉", tags: "wink face" },
  { emoji: "😌", tags: "relieved face" },
  { emoji: "😍", tags: "heart eyes love face" },
  { emoji: "🥰", tags: "hearts love warm face" },
  { emoji: "😘", tags: "kiss blowing heart face" },
  { emoji: "😋", tags: "yum delicious tongue face" },
  { emoji: "😜", tags: "winking tongue face" },
  { emoji: "🤪", tags: "zany crazy face" },
  { emoji: "😎", tags: "sunglasses cool face" },
  { emoji: "🥳", tags: "party celebrating face" },
  { emoji: "😏", tags: "smirk face" },
  { emoji: "😒", tags: "unamused face" },
  { emoji: "😔", tags: "sad pensive face" },
  { emoji: "🥺", tags: "pleading begging face" },
  { emoji: "😭", tags: "loud cry tear sad face" },
  { emoji: "😤", tags: "triumph steam angry face" },
  { emoji: "😠", tags: "angry face mad" },
  { emoji: "😡", tags: "pouting red angry face" },
  { emoji: "🤯", tags: "exploding mind blown head" },
  { emoji: "😳", tags: "flushed embarrassed face" },
  { emoji: "🥵", tags: "hot red face sweat" },
  { emoji: "🥶", tags: "cold blue face" },
  { emoji: "😱", tags: "scream fear scared face" },
  { emoji: "🤔", tags: "thinking hand chin face" },
  { emoji: "👎", tags: "thumbs down no dislike" },
  { emoji: "👋", tags: "wave hello goodbye hand" },
  { emoji: "💪", tags: "muscle strong flex bicep" },
  { emoji: "🙏", tags: "pray hands please thanks" },
  { emoji: "✨", tags: "sparkles shine magic clean" },
  { emoji: "🌟", tags: "star shining gold" },
  { emoji: "💡", tags: "idea lightbulb smart" },
  { emoji: "🎉", tags: "party popper celebrate" },
  { emoji: "🎁", tags: "gift present box" },
  { emoji: "🚀", tags: "rocket launch speed" },
];

export default function ChatBox({ contact, currentUser, onClose }: ChatBoxProps) {
  const { socket, isConnected } = useSocket();
  const boxRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wallpaperInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Custom Settings States
  const [themeColor, setThemeColor] = useState<keyof typeof THEME_MAP>("blue");
  const [mainEmoji, setMainEmoji] = useState("👍");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [participants, setParticipants] = useState<{ user_id: string; nickname: string | null }[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [myNicknameInput, setMyNicknameInput] = useState("");
  const [friendNicknameInput, setFriendNicknameInput] = useState("");

  // Typing Indicator States
  const [isOpponentTyping, setIsOpponentTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCurrentlyTypingRef = useRef(false);

  // Reply Message State
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  // Zoomed Image
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Emoji Picker States
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState("");

  // Media Upload (shared hook)
  const { uploadingFiles, handleFileChange, handleRetry: handleRetryUpload } = useMediaUpload({
    conversationId,
    socket,
    replyToId: replyingTo?.id,
  });

  const activeTheme = THEME_MAP[themeColor] || THEME_MAP.blue;

  // Lấy Nickname hiển thị
  const getParticipantNickname = (userId: string) => {
    const p = participants.find((part) => part.user_id === userId);
    if (p && p.nickname) return p.nickname;
    if (userId === currentUser?.id) return "Bạn";
    return contact.name;
  };

  // Fetch Conversation & Messages
  useEffect(() => {
    let isMounted = true;
    const fetchConversationAndMessages = async () => {
      setLoading(true);
      try {
        const convRes = await api.get(`/api/v1/chat/conversation/${contact.id}`);
        const convId = convRes.data.conversation_id;

        if (isMounted && convId) {
          setConversationId(convId);
          setThemeColor((convRes.data.theme_color as keyof typeof THEME_MAP) || "blue");
          setMainEmoji(convRes.data.emoji || "👍");
          setBackgroundImage(convRes.data.background_image || "");
          setParticipants(convRes.data.participants || []);

          // Set biệt danh input ban đầu
          const myP = (convRes.data.participants || []).find((p: any) => p.user_id === currentUser?.id);
          const friendP = (convRes.data.participants || []).find((p: any) => p.user_id === contact.id);
          setMyNicknameInput(myP?.nickname || "");
          setFriendNicknameInput(friendP?.nickname || "");

          const msgRes = await api.get(`/api/v1/chat/messages/${convId}`);
          if (isMounted) {
            setMessages(msgRes.data.data || []);
          }
        }
      } catch (error) {
        console.error("Failed to fetch conversation or messages:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchConversationAndMessages();
    return () => {
      isMounted = false;
    };
  }, [contact.id, currentUser?.id]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !conversationId) return;

    // Reset opponent typing when conversation changes
    setIsOpponentTyping(false);
    isCurrentlyTypingRef.current = false;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit("joinConversation", { conversation_id: conversationId });

    socket.on("user_typing_start", (data: { conversation_id: string; user_id: string }) => {
      if (data.conversation_id === conversationId && data.user_id !== currentUser?.id) {
        setIsOpponentTyping(true);
      }
    });

    socket.on("user_typing_stop", (data: { conversation_id: string; user_id: string }) => {
      if (data.conversation_id === conversationId && data.user_id !== currentUser?.id) {
        setIsOpponentTyping(false);
      }
    });

    socket.on("newMessage", (message: ChatMessage) => {
      setMessages((prev) => {
        // Tránh trùng tin nhắn nếu ID đã tồn tại
        if (prev.find((m) => m.id === message.id)) return prev;

        // BUGFIX: Thay thế tin nhắn tạm thời (Optimistic update) cho chính người gửi
        if (message.sender_id === currentUser?.id) {
          const optIdx = prev.findIndex(
            (m) => m.status === "sending" && m.content === message.content
          );
          if (optIdx !== -1) {
            const updated = [...prev];
            updated[optIdx] = { ...message, status: "sent" };
            return updated;
          }
        }

        return [...prev, { ...message, status: "sent" }];
      });

      // Gửi seen receipt nếu không phải tin của mình
      if (message.sender_id !== currentUser?.id) {
        socket.emit("seenMessage", { conversation_id: conversationId, message_id: message.id });
      }
    });

    socket.on("messageSent", (message: ChatMessage) => {
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === message.id || (m.status === "sending" && m.content === message.content));
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = { ...message, status: "sent" };
          return updated;
        }
        // Do NOT append here — newMessage event already handles adding new messages
        return prev;
      });
    });

    socket.on("messageDeleted", (data: { message_id: string; conversation_id: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== data.message_id));
    });

    socket.on("messageSeen", (data: { user_id: string; conversation_id: string; message_id: string }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === data.message_id ? { ...m, status: "seen" as const } : m))
      );
    });

    socket.on("themeColorChanged", (data: { conversation_id: string; theme_color: string }) => {
      if (data.conversation_id === conversationId) {
        setThemeColor((data.theme_color as keyof typeof THEME_MAP) || "blue");
      }
    });

    socket.on("mainEmojiChanged", (data: { conversation_id: string; emoji: string }) => {
      if (data.conversation_id === conversationId) {
        setMainEmoji(data.emoji);
      }
    });

    socket.on("backgroundImageChanged", (data: { conversation_id: string; background_image: string }) => {
      if (data.conversation_id === conversationId) {
        setBackgroundImage(data.background_image || "");
      }
    });

    socket.on("nicknameChanged", (data: { conversation_id: string; target_user_id: string; nickname: string }) => {
      if (data.conversation_id === conversationId) {
        setParticipants((prev) => {
          const idx = prev.findIndex((p) => p.user_id === data.target_user_id);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], nickname: data.nickname || null };
            return updated;
          }
          return [...prev, { user_id: data.target_user_id, nickname: data.nickname || null }];
        });
      }
    });

    return () => {
      socket.off("newMessage");
      socket.off("messageSent");
      socket.off("messageDeleted");
      socket.off("messageSeen");
      socket.off("themeColorChanged");
      socket.off("mainEmojiChanged");
      socket.off("backgroundImageChanged");
      socket.off("nicknameChanged");
      socket.off("user_typing_start");
      socket.off("user_typing_stop");
    };
  }, [socket, conversationId, currentUser?.id]);

  // Cuộn cuối
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, uploadingFiles]);

  // Tự đóng khi click ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    const timeout = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Gửi Tin nhắn (Text / Emoji)
  const handleSendMessage = (customText?: string) => {
    const contentToSend = customText !== undefined ? customText : text;
    if (!contentToSend.trim() || !socket || !conversationId) return;

    // Stop typing indicator on send
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    isCurrentlyTypingRef.current = false;
    socket.emit("typing_stop", { conversation_id: conversationId });

    // Gửi optimistic message
    const tempId = "temp-" + Date.now();
    const optimisticMsg: ChatMessage = {
      id: tempId,
      sender_id: currentUser?.id || "",
      content: contentToSend,
      created_at: new Date().toISOString(),
      type: "text",
      conversation_id: conversationId,
      status: "sending",
      reply_to: replyingTo || undefined,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    const payload = {
      conversation_id: conversationId,
      content: contentToSend,
      type: "text",
      reply_to_id: replyingTo?.id || null,
    };

    socket.emit("sendMessage", payload);
    if (customText === undefined) {
      setText("");
    }
    setReplyingTo(null);
  };

  // Thả Emoji nhanh
  const handleSendMainEmoji = () => {
    handleSendMessage(mainEmoji);
  };

  // Cài đặt hình nền custom từ máy tính
  const handleWallpaperUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !conversationId || !socket) return;
    const file = files[0];

    // Chỉ cho phép ảnh dưới 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh nền phải nhỏ hơn 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("files", file);

    try {
      const res = await api.post("/api/v1/chat/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const fileUrl = res.data.metadata[0].file_url;
      socket.emit("changeBackgroundImage", { conversation_id: conversationId, background_image: fileUrl });
    } catch (err) {
      console.error("Wallpaper upload failed", err);
      alert("Không thể tải lên ảnh nền");
    }
  };

  // Click Reply cuộn & nháy
  const handleReplyClick = (replyToId: string) => {
    const el = document.getElementById(`msg-${replyToId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-4", "ring-yellow-300", "scale-[1.02]", "transition-all", "duration-300");
      setTimeout(() => {
        el.classList.remove("ring-4", "ring-yellow-300", "scale-[1.02]");
      }, 1500);
    }
  };

  // Copy Content
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // Delete Message
  const handleDeleteMessage = (messageId: string) => {
    if (!socket || !conversationId) return;
    socket.emit("deleteMessage", { conversation_id: conversationId, message_id: messageId });
  };

  // Đổi Theme Color
  const handleSelectTheme = (color: keyof typeof THEME_MAP) => {
    if (!socket || !conversationId) return;
    socket.emit("changeThemeColor", { conversation_id: conversationId, theme_color: color });
  };

  // Đổi Quick Emoji
  const handleSelectEmoji = (emoji: string) => {
    if (!socket || !conversationId) return;
    socket.emit("changeMainEmoji", { conversation_id: conversationId, emoji });
  };

  // Thay đổi ảnh nền
  const handleSetWallpaper = (bgValue: string) => {
    if (!socket || !conversationId) return;
    socket.emit("changeBackgroundImage", { conversation_id: conversationId, background_image: bgValue });
  };

  // Lưu Biệt danh
  const handleSaveNickname = (targetUserId: string, nicknameValue: string) => {
    if (!socket || !conversationId) return;
    socket.emit("changeNickname", {
      conversation_id: conversationId,
      target_user_id: targetUserId,
      nickname: nicknameValue.trim(),
    });
  };

  // Lọc Emojis
  const filteredEmojis = EMOJI_LIST.filter((e) =>
    e.tags.includes(emojiSearch.toLowerCase())
  );

  // Xác định style hình nền cho chat box
  const getChatBackgroundStyle = () => {
    if (!backgroundImage) return {};
    if (
      backgroundImage.startsWith("linear-gradient") ||
      backgroundImage.startsWith("radial-gradient") ||
      backgroundImage.startsWith("repeating-linear-gradient")
    ) {
      return { background: backgroundImage };
    }
    return {
      backgroundImage: `url(${getMediaUrl(backgroundImage)})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  };

  return (
    <div
      ref={boxRef}
      className={cn(
        "fixed z-50 flex flex-col bg-white border border-slate-200 shadow-[0_0_40px_rgba(0,0,0,0.08)]",
        "bottom-0 right-0 w-full h-[65vh] rounded-t-2xl transition-all duration-300",
        "sm:w-[360px] sm:h-[500px] sm:right-4 sm:rounded-2xl",
        "xl:right-[17rem]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-white rounded-t-2xl shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={contact.avatar || "https://ui-avatars.com/api/?name=" + contact.name}
              alt={contact.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
            />
            <span
              className={cn(
                "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white",
                isConnected ? "bg-green-500" : "bg-slate-300"
              )}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-slate-800 leading-none">
              {getParticipantNickname(contact.id)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
              {isConnected ? "Hoạt động" : "Đang kết nối..."}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              showSettings ? activeTheme.text + " " + activeTheme.fill : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
          >
            <Settings size={18} />
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50/50">
          <h3 className="font-extrabold text-sm text-slate-800">Cấu hình cuộc trò chuyện</h3>

          {/* Theme Color */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">Màu chủ đề</label>
            <div className="flex gap-2.5">
              {(Object.keys(THEME_MAP) as Array<keyof typeof THEME_MAP>).map((colorKey) => (
                <button
                  key={colorKey}
                  onClick={() => handleSelectTheme(colorKey)}
                  className={cn(
                    "w-7 h-7 rounded-full transition-transform active:scale-95 flex items-center justify-center ring-offset-2 ring-slate-100",
                    colorKey === "blue" && "bg-blue-600",
                    colorKey === "purple" && "bg-purple-600",
                    colorKey === "pink" && "bg-pink-600",
                    colorKey === "green" && "bg-emerald-600",
                    colorKey === "orange" && "bg-amber-600",
                    themeColor === colorKey && "ring-2 ring-slate-400"
                  )}
                >
                  {themeColor === colorKey && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Reaction Emoji */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">Biểu tượng thả nhanh</label>
            <div className="flex gap-2">
              {["👍", "❤️", "😂", "😮", "😢", "🔥"].map((emo) => (
                <button
                  key={emo}
                  onClick={() => handleSelectEmoji(emo)}
                  className={cn(
                    "text-xl p-1.5 rounded-lg hover:bg-slate-100 transition-colors active:scale-90",
                    mainEmoji === emo && activeTheme.fill + " ring-1 ring-slate-200"
                  )}
                >
                  {emo}
                </button>
              ))}
            </div>
          </div>

          {/* Wallpaper Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 block">Hình nền cuộc trò chuyện</label>
            <div className="grid grid-cols-3 gap-2">
              {WALLPAPER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSetWallpaper(preset.value)}
                  style={{
                    background: preset.value || "#f8fafc",
                    backgroundSize: preset.id === "dot" ? "10px 10px" : preset.id === "grid" ? "15px 15px" : "cover",
                  }}
                  className={cn(
                    "h-12 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-600 flex items-center justify-center transition-all hover:scale-[1.02] active:scale-95 shadow-sm",
                    backgroundImage === preset.value && "ring-2 ring-slate-400 border-transparent text-slate-800"
                  )}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Custom Upload Button */}
            <input
              type="file"
              ref={wallpaperInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleWallpaperUpload}
            />
            <button
              onClick={() => wallpaperInputRef.current?.click()}
              className="w-full mt-2 border border-dashed border-slate-300 hover:border-slate-400 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-600 transition-colors flex items-center justify-center gap-1.5 bg-white shadow-sm"
            >
              <ImageIcon size={14} />
              Tải lên ảnh nền riêng
            </button>
          </div>

          {/* Nicknames */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 block">Biệt danh</label>

            {/* Friend Nickname */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 block">Biệt danh của {contact.name}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Đặt biệt danh..."
                  className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-slate-300"
                  value={friendNicknameInput}
                  onChange={(e) => setFriendNicknameInput(e.target.value)}
                />
                <button
                  onClick={() => handleSaveNickname(contact.id, friendNicknameInput)}
                  className={cn("text-xs font-bold px-3 py-1.5 rounded-lg text-white shadow-sm transition-all", activeTheme.bg)}
                >
                  Lưu
                </button>
              </div>
            </div>

            {/* My Nickname */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 block">Biệt danh của Bạn</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Đặt biệt danh..."
                  className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-slate-300"
                  value={myNicknameInput}
                  onChange={(e) => setMyNicknameInput(e.target.value)}
                />
                <button
                  onClick={() => handleSaveNickname(currentUser?.id, myNicknameInput)}
                  className={cn("text-xs font-bold px-3 py-1.5 rounded-lg text-white shadow-sm transition-all", activeTheme.bg)}
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-700 pt-4 block"
          >
            Quay lại cuộc trò chuyện
          </button>
        </div>
      ) : (
        /* Chat View */
        <>
          {/* Messages Wrapper with custom Wallpaper */}
          <div
            ref={scrollRef}
            style={getChatBackgroundStyle()}
            className={cn(
              "flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth relative",
              !backgroundImage && "bg-[#f8fafc]"
            )}
          >
            {/* Dark overlay filter if using custom uploaded background to improve text readability */}
            {backgroundImage && !backgroundImage.includes("-gradient") && (
              <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] pointer-events-none z-0" />
            )}

            <div className="relative z-10 space-y-4">
              {loading ? (
                <div className="h-full flex items-center justify-center min-h-[250px]">
                  <Loader2 className={cn("w-6 h-6 animate-spin", activeTheme.text)} />
                </div>
              ) : messages.length === 0 && uploadingFiles.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 min-h-[250px]">
                  <Smile size={32} strokeWidth={1.5} />
                  <p className="text-xs font-bold">Bắt đầu trò chuyện với {getParticipantNickname(contact.id)}!</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUser?.id;
                    const isDeleted = msg.type === "system" && msg.content === "Tin nhắn đã bị thu hồi";

                    return (
                      <div
                        key={msg.id}
                        id={`msg-${msg.id}`}
                        className={cn("flex flex-col gap-1 group/msg relative", isMe ? "items-end" : "items-start")}
                      >
                        {/* Tên biệt danh nếu không phải mình */}
                        {!isMe && (
                          <span className="text-[10px] text-slate-500 font-bold ml-1 drop-shadow-sm">
                            {getParticipantNickname(msg.sender_id)}
                          </span>
                        )}

                        {/* Phản hồi UI đính kèm */}
                        {msg.reply_to && (
                          <div
                            onClick={() => handleReplyClick(msg.reply_to!.id)}
                            className={cn(
                              "text-[10px] px-2.5 py-1 rounded-t-xl opacity-75 cursor-pointer max-w-[75%] border-x border-t transition-all hover:opacity-100 flex items-center gap-1 shadow-sm",
                              isMe
                                ? "bg-slate-100 text-slate-500 border-slate-200"
                                : "bg-white text-slate-500 border-slate-100"
                            )}
                          >
                            <CornerUpLeft size={10} />
                            <span className="font-bold truncate">
                              {getParticipantNickname(msg.reply_to.sender_id)}:{" "}
                              {msg.reply_to.type === "text" ? msg.reply_to.content : `[${msg.reply_to.type}]`}
                            </span>
                          </div>
                        )}

                        {/* Bubble */}
                        <div className="flex items-center gap-2 max-w-[85%] group">
                          {/* Hover Action Bar (Left of bubble if Me) */}
                          {isMe && !isDeleted && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => setReplyingTo(msg)}
                                title="Phản hồi"
                                className="p-1 rounded-full text-slate-500 hover:text-slate-700 bg-white/80 hover:bg-white shadow-sm transition-all"
                              >
                                <CornerUpLeft size={12} />
                              </button>
                              <button
                                onClick={() => handleCopyMessage(msg.content)}
                                title="Sao chép"
                                className="p-1 rounded-full text-slate-500 hover:text-slate-700 bg-white/80 hover:bg-white shadow-sm transition-all"
                              >
                                <Copy size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                title="Thu hồi"
                                className="p-1 rounded-full text-slate-500 hover:text-rose-600 bg-white/80 hover:bg-rose-50 shadow-sm transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}

                          {/* Content */}
                          <div
                            className={cn(
                              "rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed font-bold shadow-sm transition-all duration-200",
                              isMe
                                ? msg.status === "failed"
                                  ? "bg-red-500 text-white rounded-tr-none"
                                  : activeTheme.bubbleMe
                                : "bg-white text-slate-700 border border-slate-100/50 rounded-tl-none",
                              msg.reply_to && "rounded-t-none border-t-0",
                              isDeleted && "bg-slate-100/90 text-slate-400 border-none italic font-normal"
                            )}
                          >
                            {isDeleted ? (
                              "Tin nhắn đã bị thu hồi"
                            ) : msg.type === "image" ? (
                              <img
                                src={getMediaUrl(msg.content)}
                                alt="Media"
                                onClick={() => setZoomedImage(getMediaUrl(msg.content))}
                                className="max-w-[180px] max-h-[140px] rounded-lg cursor-pointer object-cover hover:scale-102 transition-transform shadow-sm"
                              />
                            ) : msg.type === "video" ? (
                              <video
                                src={getMediaUrl(msg.content)}
                                controls
                                className="max-w-[180px] max-h-[140px] rounded-lg shadow-sm"
                              />
                            ) : (
                              msg.content
                            )}
                          </div>

                          {/* Hover Action Bar (Right of bubble if Not Me) */}
                          {!isMe && !isDeleted && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => setReplyingTo(msg)}
                                title="Phản hồi"
                                className="p-1 rounded-full text-slate-500 hover:text-slate-700 bg-white/80 hover:bg-white shadow-sm transition-all"
                              >
                                <CornerUpLeft size={12} />
                              </button>
                              <button
                                onClick={() => handleCopyMessage(msg.content)}
                                title="Sao chép"
                                className="p-1 rounded-full text-slate-500 hover:text-slate-700 bg-white/80 hover:bg-white shadow-sm transition-all"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Time / Seen status */}
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-tight px-1 drop-shadow-sm">
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {isMe && !isDeleted && (
                            <span>
                              •{" "}
                              {msg.status === "sending"
                                ? "Đang gửi"
                                : msg.status === "failed"
                                ? "Lỗi"
                                : msg.status === "seen"
                                ? "Đã xem"
                                : "Đã gửi"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Uploading Files Preview in Messages */}
                  {uploadingFiles.map((file) => (
                    <div key={file.id} className="flex flex-col gap-1 items-end">
                      <div className="relative rounded-2xl p-2 border border-slate-100 bg-white shadow-sm flex flex-col gap-2 max-w-[200px]">
                        {file.type === "image" ? (
                          <img src={file.previewUrl} className="w-24 h-24 object-cover rounded-lg" alt="Preview" />
                        ) : (
                          <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Play className="w-6 h-6 text-slate-400" />
                          </div>
                        )}

                        {/* Loading details */}
                        <div className="w-full">
                          {file.status === "uploading" ? (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] font-bold text-slate-500">
                                <span>Đang tải lên</span>
                                <span>{file.progress}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                <div
                                  className={cn("h-full transition-all", activeTheme.bg)}
                                  style={{ width: `${file.progress}%` }}
                                />
                              </div>
                            </div>
                          ) : file.status === "failed" ? (
                            <div className="flex items-center justify-between text-[9px] font-bold text-red-500">
                              <span>Lỗi</span>
                              <button
                                onClick={() => handleRetryUpload(file)}
                                className="text-slate-400 hover:text-slate-600"
                              >
                                <RefreshCw size={10} className="animate-spin" />
                              </button>
                            </div>
                          ) : (
                            <div className="text-[9px] font-bold text-green-500">Thành công!</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Opponent Typing Indicator Bubble */}
                  {isOpponentTyping && (
                    <div className="flex gap-2 items-start animate-fade-in self-start max-w-[70%] mt-2 select-none">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 uppercase flex-shrink-0">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col gap-1 items-start">
                        <div className="rounded-2xl px-4 py-2.5 bg-slate-100 flex items-center gap-1 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Floating Emoji Picker Overlay */}
          {showEmojiPicker && (
            <div className="absolute bottom-[56px] left-3 right-3 bg-white border border-slate-200/80 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] p-3 z-50 flex flex-col h-[180px] backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200">
              <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
                <input
                  type="text"
                  placeholder="Tìm biểu tượng..."
                  className="flex-1 text-xs bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 outline-none focus:bg-white"
                  value={emojiSearch}
                  onChange={(e) => setEmojiSearch(e.target.value)}
                />
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto grid grid-cols-7 gap-1.5 p-1 select-none">
                {filteredEmojis.map((e) => (
                  <button
                    key={e.emoji}
                    onClick={() => {
                      setText((prev) => prev + e.emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="text-xl p-1 rounded-lg hover:bg-slate-100 transition-colors active:scale-90"
                  >
                    {e.emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Replying Block UI */}
          {replyingTo && (
            <div className="px-3.5 py-1.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 gap-2 shrink-0 select-none">
              <div className="flex items-center gap-1.5 truncate">
                <CornerUpLeft size={12} className={activeTheme.text} />
                <span className="truncate">
                  Đang phản hồi <span className="font-bold">{getParticipantNickname(replyingTo.sender_id)}</span>:{" "}
                  <span className="italic">
                    {replyingTo.type === "text" ? replyingTo.content : `[${replyingTo.type}]`}
                  </span>
                </span>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-slate-400 hover:text-slate-600 flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Input Box */}
          <div className="p-3 border-t border-slate-100 bg-white flex items-center gap-2 shrink-0">
            {/* Multimedia upload trigger */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors flex-shrink-0"
            >
              <ImageIcon size={18} />
            </button>

            {/* Emoji Picker trigger */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors flex-shrink-0"
            >
              <Smile size={18} />
            </button>

            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              className={cn(
                "flex-1 h-9 bg-slate-50 rounded-xl px-3 text-[13px] outline-none border border-transparent focus:bg-white transition-all placeholder:text-slate-400 text-slate-700 font-bold",
                activeTheme.borderInput
              )}
              value={text}
              onChange={(e) => {
                const val = e.target.value;
                setText(val);
                if (socket && conversationId) {
                  if (!isCurrentlyTypingRef.current) {
                    isCurrentlyTypingRef.current = true;
                    socket.emit("typing_start", { conversation_id: conversationId });
                  }
                  if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                  }
                  typingTimeoutRef.current = setTimeout(() => {
                    isCurrentlyTypingRef.current = false;
                    socket.emit("typing_stop", { conversation_id: conversationId });
                  }, 2500);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && text.trim()) {
                  handleSendMessage();
                }
              }}
            />

            {/* Send Button or Quick Reaction emoji button */}
            {text.trim() ? (
              <button
                onClick={() => handleSendMessage()}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow-lg text-white",
                  activeTheme.bg
                )}
              >
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSendMainEmoji}
                className="text-2xl hover:scale-110 active:scale-95 transition-transform flex-shrink-0 p-1 select-none"
              >
                {mainEmoji}
              </button>
            )}
          </div>
        </>
      )}

      {/* Full-screen Zoom Image Modal */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <img
            src={zoomedImage}
            alt="Zoomed"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl select-none"
          />
        </div>
      )}
    </div>
  );
}
