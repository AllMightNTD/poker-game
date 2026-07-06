"use client";

import { useMiniChat } from "@/components/chat/MiniChatContext";
import { useSocket } from "@/components/providers/SocketProvider";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  BellOff,
  Check,
  ChevronDown,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  MessageSquare,
  MoreHorizontal,
  Pin,
  PinOff,
  Search,
  SquarePen,
  Users,
  X
} from "lucide-react";

import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface MessagesPopupProps {
  onClose: () => void;
  currentUser: any;
}

// Interfaces
interface Participant {
  user_id: string;
  nickname: string | null;
  role: string;
  user: {
    id: string;
    email: string;
    profile: {
      full_name: string;
      avatar_url: string | null;
    } | null;
    is_active_status: boolean;
  };
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: string;
  created_at: string;
  sender: {
    id: string;
    profile: {
      full_name: string;
      avatar_url: string | null;
    } | null;
  };
}

interface Conversation {
  id: string;
  name?: string;
  avatar_url?: string;
  type: "direct" | "group";
  theme_color: string | null;
  emoji: string | null;
  background_image: string | null;
  unreadCount: number;
  is_pinned: boolean;
  is_archived: boolean;
  is_hidden: boolean;
  is_spam: boolean;
  is_request: boolean;
  otherParticipants: Participant[];
  last_message: Message | null;
  created_at: string;
}

// Helpers
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function renderPreview(msg: Message | null, currentUserId: string): string {
  if (!msg) return "No messages yet";
  const senderId = msg.sender_id || (msg as any).sender?.id;
  const isMe = Boolean(currentUserId && senderId === currentUserId);
  const prefix = isMe ? "You: " : "";

  if (msg.type === "image") return `${prefix}📷 sent an image`;
  if (msg.type === "video") return `${prefix}🎥 sent a video`;
  if (msg.type === "file") return `${prefix}📁 sent a file`;
  return `${prefix}${msg.content || ""}`;
}

