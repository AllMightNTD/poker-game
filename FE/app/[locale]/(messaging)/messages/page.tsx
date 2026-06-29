"use client";

import { useSocket } from "@/components/providers/SocketProvider";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import {
  Search,
  Send,
  Smile,
  Image as ImageIcon,
  MoreVertical,
  ArrowLeft,
  Settings,
  Trash2,
  Copy,
  Plus,
  Phone,
  Video,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  ExternalLink,
  Loader2,
  FileText,
  AlertCircle,
  Eye,
  CornerUpLeft,
  Pin,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

// Types matching system standard
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

interface Participant {
  user_id: string;
  nickname: string | null;
  role: string;
  user?: {
    id: string;
    email: string;
    profile?: {
      full_name: string;
      avatar_url: string;
      username: string;
    };
  };
}

interface Conversation {
  id: string;
  type: string;
  theme_color: keyof typeof THEME_MAP;
  emoji: string;
  background_image: string;
  created_at: string;
  updated_at: string;
  unreadCount?: number;
  last_message?: ChatMessage | null;
  otherParticipants?: Participant[];
  participants: Participant[];
  is_pinned?: boolean;
}

const THEME_MAP = {
  blue: {
    bg: "bg-blue-600",
    text: "text-blue-600",
    border: "border-blue-200",
    hover: "hover:bg-blue-50",
    fill: "bg-blue-50",
    bubbleMe: "bg-blue-600 text-white rounded-tr-none shadow-sm",
    borderInput: "focus:border-blue-300 focus:ring-blue-100",
  },
  purple: {
    bg: "bg-purple-600",
    text: "text-purple-600",
    border: "border-purple-200",
    hover: "hover:bg-purple-50",
    fill: "bg-purple-50",
    bubbleMe: "bg-purple-600 text-white rounded-tr-none shadow-sm",
    borderInput: "focus:border-purple-300 focus:ring-purple-100",
  },
  pink: {
    bg: "bg-pink-600",
    text: "text-pink-600",
    border: "border-pink-200",
    hover: "hover:bg-pink-50",
    fill: "bg-pink-50",
    bubbleMe: "bg-pink-600 text-white rounded-tr-none shadow-sm",
    borderInput: "focus:border-pink-300 focus:ring-pink-100",
  },
  green: {
    bg: "bg-emerald-600",
    text: "text-emerald-600",
    border: "border-emerald-200",
    hover: "hover:bg-emerald-50",
    fill: "bg-emerald-50",
    bubbleMe: "bg-emerald-600 text-white rounded-tr-none shadow-sm",
    borderInput: "focus:border-emerald-300 focus:ring-emerald-100",
  },
  orange: {
    bg: "bg-amber-600",
    text: "text-amber-600",
    border: "border-amber-200",
    hover: "hover:bg-amber-50",
    fill: "bg-amber-50",
    bubbleMe: "bg-amber-600 text-white rounded-tr-none shadow-sm",
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

const EMOJI_LIST = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🙏", "✨", "🚀", "🎉"];

const getMediaUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
  return `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function MessagesPage({ currentUser }: { currentUser: any }) {
  const router = useRouter();
  const { socket, isConnected } = useSocket();

  // Route layouts
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'group'>('all');
  
  // UI states
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  // Customize Menu Toggles
  const [showThemeSelect, setShowThemeSelect] = useState(false);
  const [showEmojiSelect, setShowEmojiSelect] = useState(false);
  const [showWallpaperSelect, setShowWallpaperSelect] = useState(false);
  const [showNicknameSelect, setShowNicknameSelect] = useState(false);
  
  // Privacy & Blocker states
  const [isActiveStatus, setIsActiveStatus] = useState(currentUser?.is_active_status !== false);
  const [messagePermission, setMessagePermission] = useState(currentUser?.message_permission || "everyone");
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showBlockedUsersList, setShowBlockedUsersList] = useState(false);
  
  // Nickname values
  const [myNicknameInput, setMyNicknameInput] = useState("");
  const [friendNicknameInput, setFriendNicknameInput] = useState("");
 
  // Shared Media gallery
  const [sharedMedia, setSharedMedia] = useState<ChatMessage[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
 
  // Input message state
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wallpaperInputRef = useRef<HTMLInputElement>(null);
 
  // Typing state
  const [isOpponentTyping, setIsOpponentTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCurrentlyTypingRef = useRef(false);
 
  // Pagination for messages
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
 
  // Media Upload Context
  const { uploadingFiles, handleFileChange, handleRetry, clearFile } = useMediaUpload({
    conversationId: activeConv?.id || null,
    socket,
    replyToId: replyingTo?.id,
  });
 
  const activeTheme = activeConv ? THEME_MAP[activeConv.theme_color] || THEME_MAP.blue : THEME_MAP.blue;
 
  // ---------------------------------------------------------------------------
  // Load initial data
  // ---------------------------------------------------------------------------
  const fetchConversations = useCallback(async (search = "", tabOverride?: 'all' | 'unread' | 'group') => {
    setLoadingConvs(true);
    try {
      const res = await api.get("/api/v1/chat/conversations", {
        params: { page: 1, limit: 50, search, tab: tabOverride || activeTab },
      });
      setConversations(res.data?.data || []);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoadingConvs(false);
    }
  }, [activeTab]);
 
  const fetchFriends = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/friend/list");
      setFriends(res.data?.data || []);
    } catch (error) {
      console.error("Failed to load friends:", error);
    }
  }, []);

  const fetchBlockedUsers = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/user/block");
      setBlockedUsers(res.data || []);
    } catch (err) {
      console.error("Failed to load blocked users:", err);
    }
  }, []);
 
  useEffect(() => {
    fetchConversations("", activeTab);
    fetchFriends();
    fetchBlockedUsers();
  }, [fetchConversations, fetchFriends, fetchBlockedUsers]);
 
  // Debounced search
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchConversations(searchQuery, activeTab);
    }, 400);
    return () => clearTimeout(delay);
  }, [searchQuery, activeTab, fetchConversations]);
 
  // Switch tab instantly
  useEffect(() => {
    fetchConversations(searchQuery, activeTab);
  }, [activeTab]);

  const handleTogglePin = async (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation();
    const currentlyPinned = !!conv.is_pinned;
    try {
      await api.post(`/api/v1/chat/conversations/${conv.id}/${currentlyPinned ? 'unpin' : 'pin'}`);
      setConversations(prev =>
        prev.map(c => (c.id === conv.id ? { ...c, is_pinned: !currentlyPinned } : c))
      );
      fetchConversations(searchQuery, activeTab);
    } catch (err) {
      console.error("Failed to toggle pin:", err);
    }
  };

  const handleToggleActiveStatus = async (checked: boolean) => {
    try {
      await api.put("/api/v1/user/presence", { is_active_status: checked });
      setIsActiveStatus(checked);
      if (socket) {
        socket.emit("change_visibility", { is_invisible: !checked });
      }
    } catch (err) {
      console.error("Failed to toggle active status:", err);
    }
  };

  const handleUpdateMessagePermission = async (val: string) => {
    try {
      await api.put("/api/v1/user/message-permission", { message_permission: val });
      setMessagePermission(val);
    } catch (err) {
      console.error("Failed to update message permission:", err);
    }
  };

  const handleBlockUser = async (targetUserId: string) => {
    if (!confirm("Bạn có chắc muốn chặn người này không? Tin nhắn của họ sẽ bị tạm ẩn và họ không thể nhắn tin trực tiếp cho bạn nữa.")) return;
    try {
      await api.post(`/api/v1/user/block/${targetUserId}`, { reason: "Blocked from Chat UI" });
      fetchBlockedUsers();
      fetchConversations(searchQuery, activeTab);
      setActiveConv(null);
    } catch (err) {
      console.error("Failed to block user:", err);
    }
  };

  const handleUnblockUser = async (targetUserId: string) => {
    try {
      await api.delete(`/api/v1/user/block/${targetUserId}`);
      fetchBlockedUsers();
      fetchConversations(searchQuery, activeTab);
    } catch (err) {
      console.error("Failed to unblock user:", err);
    }
  };

  // ---------------------------------------------------------------------------
  // Conversation actions
  // ---------------------------------------------------------------------------
  const selectConversation = async (conv: Conversation) => {
    setActiveConv(conv);
    setMessages([]);
    setPage(1);
    setHasMoreMessages(true);
    setReplyingTo(null);
    setIsOpponentTyping(false);
    
    // Reset customize states
    setShowThemeSelect(false);
    setShowEmojiSelect(false);
    setShowWallpaperSelect(false);
    setShowNicknameSelect(false);

    const myP = conv.participants.find((p) => p.user_id === currentUser?.id);
    const friendP = conv.participants.find((p) => p.user_id !== currentUser?.id);
    setMyNicknameInput(myP?.nickname || "");
    setFriendNicknameInput(friendP?.nickname || "");

    // Fetch messages
    setLoadingMessages(true);
    try {
      const res = await api.get(`/api/v1/chat/messages/${conv.id}`, {
        params: { page: 1, limit: 20 },
      });
      setMessages(res.data?.data || []);
      setHasMoreMessages((res.data?.data || []).length === 20);
      
      // Auto seen receipt
      if (socket && res.data?.data?.length > 0) {
        const lastMsg = res.data.data[res.data.data.length - 1];
        if (lastMsg.sender_id !== currentUser?.id) {
          socket.emit("seenMessage", { conversation_id: conv.id, message_id: lastMsg.id });
        }
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoadingMessages(false);
    }

    // Fetch shared media
    setLoadingMedia(true);
    try {
      const mediaRes = await api.get(`/api/v1/chat/conversations/${conv.id}/media`, {
        params: { page: 1, limit: 30 },
      });
      setSharedMedia(mediaRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load shared media:", err);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleStartChatWithFriend = async (friendId: string) => {
    try {
      const res = await api.get(`/api/v1/chat/conversation/${friendId}`);
      const convId = res.data.conversation_id;
      
      // Refresh conversation list and auto-select
      const convRes = await api.get("/api/v1/chat/conversations");
      const list = convRes.data?.data || [];
      setConversations(list);
      
      const found = list.find((c: any) => c.id === convId);
      if (found) {
        selectConversation(found);
      }
    } catch (err) {
      console.error("Failed to start chat:", err);
    }
  };

  // Load more messages on scroll up
  const loadMoreMessages = async () => {
    if (!activeConv || loadingMessages || !hasMoreMessages) return;
    setLoadingMessages(true);
    const nextPage = page + 1;
    try {
      const res = await api.get(`/api/v1/chat/messages/${activeConv.id}`, {
        params: { page: nextPage, limit: 20 },
      });
      const newMsgs = res.data?.data || [];
      if (newMsgs.length > 0) {
        setMessages((prev) => [...newMsgs, ...prev]);
        setPage(nextPage);
        setHasMoreMessages(newMsgs.length === 20);
      } else {
        setHasMoreMessages(false);
      }
    } catch (err) {
      console.error("Failed to load more messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Sockets coordination & Realtime Listeners
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: ChatMessage) => {
      // Check if this belongs to our active conversation
      if (activeConv && message.conversation_id === activeConv.id) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === message.id)) return prev;
          return [...prev, { ...message, status: "sent" }];
        });

        // Trigger seen receipt
        if (message.sender_id !== currentUser?.id) {
          socket.emit("seenMessage", { conversation_id: activeConv.id, message_id: message.id });
        }
      }

      // Refresh sidebar list to update preview, bold text, and unreadCount
      fetchConversations(searchQuery);
    };

    const handleMessageSent = (message: ChatMessage) => {
      if (activeConv && message.conversation_id === activeConv.id) {
        setMessages((prev) => {
          // Dedup by ID
          if (prev.find((m) => m.id === message.id)) return prev;
          // Replace optimistic message
          const idx = prev.findIndex((m) => m.status === "sending" && m.content === message.content);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = { ...message, status: "sent" };
            return updated;
          }
          return [...prev, { ...message, status: "sent" }];
        });
      }
    };

    const handleMessageSeen = (data: { user_id: string; conversation_id: string; message_id: string }) => {
      if (activeConv && data.conversation_id === activeConv.id) {
        setMessages((prev) =>
          prev.map((m) => (m.id === data.message_id ? { ...m, status: "seen" as const } : m))
        );
      }
    };

    const handleTypingStart = (data: { conversation_id: string; user_id: string }) => {
      if (activeConv && data.conversation_id === activeConv.id && data.user_id !== currentUser?.id) {
        setIsOpponentTyping(true);
      }
    };

    const handleTypingStop = (data: { conversation_id: string; user_id: string }) => {
      if (activeConv && data.conversation_id === activeConv.id && data.user_id !== currentUser?.id) {
        setIsOpponentTyping(false);
      }
    };

    // Chat customization listeners
    const handleThemeChanged = (data: { conversation_id: string; theme_color: string }) => {
      if (activeConv && data.conversation_id === activeConv.id) {
        setActiveConv((prev) => prev ? { ...prev, theme_color: data.theme_color as keyof typeof THEME_MAP } : null);
      }
      fetchConversations(searchQuery);
    };

    const handleEmojiChanged = (data: { conversation_id: string; emoji: string }) => {
      if (activeConv && data.conversation_id === activeConv.id) {
        setActiveConv((prev) => prev ? { ...prev, emoji: data.emoji } : null);
      }
    };

    const handleWallpaperChanged = (data: { conversation_id: string; background_image: string }) => {
      if (activeConv && data.conversation_id === activeConv.id) {
        setActiveConv((prev) => prev ? { ...prev, background_image: data.background_image } : null);
      }
    };

    const handleNicknameChanged = (data: { conversation_id: string; target_user_id: string; nickname: string }) => {
      if (activeConv && data.conversation_id === activeConv.id) {
        setActiveConv((prev) => {
          if (!prev) return null;
          const updatedParts = prev.participants.map((p) => 
            p.user_id === data.target_user_id ? { ...p, nickname: data.nickname || null } : p
          );
          return { ...prev, participants: updatedParts };
        });
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageSent", handleMessageSent);
    socket.on("messageSeen", handleMessageSeen);
    socket.on("user_typing_start", handleTypingStart);
    socket.on("user_typing_stop", handleTypingStop);
    socket.on("themeColorChanged", handleThemeChanged);
    socket.on("mainEmojiChanged", handleEmojiChanged);
    socket.on("backgroundImageChanged", handleWallpaperChanged);
    socket.on("nicknameChanged", handleNicknameChanged);

    if (activeConv) {
      socket.emit("joinConversation", { conversation_id: activeConv.id });
    }

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageSent", handleMessageSent);
      socket.off("messageSeen", handleMessageSeen);
      socket.off("user_typing_start", handleTypingStart);
      socket.off("user_typing_stop", handleTypingStop);
      socket.off("themeColorChanged", handleThemeChanged);
      socket.off("mainEmojiChanged", handleEmojiChanged);
      socket.off("backgroundImageChanged", handleWallpaperChanged);
      socket.off("nicknameChanged", handleNicknameChanged);
    };
  }, [socket, activeConv, currentUser?.id, fetchConversations, searchQuery]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, uploadingFiles]);

  // ---------------------------------------------------------------------------
  // Message operations
  // ---------------------------------------------------------------------------
  const handleSendMessage = (customText?: string) => {
    const contentToSend = customText !== undefined ? customText : text;
    if (!contentToSend.trim() || !socket || !activeConv) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    isCurrentlyTypingRef.current = false;
    socket.emit("typing_stop", { conversation_id: activeConv.id });

    const tempId = "temp-" + Date.now();
    const optimisticMsg: ChatMessage = {
      id: tempId,
      sender_id: currentUser?.id || "",
      content: contentToSend,
      created_at: new Date().toISOString(),
      type: "text",
      conversation_id: activeConv.id,
      status: "sending",
      reply_to: replyingTo || undefined,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    const payload = {
      conversation_id: activeConv.id,
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

  const handleSendMainEmoji = () => {
    if (activeConv) {
      handleSendMessage(activeConv.emoji || "👍");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);

    if (!socket || !activeConv) return;

    if (!isCurrentlyTypingRef.current) {
      isCurrentlyTypingRef.current = true;
      socket.emit("typing_start", { conversation_id: activeConv.id });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      isCurrentlyTypingRef.current = false;
      socket.emit("typing_stop", { conversation_id: activeConv.id });
    }, 2000);
  };

  // Custom theme selector
  const handleSelectTheme = (color: keyof typeof THEME_MAP) => {
    if (!socket || !activeConv) return;
    socket.emit("changeThemeColor", { conversation_id: activeConv.id, theme_color: color });
  };

  // Custom quick reaction emoji
  const handleSelectEmoji = (emo: string) => {
    if (!socket || !activeConv) return;
    socket.emit("changeMainEmoji", { conversation_id: activeConv.id, emoji: emo });
  };

  // Custom background wallpaper selector
  const handleSelectWallpaper = (bgValue: string) => {
    if (!socket || !activeConv) return;
    socket.emit("changeBackgroundImage", { conversation_id: activeConv.id, background_image: bgValue });
  };

  const handleCustomWallpaperUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeConv || !socket) return;
    const file = files[0];

    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh nền phải dưới 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("files", file);

    try {
      const res = await api.post("/api/v1/chat/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const fileUrl = res.data.metadata[0].file_url;
      socket.emit("changeBackgroundImage", { conversation_id: activeConv.id, background_image: fileUrl });
    } catch (err) {
      console.error("Wallpaper upload failed", err);
      alert("Không thể tải lên ảnh nền");
    }
  };

  const handleSaveNickname = (targetUserId: string, nicknameValue: string) => {
    if (!socket || !activeConv) return;
    socket.emit("changeNickname", {
      conversation_id: activeConv.id,
      target_user_id: targetUserId,
      nickname: nicknameValue.trim(),
    });
  };

  const handleLeaveActiveConversation = async () => {
    if (!activeConv) return;
    if (!confirm("Bạn có chắc chắn muốn rời cuộc hội thoại này không?")) return;
    try {
      await api.delete(`/api/v1/chat/conversations/${activeConv.id}/leave`);
      setActiveConv(null);
      fetchConversations();
    } catch (err) {
      console.error("Failed to leave conversation:", err);
    }
  };

  // Helper getters
  const getParticipantNickname = (userId: string) => {
    if (!activeConv) return "Bạn";
    const p = activeConv.participants.find((part) => part.user_id === userId);
    if (p && p.nickname) return p.nickname;
    if (userId === currentUser?.id) return "Bạn";
    
    // Find the other participant's profile name
    const other = activeConv.participants.find((part) => part.user_id === userId);
    return other?.user?.profile?.full_name || other?.user?.email || "Người dùng";
  };

  const getChatBackgroundStyle = () => {
    if (!activeConv?.background_image) return {};
    const bg = activeConv.background_image;
    if (
      bg.startsWith("linear-gradient") ||
      bg.startsWith("radial-gradient") ||
      bg.startsWith("repeating-linear-gradient")
    ) {
      return { background: bg };
    }
    return {
      backgroundImage: `url(${getMediaUrl(bg)})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  };

  const getConversationDisplayName = (conv: Conversation) => {
    const others = conv.participants.filter((p) => p.user_id !== currentUser?.id);
    if (others.length === 0) return "Chỉ mình bạn";
    const primaryOther = others[0];
    const nickname = conv.participants.find(p => p.user_id === primaryOther.user_id)?.nickname;
    return nickname || primaryOther.user?.profile?.full_name || primaryOther.user?.email || "Trò chuyện";
  };

  const getConversationDisplayAvatar = (conv: Conversation) => {
    const others = conv.participants.filter((p) => p.user_id !== currentUser?.id);
    if (others.length === 0) return "https://ui-avatars.com/api/?name=You";
    const avatarUrl = others[0].user?.profile?.avatar_url;
    return avatarUrl ? getMediaUrl(avatarUrl) : "https://ui-avatars.com/api/?name=" + getConversationDisplayName(conv);
  };

  const isFriendOnline = (friend: any) => {
    return friend.friend_user?.presence?.status === "online" && !friend.friend_user?.presence?.is_invisible;
  };

  return (
    <div className="flex w-full h-full bg-white overflow-hidden relative">
      {/* -----------------------------------------------------------------------
          COLUMN 1: SIDEBAR (Chat list & search)
          ----------------------------------------------------------------------- */}
      <div
        className={cn(
          "w-full md:w-[320px] lg:w-[360px] border-r border-slate-100 flex flex-col shrink-0 transition-all duration-300 bg-white",
          activeConv ? "hidden md:flex" : "flex"
        )}
      >
        <div className="p-4 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black tracking-tight text-slate-800">Chats</h1>
            <button
              onClick={() => fetchConversations()}
              className="p-2 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm người nhắn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/75 focus:bg-white text-sm rounded-2xl outline-none border border-transparent focus:border-slate-200 focus:ring-4 focus:ring-slate-50 transition-all font-medium text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Tabs classification */}
          <div className="flex bg-slate-100/80 p-1 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold rounded-xl transition-all",
                activeTab === "all"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold rounded-xl transition-all relative",
                activeTab === "unread"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              Chưa đọc
              {conversations.some(c => c.unreadCount && c.unreadCount > 0) && (
                <span className="absolute top-1 right-1.5 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("group")}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold rounded-xl transition-all",
                activeTab === "group"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              Nhóm
            </button>
          </div>
        </div>

        {/* Horizontal Active Friends Row */}
        {friends.length > 0 && (
          <div className="px-4 pb-3 overflow-x-auto flex gap-3 scrollbar-none shrink-0 border-b border-slate-50">
            {friends.map((fr) => {
              const profile = fr.friend_user?.profile;
              const online = isFriendOnline(fr);
              const displayName = profile?.full_name || fr.friend_user?.email || "Bạn bè";
              const avatar = profile?.avatar_url ? getMediaUrl(profile.avatar_url) : `https://ui-avatars.com/api/?name=${displayName}`;

              return (
                <button
                  key={fr.id}
                  onClick={() => handleStartChatWithFriend(fr.friend_user_id)}
                  className="flex flex-col items-center gap-1 min-w-[56px] text-center hover:scale-105 active:scale-95 transition-transform"
                >
                  <div className="relative">
                    <img
                      src={avatar}
                      alt={displayName}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100/70"
                    />
                    {online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 truncate w-14">
                    {displayName.split(" ").pop()}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50 p-2 space-y-1">
          {loadingConvs ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 p-6 text-center">
              <AlertCircle size={28} className="text-slate-300" />
              <p className="text-xs font-bold">Chưa có cuộc hội thoại nào.</p>
              <p className="text-[10px]">Hãy chọn một người bạn ở trên để bắt đầu nhắn tin nhé!</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const active = activeConv?.id === conv.id;
              const displayName = getConversationDisplayName(conv);
              const avatar = getConversationDisplayAvatar(conv);
              const hasUnread = conv.unreadCount && conv.unreadCount > 0;
              const snippet = conv.last_message?.content || "Chưa có tin nhắn";
              const time = conv.last_message
                ? new Date(conv.last_message.created_at).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left group relative",
                    active
                      ? "bg-blue-50/70 shadow-sm border border-blue-100/30"
                      : "hover:bg-slate-50 border border-transparent"
                  )}
                >
                  <div className="relative shrink-0">
                    <img src={avatar} alt={displayName} className="w-12 h-12 rounded-full object-cover" />
                    {conv.participants.some((p) => p.user_id !== currentUser?.id && friends.some(fr => fr.friend_user_id === p.user_id && isFriendOnline(fr))) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn("text-sm font-bold truncate", hasUnread ? "text-slate-900" : "text-slate-700")}>
                        {displayName}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-slate-400 font-semibold ml-1">{time}</span>
                        {conv.is_pinned && (
                          <Pin size={11} className="text-blue-500 fill-blue-500 rotate-45 shrink-0" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <p className={cn("text-xs truncate flex-1", hasUnread ? "text-slate-900 font-extrabold" : "text-slate-400 font-medium")}>
                        {conv.last_message?.sender_id === currentUser?.id && "Bạn: "}{snippet}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => handleTogglePin(e, conv)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-blue-500 transition-all shrink-0"
                          title={conv.is_pinned ? "Bỏ ghim" : "Ghim cuộc hội thoại"}
                        >
                          <Pin size={12} className={cn(conv.is_pinned && "text-blue-500 fill-blue-500")} />
                        </button>
                        {hasUnread && (
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* -----------------------------------------------------------------------
          COLUMN 2: CENTRAL ACTIVE CHAT STREAM
          ----------------------------------------------------------------------- */}
      <div className={cn("flex-1 flex flex-col h-full bg-slate-50 min-w-0", !activeConv && "hidden md:flex")}>
        {activeConv ? (
          <>
            {/* Header */}
            <div className="h-14 border-b border-slate-100 bg-white px-4 flex items-center justify-between shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setActiveConv(null)}
                  className="md:hidden p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 shrink-0"
                >
                  <ArrowLeft size={20} />
                </button>
                <img
                  src={getConversationDisplayAvatar(activeConv)}
                  alt={getConversationDisplayName(activeConv)}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0 flex flex-col">
                  <span className="text-sm font-black text-slate-800 leading-none truncate">
                    {getConversationDisplayName(activeConv)}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 font-bold">
                    {isConnected ? "Đang trực tuyến" : "Mất kết nối..."}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors hidden sm:block">
                  <Phone size={18} />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors hidden sm:block">
                  <Video size={18} />
                </button>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className={cn(
                    "p-2 rounded-xl transition-colors",
                    showDetails ? activeTheme.text + " " + activeTheme.fill : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Info size={18} />
                </button>
              </div>
            </div>

            {/* Message stream */}
            <div
              ref={scrollRef}
              style={getChatBackgroundStyle()}
              className={cn("flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth relative", !activeConv.background_image && "bg-slate-50/50")}
            >
              {activeConv.background_image && !activeConv.background_image.includes("-gradient") && (
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] pointer-events-none z-0" />
              )}

              <div className="relative z-10 space-y-4">
                {/* Pagination historical loader */}
                {hasMoreMessages && (
                  <div className="flex justify-center">
                    <button
                      onClick={loadMoreMessages}
                      disabled={loadingMessages}
                      className={cn(
                        "text-[10px] font-black px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-transform flex items-center gap-1",
                        activeTheme.text
                      )}
                    >
                      {loadingMessages ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Tải tin nhắn cũ hơn..."
                      )}
                    </button>
                  </div>
                )}

                {messages.map((msg) => {
                  const isMe = msg.sender_id === currentUser?.id;
                  const isDeleted = msg.type === "system" && msg.content === "Tin nhắn đã bị thu hồi";

                  return (
                    <div
                      key={msg.id}
                      className={cn("flex flex-col gap-1 group/msg relative", isMe ? "items-end" : "items-start")}
                    >
                      {/* Name tags for others in group/chat */}
                      {!isMe && (
                        <span className="text-[9px] text-slate-400 font-bold ml-1">
                          {getParticipantNickname(msg.sender_id)}
                        </span>
                      )}

                      {/* Reply message preview context */}
                      {msg.reply_to && (
                        <div
                          className={cn(
                            "text-[10px] px-2.5 py-1 rounded-t-xl opacity-75 max-w-[70%] border-x border-t flex items-center gap-1 shadow-sm",
                            isMe ? "bg-slate-100 text-slate-500 border-slate-200" : "bg-white text-slate-500 border-slate-100"
                          )}
                        >
                          <CornerUpLeft size={10} />
                          <span className="font-bold truncate">{msg.reply_to.content}</span>
                        </div>
                      )}

                      {/* Message Bubble Container */}
                      <div className="flex items-center gap-2 max-w-[75%]">
                        {/* Reaction Panel on Hover */}
                        {isMe && (
                          <div className="opacity-0 group-hover/msg:opacity-100 transition-opacity flex items-center gap-1 shrink-0 order-first">
                            <button
                              onClick={() => setReplyingTo(msg)}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white border border-transparent hover:border-slate-100 shadow-sm transition-all"
                              title="Trả lời"
                            >
                              <CornerUpLeft size={12} />
                            </button>
                          </div>
                        )}

                        {/* Bubble */}
                        <div
                          className={cn(
                            "px-4 py-2.5 rounded-2xl text-sm relative break-words whitespace-pre-wrap leading-relaxed shadow-sm",
                            isDeleted
                              ? "bg-slate-100 text-slate-400 italic rounded-br-none border border-slate-200"
                              : isMe
                              ? activeTheme.bubbleMe
                              : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                          )}
                        >
                          {/* Image rendering */}
                          {msg.type === "image" ? (
                            <img
                              src={getMediaUrl(msg.content)}
                              alt="media"
                              className="rounded-lg max-w-[200px] sm:max-w-[260px] object-cover cursor-pointer hover:brightness-95 transition-all shadow-sm"
                              onClick={() => setZoomedImage(getMediaUrl(msg.content))}
                            />
                          ) : msg.type === "video" ? (
                            <video
                              src={getMediaUrl(msg.content)}
                              controls
                              className="rounded-lg max-w-[200px] sm:max-w-[260px] max-h-[200px] shadow-sm"
                            />
                          ) : msg.type === "file" ? (
                            <a
                              href={getMediaUrl(msg.content)}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 text-xs font-bold underline"
                            >
                              <FileText size={16} />
                              {msg.content.split("/").pop()}
                              <ExternalLink size={10} />
                            </a>
                          ) : (
                            msg.content
                          )}
                        </div>

                        {/* Reaction Panel on Hover (for friends messages) */}
                        {!isMe && (
                          <div className="opacity-0 group-hover/msg:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setReplyingTo(msg)}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white border border-transparent hover:border-slate-100 shadow-sm transition-all"
                              title="Trả lời"
                            >
                              <CornerUpLeft size={12} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Message Status indicator / Seen Receipts */}
                      {isMe && msg.status === "seen" && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <span className="text-[8px] font-bold text-slate-400">Đã xem</span>
                          <Check size={8} className="text-blue-500" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Loading uploading files locally indicator */}
                {uploadingFiles.map((uf) => (
                  <div key={uf.id} className="flex flex-col items-end gap-1">
                    <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-2xl rounded-tr-none text-slate-500 text-xs flex flex-col gap-2 max-w-[200px] shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                        <span className="font-bold truncate text-[10px]">{uf.name}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                        <div className="bg-slate-500 h-full transition-all duration-300" style={{ width: `${uf.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing bubble */}
                {isOpponentTyping && (
                  <div className="flex items-center gap-1">
                    <div className="px-4 py-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-300" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input area */}
            <div className="bg-white border-t border-slate-100 p-3 flex flex-col gap-2 shrink-0 z-10 shadow-sm">
              {/* Replying Context Bar */}
              {replyingTo && (
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <CornerUpLeft size={12} />
                    <span>Đang trả lời <b>{getParticipantNickname(replyingTo.sender_id)}</b>:</span>
                    <span className="truncate max-w-[150px] italic">"{replyingTo.content}"</span>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={12} />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shrink-0"
                >
                  <ImageIcon size={20} />
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Aa"
                    value={text}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="w-full bg-slate-50 hover:bg-slate-100/75 focus:bg-white text-sm rounded-2xl px-4 py-2.5 outline-none border border-transparent focus:border-slate-200 focus:ring-4 focus:ring-slate-50 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                {text.trim() ? (
                  <button
                    onClick={() => handleSendMessage()}
                    className={cn(
                      "p-2.5 text-white rounded-xl shadow-md transition-all shrink-0 hover:scale-105 active:scale-95",
                      activeTheme.bg
                    )}
                  >
                    <Send size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleSendMainEmoji}
                    className="text-2xl hover:scale-110 active:scale-90 transition-transform shrink-0"
                  >
                    {activeConv.emoji || "👍"}
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 p-6 text-center">
            <div className="p-4 bg-white border border-slate-100 shadow-sm rounded-3xl mb-4 animate-bounce">
              <Smile size={48} className="text-blue-500" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-black text-slate-700">Chào mừng bạn đến với Hộp thư</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
              Hãy chọn một cuộc hội thoại từ danh sách bên trái hoặc nhắn tin cho bạn bè để bắt đầu trò chuyện ngay!
            </p>
          </div>
        )}
      </div>

      {/* -----------------------------------------------------------------------
          COLUMN 3: DETAILS SIDEBAR (Customize & Gallery)
          ----------------------------------------------------------------------- */}
      {activeConv && showDetails && (
        <div
          className={cn(
            "fixed inset-y-0 right-0 z-20 w-80 bg-white border-l border-slate-100 shadow-xl flex flex-col transition-all duration-300 md:static md:shadow-none shrink-0 h-full",
            showDetails ? "translate-x-0" : "translate-x-full md:hidden"
          )}
        >
          {/* Header */}
          <div className="h-14 border-b border-slate-100 px-4 flex items-center justify-between shrink-0">
            <span className="text-sm font-black text-slate-800">Thông tin chi tiết</span>
            <button
              onClick={() => setShowDetails(false)}
              className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Quick Profile */}
            <div className="flex flex-col items-center text-center space-y-2">
              <img
                src={getConversationDisplayAvatar(activeConv)}
                alt={getConversationDisplayName(activeConv)}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-100"
              />
              <span className="text-base font-black text-slate-800 leading-none block">
                {getConversationDisplayName(activeConv)}
              </span>
              <span className="text-[10px] text-slate-400 font-bold block bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                Chat cá nhân 1-1
              </span>
            </div>

            {/* Customization Expandable Options */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase mb-3">Tùy chỉnh đoạn chat</h3>

              {/* Theme Color selector */}
              <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/30">
                <button
                  onClick={() => setShowThemeSelect(!showThemeSelect)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 text-left transition-colors"
                >
                  <span className="text-xs font-bold text-slate-700">Màu chủ đề</span>
                  {showThemeSelect ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                </button>
                {showThemeSelect && (
                  <div className="p-3 bg-white border-t border-slate-50 flex gap-2.5 flex-wrap justify-start">
                    {(Object.keys(THEME_MAP) as Array<keyof typeof THEME_MAP>).map((colorKey) => (
                      <button
                        key={colorKey}
                        onClick={() => handleSelectTheme(colorKey)}
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center ring-offset-2 ring-slate-100 transition-transform active:scale-90",
                          colorKey === "blue" && "bg-blue-600",
                          colorKey === "purple" && "bg-purple-600",
                          colorKey === "pink" && "bg-pink-600",
                          colorKey === "green" && "bg-emerald-600",
                          colorKey === "orange" && "bg-amber-600",
                          activeConv.theme_color === colorKey && "ring-2 ring-slate-400"
                        )}
                      >
                        {activeConv.theme_color === colorKey && <Check size={14} className="text-white" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Emoji quick reaction selector */}
              <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/30">
                <button
                  onClick={() => setShowEmojiSelect(!showEmojiSelect)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 text-left transition-colors"
                >
                  <span className="text-xs font-bold text-slate-700">Biểu tượng thả nhanh</span>
                  {showEmojiSelect ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                </button>
                {showEmojiSelect && (
                  <div className="p-3 bg-white border-t border-slate-50 flex gap-2 flex-wrap">
                    {EMOJI_LIST.map((emo) => (
                      <button
                        key={emo}
                        onClick={() => handleSelectEmoji(emo)}
                        className={cn(
                          "text-xl p-2 rounded-xl hover:bg-slate-50 transition-all active:scale-90",
                          activeConv.emoji === emo && "bg-blue-50 ring-1 ring-blue-100"
                        )}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Background selector */}
              <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/30">
                <button
                  onClick={() => setShowWallpaperSelect(!showWallpaperSelect)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 text-left transition-colors"
                >
                  <span className="text-xs font-bold text-slate-700">Hình nền hội thoại</span>
                  {showWallpaperSelect ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                </button>
                {showWallpaperSelect && (
                  <div className="p-3 bg-white border-t border-slate-50 space-y-3">
                    <div className="grid grid-cols-3 gap-1.5">
                      {WALLPAPER_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => handleSelectWallpaper(preset.value)}
                          style={{
                            background: preset.value || "#f8fafc",
                            backgroundSize: preset.id === "dot" ? "10px 10px" : preset.id === "grid" ? "15px 15px" : "cover",
                          }}
                          className={cn(
                            "h-10 rounded-xl border border-slate-200 text-[9px] font-black text-slate-500 flex items-center justify-center transition-transform hover:scale-105 shadow-sm",
                            activeConv.background_image === preset.value && "ring-2 ring-slate-400 border-transparent text-slate-800"
                          )}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                    <input
                      type="file"
                      ref={wallpaperInputRef}
                      accept="image/*"
                      onChange={handleCustomWallpaperUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => wallpaperInputRef.current?.click()}
                      className="w-full border border-dashed border-slate-200 py-2 rounded-xl text-[10px] font-black text-slate-500 hover:text-slate-600 transition-colors flex items-center justify-center gap-1 bg-white shadow-sm"
                    >
                      <ImageIcon size={12} />
                      Tải lên ảnh nền riêng
                    </button>
                  </div>
                )}
              </div>

              {/* Edit nicknames expander */}
              <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/30">
                <button
                  onClick={() => setShowNicknameSelect(!showNicknameSelect)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 text-left transition-colors"
                >
                  <span className="text-xs font-bold text-slate-700">Chỉnh sửa biệt danh</span>
                  {showNicknameSelect ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                </button>
                {showNicknameSelect && (
                  <div className="p-3 bg-white border-t border-slate-50 space-y-4">
                    {activeConv.participants.map((p) => {
                      const isMe = p.user_id === currentUser?.id;
                      const inputVal = isMe ? myNicknameInput : friendNicknameInput;
                      const setInputVal = isMe ? setMyNicknameInput : setFriendNicknameInput;
                      const label = isMe ? "Bạn" : "Đối phương";

                      return (
                        <div key={p.user_id} className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 block">{label}</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="Biệt danh..."
                              value={inputVal}
                              onChange={(e) => setInputVal(e.target.value)}
                              className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-slate-300"
                            />
                            <button
                              onClick={() => handleSaveNickname(p.user_id, inputVal)}
                              className={cn(
                                "text-[10px] font-black px-3.5 py-1.5 text-white rounded-xl shadow-md transition-all hover:scale-105 active:scale-95",
                                activeTheme.bg
                              )}
                            >
                              Lưu
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Privacy & Security Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase mb-3">Quyền riêng tư & Bảo mật</h3>

              {/* Privacy settings expander */}
              <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/30">
                <button
                  onClick={() => setShowPrivacySettings(!showPrivacySettings)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 text-left transition-colors"
                >
                  <span className="text-xs font-bold text-slate-700">Cấu hình riêng tư</span>
                  {showPrivacySettings ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                </button>
                {showPrivacySettings && (
                  <div className="p-3.5 bg-white border-t border-slate-50 space-y-4">
                    {/* Active Status Switch */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Trạng thái hoạt động</span>
                        <span className="text-[10px] text-slate-400 block leading-tight">Cho người khác thấy khi bạn online</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={isActiveStatus}
                          onChange={(e) => handleToggleActiveStatus(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Message Permissions Select */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-50">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Quyền nhận tin nhắn</span>
                        <span className="text-[10px] text-slate-400 block leading-tight">Ai có thể gửi tin nhắn trực tiếp cho bạn</span>
                      </div>
                      <select
                        value={messagePermission}
                        onChange={(e) => handleUpdateMessagePermission(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none bg-slate-50 font-semibold text-slate-700 focus:bg-white transition-colors"
                      >
                        <option value="everyone">Mọi người (Everyone)</option>
                        <option value="friends">Bạn bè (Friends)</option>
                        <option value="followers">Người theo dõi (Followers)</option>
                        <option value="none">Không ai cả (None)</option>
                      </select>
                    </div>

                    {/* Block opponent button if 1-1 chat */}
                    {activeConv.type === "personal" && (
                      <div className="pt-2.5 border-t border-slate-50">
                        {(() => {
                          const opponentParticipant = activeConv.participants.find(p => p.user_id !== currentUser?.id);
                          const opponent = opponentParticipant?.user;
                          if (!opponent) return null;
                          const name = opponent.profile?.full_name || opponent.email || "người dùng";
                          return (
                            <button
                              onClick={() => handleBlockUser(opponent.id)}
                              className="w-full py-2 border border-red-100 hover:bg-red-50 text-red-500 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1 bg-white shadow-sm"
                            >
                              Chặn {name}
                            </button>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Blocked Users List Expandable */}
              <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/30">
                <button
                  onClick={() => setShowBlockedUsersList(!showBlockedUsersList)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 text-left transition-colors"
                >
                  <span className="text-xs font-bold text-slate-700">Danh sách đã chặn</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                    {blockedUsers.length}
                  </span>
                </button>
                {showBlockedUsersList && (
                  <div className="p-3 bg-white border-t border-slate-50 space-y-2 max-h-48 overflow-y-auto">
                    {blockedUsers.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic text-center py-2">Bạn chưa chặn ai.</p>
                    ) : (
                      blockedUsers.map((item) => {
                        const blockedUser = item.blocked_user;
                        if (!blockedUser) return null;
                        const name = blockedUser.profile?.full_name || blockedUser.email || "Người dùng";
                        const blockAvatar = blockedUser.profile?.avatar_url
                          ? getMediaUrl(blockedUser.profile.avatar_url)
                          : `https://ui-avatars.com/api/?name=${name}`;
                        return (
                          <div key={item.id} className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-2 min-w-0">
                              <img src={blockAvatar} alt={name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                              <span className="text-[10px] font-bold text-slate-700 truncate">{name}</span>
                            </div>
                            <button
                              onClick={() => handleUnblockUser(blockedUser.id)}
                              className="text-[9px] font-black text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors shrink-0"
                            >
                              Bỏ chặn
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Shared Media Gallery Grid */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase mb-3">Tệp đa phương tiện</h3>
              
              {loadingMedia ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : sharedMedia.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic">Chưa chia sẻ hình ảnh hoặc video nào.</p>
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  {sharedMedia.map((m) => (
                    <div
                      key={m.id}
                      className="aspect-square bg-slate-50 border border-slate-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 hover:scale-[1.02] transition-all relative group"
                      onClick={() => setZoomedImage(getMediaUrl(m.content))}
                    >
                      {m.type === "image" ? (
                        <img src={getMediaUrl(m.content)} alt="shared" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white">
                          <Video size={16} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye size={14} className="text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={handleLeaveActiveConversation}
                className="w-full py-2.5 border border-red-200 hover:bg-red-50 text-red-500 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Trash2 size={14} />
                Rời cuộc trò chuyện
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          LIGHTBOX MODAL
          ----------------------------------------------------------------------- */}
      {zoomedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-4 right-4 p-2 text-white/75 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <img
            src={zoomedImage}
            alt="media large"
            className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl animate-fade-in"
          />
        </div>
      )}
    </div>
  );
}