function highlightText(text: string, search: string) {
  if (!search) return <span>{text}</span>;
  const parts = text.split(new RegExp(`(${search})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === search.toLowerCase() ? (
          <mark key={i} className="bg-blue-100 text-blue-600 rounded-[3px] px-0.5 font-semibold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

// Safe Avatar component to prevent broken images
function SafeAvatar({ src, name, isGroup }: { src: string | null; name: string; isGroup: boolean }) {
  const [error, setError] = useState(false);

  const gradientClass = useMemo(() => {
    const colors = [
      "from-blue-400 to-indigo-500",
      "from-purple-400 to-pink-500",
      "from-emerald-400 to-teal-500",
      "from-amber-400 to-orange-500",
      "from-rose-400 to-red-500",
      "from-cyan-400 to-blue-500",
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  }, [name]);

  if (!src || error || src.includes("group-default.png") || src.includes("avatar-default.png")) {
    if (isGroup) {
      return (
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-tr text-white shadow-sm shrink-0", gradientClass)}>
          <Users size={16} />
        </div>
      );
    }
    const char = name.trim().charAt(0).toUpperCase() || "?";
    return (
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-tr text-white shadow-sm shrink-0", gradientClass)}>
        <span className="text-sm font-extrabold">{char}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setError(true)}
      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-50 shrink-0"
    />
  );
}

export default function MessagesPopup({ onClose, currentUser }: MessagesPopupProps) {
  const t = (key: string) => {
    const translations: Record<string, string> = {
      "title": "Messages",
      "openExpand": "Open in full page",
      "newChat": "New chat",
      "markAllAsRead": "Mark all as read",
      "messageRequests": "Message Requests",
      "archive": "Archive",
      "hidden": "Hidden",
      "spam": "Spam",
      "searchPlaceholder": "Search messages...",
      "all": "All",
      "unread": "Unread",
      "group": "Groups",
      "pending": "Pending",
      "archived": "Archived",
      "other": "Other",
    };
    return translations[key] || key;
  };
  const { socket } = useSocket();
  const { openPopup } = useMiniChat();
  const queryClient = useQueryClient();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Tabs state
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'group' | 'request' | 'archived' | 'hidden' | 'spam'>('all');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Search state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Settings Dropdown state
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Context Menu for each conversation
  const [activeMenuConvId, setActiveMenuConvId] = useState<string | null>(null);
  const itemMenuRef = useRef<HTMLDivElement>(null);

  // Online statuses of friends (realtime)
  const [userPresences, setUserPresences] = useState<Record<string, boolean>>({});

  // Realtime typing indicators
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 for new search query
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
      if (itemMenuRef.current && !itemMenuRef.current.contains(event.target as Node)) {
        setActiveMenuConvId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Main fetch function
  const fetchConversations = useCallback(async (pageNum: number, searchVal: string, tabVal: string, isAppend = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await api.get("/api/v1/chat/conversations", {
        params: {
          page: pageNum,
          limit: 15,
          search: searchVal || undefined,
          tab: tabVal !== 'all' ? tabVal : undefined,
        },
      });

      const newList = res.data?.data || [];
      const total = res.data?.total || 0;
      const limit = res.data?.limit || 15;
      const totalPages = Math.ceil(total / limit) || 1;

      // Update online status maps
      const newPresences: Record<string, boolean> = {};
      newList.forEach((conv: Conversation) => {
        if (conv.type === "direct" && conv.otherParticipants[0]) {
          const u = conv.otherParticipants[0].user;
          newPresences[u.id] = u.is_active_status !== false;
        }
      });
      setUserPresences((prev) => ({ ...prev, ...newPresences }));

      if (isAppend) {
        setConversations((prev) => {
          const ids = new Set(prev.map(c => c.id));
          const filteredNewList = newList.filter((c: Conversation) => !ids.has(c.id));
          return [...prev, ...filteredNewList];
        });
      } else {
        setConversations(newList);
      }

      setHasMore(pageNum < totalPages);
    } catch (error) {
      console.error("Failed to fetch conversations in popup:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Fetch when page, search or tab changed
  useEffect(() => {
    fetchConversations(page, debouncedSearch, activeTab, page > 1);
  }, [page, debouncedSearch, activeTab, fetchConversations]);

  // Realtime Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: Message) => {
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === msg.conversation_id);

        if (index !== -1) {
          const updatedList = [...prev];
          const target = { ...updatedList[index] };

          target.last_message = msg;

          const senderId = msg.sender_id || (msg as any).sender?.id;
          if (senderId !== currentUser?.id) {
            target.unreadCount = (target.unreadCount || 0) + 1;
          }

          updatedList[index] = target;

          updatedList.sort((a, b) => {
            const isPinnedA = a.is_pinned ? 1 : 0;
            const isPinnedB = b.is_pinned ? 1 : 0;
            if (isPinnedA !== isPinnedB) return isPinnedB - isPinnedA;

            const timeA = a.last_message ? new Date(a.last_message.created_at).getTime() : new Date(a.created_at).getTime();
            const timeB = b.last_message ? new Date(b.last_message.created_at).getTime() : new Date(b.created_at).getTime();
            return timeB - timeA;
          });

          return updatedList;
        } else {
          fetchConversations(1, debouncedSearch, activeTab, false);
          return prev;
        }
      });
    };

    const handlePresenceChange = (data: { userId: string; status: string }) => {
      setUserPresences((prev) => ({
        ...prev,
        [data.userId]: data.status === "online",
      }));
    };

    const handleTypingStart = (data: { conversation_id: string; user_id: string }) => {
      if (data.user_id === currentUser?.id) return;
      setConversations((prev) => {
        const conv = prev.find(c => c.id === data.conversation_id);
        if (conv) {
          const sender = conv.otherParticipants.find(p => p.user.id === data.user_id);
          const name = sender?.nickname || sender?.user?.profile?.full_name || "Someone";
          setTypingUsers((prevTyping) => ({
            ...prevTyping,
            [data.conversation_id]: name
          }));
        }
        return prev;
      });
    };

    const handleTypingStop = (data: { conversation_id: string; user_id: string }) => {
      setTypingUsers((prevTyping) => {
        const copy = { ...prevTyping };
        delete copy[data.conversation_id];
        return copy;
      });
    };

    const handleMessageSeen = (data: { conversation_id: string }) => {
      setConversations((prev) =>
        prev.map(c => c.id === data.conversation_id ? { ...c, unreadCount: 0 } : c)
      );
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageSeen", handleMessageSeen);
    socket.on("userPresenceChange", handlePresenceChange);
    socket.on("user_typing_start", handleTypingStart);
    socket.on("user_typing_stop", handleTypingStop);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageSeen", handleMessageSeen);
      socket.off("userPresenceChange", handlePresenceChange);
      socket.off("user_typing_start", handleTypingStart);
      socket.off("user_typing_stop", handleTypingStop);
    };
  }, [socket, currentUser?.id, debouncedSearch, activeTab, fetchConversations]);

  const markSeenMutation = useMutation({
    mutationFn: async ({ conversation_id, message_id }: { conversation_id: string, message_id: string }) => {
      await api.post(`/api/v1/chat/conversations/seen`, { conversation_id, message_id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navbar', 'chat_unread'] });
    }
  });

  const handleOpenChat = async (conv: Conversation) => {
    if (conv.unreadCount > 0 && conv.last_message) {
      markSeenMutation.mutate({ conversation_id: conv.id, message_id: conv.last_message.id }, {
        onSuccess: () => {
          socket?.emit("seenMessage", {
            conversation_id: conv.id,
            message_id: conv.last_message!.id,
          });
          setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
        },
        onError: (err) => console.error("Failed to mark message as seen:", err)
      });
    }

    const isDirectConv = conv.type === "direct";
    if (isDirectConv && conv.otherParticipants[0]) {
      const p = conv.otherParticipants[0];
      const isOnline = userPresences[p.user.id] ?? p.user.is_active_status;
      openPopup({
        id: p.user.id,
        name: p.nickname || p.user.profile?.full_name || "User",
        avatar: p.user.profile?.avatar_url || "/avatar-default.png",
        status: isOnline ? "online" : "offline",
        type: "direct",
        conversationId: conv.id,
      });
    } else {
      openPopup({
        id: conv.id,
        name: conv.name || "Group Chat",
        avatar: conv.avatar_url || "/group-default.png",
        status: "online",
        type: "group",
        conversationId: conv.id,
      });
    }

    onClose();
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 15) {
      if (hasMore && !loadingMore && !loading) {
        setPage((prev) => prev + 1);
      }
    }
  };

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.post("/api/v1/chat/conversations/mark-all-read");
    },
    onSuccess: () => {
      setConversations((prev) => prev.map((c) => ({ ...c, unreadCount: 0 })));
      setShowSettings(false);
      queryClient.invalidateQueries({ queryKey: ['navbar', 'chat_unread'] });
    },
    onError: (err) => console.error("Mark all as read failed:", err)
  });

  const handleMarkAllAsRead = () => {
    markAllReadMutation.mutate();
  };

  const togglePinMutation = useMutation({
    mutationFn: async (conv: Conversation) => {
      const endpoint = conv.is_pinned ? `/api/v1/chat/conversations/${conv.id}/unpin` : `/api/v1/chat/conversations/${conv.id}/pin`;
      await api.post(endpoint);
    },
    onSuccess: (_, conv) => {
      setConversations(prev =>
        prev.map(c => c.id === conv.id ? { ...c, is_pinned: !conv.is_pinned } : c)
          .sort((a, b) => {
            const isPinnedA = a.is_pinned ? 1 : 0;
            const isPinnedB = b.is_pinned ? 1 : 0;
            if (isPinnedA !== isPinnedB) return isPinnedB - isPinnedA;
            const timeA = a.last_message ? new Date(a.last_message.created_at).getTime() : new Date(a.created_at).getTime();
            const timeB = b.last_message ? new Date(b.last_message.created_at).getTime() : new Date(b.created_at).getTime();
            return timeB - timeA;
          })
      );
      setActiveMenuConvId(null);
    },
    onError: (err) => console.error("Failed to pin/unpin conversation:", err)
  });

  const handleTogglePin = (conv: Conversation) => togglePinMutation.mutate(conv);

  const toggleMuteMutation = useMutation({
    mutationFn: async (conv: Conversation) => {
      const isMuted = conv.unreadCount === -1;
      const endpoint = `/api/v1/chat/conversations/${conv.id}/${isMuted ? 'unmute' : 'mute'}`;
      await api.post(endpoint);
    },
    onSuccess: () => setActiveMenuConvId(null),
    onError: (err) => console.error("Failed to mute/unmute conversation:", err)
  });

  const handleToggleMute = (conv: Conversation) => toggleMuteMutation.mutate(conv);

  const toggleArchiveMutation = useMutation({
    mutationFn: async (conv: Conversation) => {
      const endpoint = conv.is_archived ? `/api/v1/chat/conversations/${conv.id}/unarchive` : `/api/v1/chat/conversations/${conv.id}/archive`;
      await api.post(endpoint);
    },
    onSuccess: (_, conv) => {
      setConversations(prev => prev.filter(c => c.id !== conv.id));
      setActiveMenuConvId(null);
    },
    onError: (err) => console.error("Failed to archive conversation:", err)
  });

  const handleToggleArchive = (conv: Conversation) => toggleArchiveMutation.mutate(conv);

  const toggleHideMutation = useMutation({
    mutationFn: async (conv: Conversation) => {
      const endpoint = conv.is_hidden ? `/api/v1/chat/conversations/${conv.id}/unhide` : `/api/v1/chat/conversations/${conv.id}/hide`;
      await api.post(endpoint);
    },
    onSuccess: (_, conv) => {
      setConversations(prev => prev.filter(c => c.id !== conv.id));
      setActiveMenuConvId(null);
    },
    onError: (err) => console.error("Failed to hide conversation:", err)
  });

  const handleToggleHide = (conv: Conversation) => toggleHideMutation.mutate(conv);

  const toggleSpamMutation = useMutation({
    mutationFn: async (conv: Conversation) => {
      const endpoint = conv.is_spam ? `/api/v1/chat/conversations/${conv.id}/unspam` : `/api/v1/chat/conversations/${conv.id}/spam`;
      await api.post(endpoint);
    },
    onSuccess: (_, conv) => {
      setConversations(prev => prev.filter(c => c.id !== conv.id));
      setActiveMenuConvId(null);
    },
    onError: (err) => console.error("Failed to spam conversation:", err)
  });

  const handleToggleSpam = (conv: Conversation) => toggleSpamMutation.mutate(conv);

  const markAsUnreadMutation = useMutation({
    mutationFn: async (conv: Conversation) => {
      await api.post(`/api/v1/chat/conversations/${conv.id}/mark-unread`);
    },
    onSuccess: (_, conv) => {
      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 1 } : c));
      setActiveMenuConvId(null);
    },
    onError: (err) => console.error("Failed to mark as unread:", err)
  });

  const handleMarkAsUnread = (conv: Conversation) => markAsUnreadMutation.mutate(conv);

  const blockUserMutation = useMutation({
    mutationFn: async (conv: Conversation) => {
      if (conv.type === 'direct' && conv.otherParticipants[0]) {
        const targetUserId = conv.otherParticipants[0].user.id;
        await api.post(`/api/v1/user/${targetUserId}/block`);
      }
    },
    onSuccess: (_, conv) => {
      setConversations(prev => prev.filter(c => c.id !== conv.id));
      setActiveMenuConvId(null);
    },
    onError: (err) => console.error("Failed to block user:", err)
  });

  const handleBlockUser = (conv: Conversation) => blockUserMutation.mutate(conv);

  const leaveGroupMutation = useMutation({
    mutationFn: async (conv: Conversation) => {
      await api.delete(`/api/v1/chat/conversations/${conv.id}/leave`);
    },
    onSuccess: (_, conv) => {
      setConversations(prev => prev.filter(c => c.id !== conv.id));
      setActiveMenuConvId(null);
    },
    onError: (err) => console.error("Failed to leave group:", err)
  });

  const handleLeaveGroup = (conv: Conversation) => leaveGroupMutation.mutate(conv);

  const interactedUsers = useMemo(() => {
    const usersMap = new Map<string, { id: string; name: string; avatar: string; status: boolean; conv: Conversation }>();
    conversations.forEach((conv) => {
      if (conv.type === "direct" && conv.otherParticipants[0]) {
        const p = conv.otherParticipants[0];
        const userId = p.user.id;
        if (!usersMap.has(userId)) {
          const isOnline = userPresences[userId] ?? p.user.is_active_status;
          usersMap.set(userId, {
            id: userId,
            name: p.nickname || p.user.profile?.full_name || "User",
            avatar: p.user.profile?.avatar_url || "/avatar-default.png",
            status: isOnline,
            conv,
          });
        }
      }
    });
    return Array.from(usersMap.values()).slice(0, 10);
  }, [conversations, userPresences]);

  return (
    <div className="fixed sm:absolute top-[60px] sm:top-12 left-4 right-4 sm:left-auto sm:-right-2 sm:w-[370px] bg-white border border-slate-100 shadow-[0_12px_42px_rgba(0,0,0,0.12)] rounded-2xl z-50 flex flex-col overflow-hidden max-h-[80vh] md:max-h-[570px] transition-all duration-300">

      {/* 1. Header Popup */}
      <div className="p-4 border-b border-slate-50 flex items-center justify-between shrink-0">
        <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">{t("title")}</h3>
        <div className="flex items-center gap-1.5 relative">

          <Link
            href="/messages"
            onClick={onClose}
            title={t("openExpand")}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ExternalLink size={16} />
          </Link>

          <button
            title={t("newChat")}
            onClick={() => {
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <SquarePen size={16} />
          </button>

          <div ref={settingsRef} className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer",
                showSettings ? "bg-slate-100" : ""
              )}
            >
              <MoreHorizontal size={18} />
            </button>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-9 w-64 bg-white border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.1)] rounded-xl py-1.5 z-[100] text-slate-700 font-semibold"
                >
                  <button
                    onClick={handleMarkAllAsRead}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-left text-xs text-slate-700 cursor-pointer"
                  >
                    <Check className="text-slate-400" size={15} />
                    {t("markAllAsRead")}
                  </button>
                  <div className="h-[1px] bg-slate-100 my-1" />
                  <button
                    onClick={() => {
                      setActiveTab('request');
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-left text-xs text-slate-600 cursor-pointer"
                  >
                    <MessageSquare className="text-slate-400" size={15} />
                    {t("messageRequests")}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('archived');
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-left text-xs text-slate-600 cursor-pointer"
                  >
                    <Archive className="text-slate-400" size={15} />
                    {t("archive")}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('hidden');
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-left text-xs text-slate-600 cursor-pointer"
                  >
                    <EyeOff className="text-slate-400" size={15} />
                    {t("hidden")}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('spam');
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-left text-xs text-slate-600 cursor-pointer"
                  >
                    <AlertTriangle className="text-slate-400" size={15} />
                    {t("spam")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* 2. Search Box & Filter Tabs */}
      <div className="px-4 py-2 bg-white shrink-0 space-y-2.5 border-b border-slate-50">

        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-slate-100/80 hover:bg-slate-100 rounded-full px-3 py-1.5 transition-colors border border-transparent focus-within:bg-white focus-within:border-blue-200 relative">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-slate-700 outline-none w-full placeholder:text-slate-400 font-medium pr-6"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={10} />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 select-none pb-0.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                "px-2.5 py-1 rounded-full transition-colors cursor-pointer",
                activeTab === 'all' ? "bg-blue-50 text-blue-600" : "hover:bg-slate-100 hover:text-slate-700"
              )}
            >
              {t("all")}
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={cn(
                "px-2.5 py-1 rounded-full transition-colors cursor-pointer",
                activeTab === 'unread' ? "bg-blue-50 text-blue-600" : "hover:bg-slate-100 hover:text-slate-700"
              )}
            >
              {t("unread")}
            </button>
            <button
              onClick={() => setActiveTab('group')}
              className={cn(
                "px-2.5 py-1 rounded-full transition-colors cursor-pointer",
                activeTab === 'group' ? "bg-blue-50 text-blue-600" : "hover:bg-slate-100 hover:text-slate-700"
              )}
            >
              {t("group")}
            </button>
          </div>

          {/* Tab Khác Dropdown */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={cn(
                "flex items-center gap-0.5 px-2.5 py-1 rounded-full hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer",
                ['request', 'archived', 'hidden', 'spam'].includes(activeTab) ? "bg-blue-50 text-blue-600" : ""
              )}
            >
              <span>
                {activeTab === 'request' && t("pending")}
                {activeTab === 'archived' && t("archived")}
                {activeTab === 'hidden' && t("hidden")}
                {activeTab === 'spam' && t("spam")}
                {!['request', 'archived', 'hidden', 'spam'].includes(activeTab) && t("other")}
              </span>
              <ChevronDown size={12} />
            </button>

            {/* Dropdown Menu Khác */}
            <AnimatePresence>
              {showMoreMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 top-7 w-40 bg-white border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.1)] rounded-xl py-1.5 z-[100] text-slate-600 font-semibold"
                >
                  <button
                    onClick={() => {
                      setActiveTab('request');
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-3 py-1.5 hover:bg-slate-50 text-left text-xs cursor-pointer flex items-center justify-between"
                  >
                    {t("messageRequests")}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('archived');
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-3 py-1.5 hover:bg-slate-50 text-left text-xs cursor-pointer flex items-center justify-between"
                  >
                    {t("archive")}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('hidden');
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-3 py-1.5 hover:bg-slate-50 text-left text-xs cursor-pointer flex items-center justify-between"
                  >
                    {t("hidden")}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('spam');
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-3 py-1.5 hover:bg-slate-50 text-left text-xs cursor-pointer flex items-center justify-between"
                  >
                    {t("spam")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* 2.5 Hàng ngang hiển thị các người dùng đã tương tác (Recent Interactions) */}
      {interactedUsers.length > 0 && !debouncedSearch && activeTab === 'all' && (
        <div className="px-4 py-3 bg-white border-b border-slate-50 shrink-0 select-none">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">
            {t("recentInteractions")}
          </p>
          <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-none snap-x">
            {interactedUsers.map((user) => {
              const firstName = user.name.split(" ").pop() || user.name;
              return (
                <button
                  key={user.id}
                  onClick={() => handleOpenChat(user.conv)}
                  className="flex flex-col items-center gap-1.5 shrink-0 snap-start group cursor-pointer focus:outline-none"
                >
                  <div className="relative">
                    <SafeAvatar src={user.avatar} name={user.name} isGroup={false} />
                    {user.status && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-[2.5px] border-white rounded-full shadow-sm animate-pulse" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold truncate max-w-[55px] group-hover:text-blue-500 transition-colors">
                    {firstName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. List of Conversations */}
      <div
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto min-h-[220px] scrollbar-thin scrollbar-thumb-slate-200 bg-white"
      >
        {loading && page === 1 ? (
          <div className="p-2 space-y-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                  <div className="h-2.5 bg-slate-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-3">
              <MessageSquare size={30} className="text-slate-300 stroke-[1.5]" />
            </div>
            <p className="text-xs font-bold text-slate-600">
              {t("noMessages")}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
              {activeTab === 'all' ? "Hãy bắt đầu gửi tin nhắn đến những người bạn của bạn!" : "Giao diện sạch sẽ, gọn gàng."}
            </p>
          </div>
        ) : (
          <div className="p-1.5 space-y-0.5">
            {conversations.map((conv) => {
              const isDirect = conv.type === "direct";
              const otherPart = conv.otherParticipants[0];

              if (!otherPart && isDirect) return null;

              const isOnline = isDirect
                ? (userPresences[otherPart.user.id] ?? otherPart.user.is_active_status)
                : false;

              const displayName = isDirect
                ? (otherPart.nickname || otherPart.user.profile?.full_name || "User")
                : (conv.name || "Group Chat");

              const displayAvatar = isDirect
                ? (otherPart.user.profile?.avatar_url || null)
                : (conv.avatar_url || null);

              const hasUnread = conv.unreadCount > 0;
              const formattedTime = conv.last_message
                ? formatTime(conv.last_message.created_at)
                : formatTime(conv.created_at);

              const isTyping = typingUsers[conv.id];

              return (
                <div
                  key={conv.id}
                  className="group relative w-full rounded-xl hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0"
                >
                  <button
                    onClick={() => handleOpenChat(conv)}
                    className={cn(
                      "w-full flex items-center gap-3.5 p-2.5 active:bg-slate-100 rounded-xl text-left cursor-pointer transition-all",
                      hasUnread ? "bg-blue-50/40 hover:bg-blue-50/70 border-l-4 border-blue-500 rounded-l-none pl-2" : ""
                    )}
                  >
                    {/* Avatar with fallback */}
                    <div className="relative shrink-0">
                      <SafeAvatar src={displayAvatar} name={displayName} isGroup={!isDirect} />
                      {isOnline && isDirect && (
                        <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full shadow-sm animate-pulse" />
                      )}
                    </div>

                    {/* Conversation Body */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span
                          className={cn(
                            "text-xs tracking-tight truncate block max-w-[75%]",
                            hasUnread ? "font-extrabold text-slate-950 text-[13px]" : "font-semibold text-slate-700"
                          )}
                        >
                          {highlightText(displayName, debouncedSearch)}
                        </span>
                        <span className={cn(
                          "text-[10px] font-medium shrink-0 ml-2",
                          hasUnread ? "text-blue-600 font-bold" : "text-slate-400"
                        )}>
                          {formattedTime}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        {isTyping ? (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 animate-pulse">
                            <span>{isTyping} đang soạn tin</span>
                            <span className="flex gap-0.5 items-center justify-center">
                              <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                              <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                              <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></span>
                            </span>
                          </div>
                        ) : (
                          <p
                            className={cn(
                              "text-[11px] truncate flex-1",
                              hasUnread ? "font-bold text-slate-900 text-[11.5px]" : "text-slate-400 font-medium"
                            )}
                          >
                            {renderPreview(conv.last_message, currentUser?.id)}
                          </p>
                        )}

                        {/* Unread blue dot & pinned state */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {conv.is_pinned && (
                            <Pin size={11} className="text-slate-400 rotate-45" />
                          )}
                          {hasUnread && (
                            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full shrink-0 flex items-center justify-center shadow-sm shadow-blue-200 animate-pulse" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Context Action Menu for each item */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button
                      onClick={() => setActiveMenuConvId(activeMenuConvId === conv.id ? null : conv.id)}
                      className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 border border-slate-100 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer transition-transform duration-100"
                    >
                      <MoreHorizontal size={14} />
                    </button>

                    <AnimatePresence>
                      {activeMenuConvId === conv.id && (
                        <div
                          ref={itemMenuRef}
                          className="absolute right-0 top-8 w-48 bg-white border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-xl py-1 z-[100] text-slate-700 text-xs font-semibold"
                        >
                          <button
                            onClick={() => handleTogglePin(conv)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left text-[11px] cursor-pointer"
                          >
                            {conv.is_pinned ? (
                              <>
                                <PinOff size={13} className="text-slate-400" />
                                Bỏ ghim tin nhắn
                              </>
                            ) : (
                              <>
                                <Pin size={13} className="text-slate-400" />
                                Ghim tin nhắn
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleToggleMute(conv)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left text-[11px] cursor-pointer"
                          >
                            <BellOff size={13} className="text-slate-400" />
                            Tắt thông báo
                          </button>

                          <button
                            onClick={() => handleMarkAsUnread(conv)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left text-[11px] cursor-pointer"
                          >
                            <Check size={13} className="text-slate-400" />
                            Đánh dấu chưa đọc
                          </button>

                          <div className="h-[1px] bg-slate-100 my-1" />

                          <button
                            onClick={() => handleToggleArchive(conv)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left text-[11px] cursor-pointer"
                          >
                            {conv.is_archived ? (
                              <>
                                <ArchiveRestore size={13} className="text-slate-400" />
                                Khôi phục lưu trữ
                              </>
                            ) : (
                              <>
                                <Archive size={13} className="text-slate-400" />
                                Lưu trữ cuộc trò chuyện
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleToggleHide(conv)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left text-[11px] cursor-pointer"
                          >
                            {conv.is_hidden ? (
                              <>
                                <Eye size={13} className="text-slate-400" />
                                Hiện cuộc trò chuyện
                              </>
                            ) : (
                              <>
                                <EyeOff size={13} className="text-slate-400" />
                                Ẩn cuộc trò chuyện
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleToggleSpam(conv)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left text-[11px] cursor-pointer text-amber-600 hover:text-amber-700"
                          >
                            <AlertTriangle size={13} className="text-amber-400" />
                            {conv.is_spam ? "Không phải Spam" : "Đánh dấu là Spam"}
                          </button>

                          {isDirect ? (
                            <button
                              onClick={() => handleBlockUser(conv)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 text-left text-[11px] cursor-pointer text-red-600"
                            >
                              <Lock size={13} className="text-red-400" />
                              Chặn người dùng
                            </button>
                          ) : (
                            <button
                              onClick={() => handleLeaveGroup(conv)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 text-left text-[11px] cursor-pointer text-red-600"
                            >
                              <LogOut size={13} className="text-red-400" />
                              Rời khỏi nhóm
                            </button>
                          )}

                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}

            {loadingMore && (
              <div className="flex justify-center p-3 animate-pulse">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Footer See all */}
      <Link
        href="/messages"
        onClick={onClose}
        className="block p-3 border-t border-slate-50 text-center bg-slate-50/30 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
      >
        <span className="text-xs font-bold text-blue-500 flex items-center justify-center gap-1">
          Xem tất cả trong Messenger
        </span>
      </Link>

    </div>
  );
}
