"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, X, Smile } from "lucide-react";
import { usePokerGame } from "../hooks/usePokerGame";
import { useResponsive } from "../hooks/useResponsive";

import { useCurrentUser } from "@/core/providers/user-provider";

const QUICK_REACTIONS = ["👍", "🔥", "😂", "🤔", "💰", "😎"];

const ChatContent = ({ onClose }: { onClose?: () => void }) => {
  const {
    chatInput,
    setChatInput,
    chatMessages,
    sendChatMessage,
    loadMoreChats,
    hasMoreChats,
    isLoadingHistory,
  } = usePokerGame();
  const { currentUser } = useCurrentUser();
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const isLiftingScroll = React.useRef(false);
  const prevScrollHeightRef = React.useRef<number>(0);

  const [mutedUserIds, setMutedUserIds] = React.useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const loaded = localStorage.getItem("poker_muted_users");
    if (loaded) {
      try {
        return JSON.parse(loaded);
      } catch {
        return [];
      }
    }
    return [];
  });

  const loadMutedUsers = React.useCallback(() => {
    if (typeof window === "undefined") return;
    const loaded = localStorage.getItem("poker_muted_users");
    if (loaded) {
      try {
        setMutedUserIds(JSON.parse(loaded));
      } catch {
        setMutedUserIds([]);
      }
    } else {
      setMutedUserIds([]);
    }
  }, []);

  React.useEffect(() => {
    const handleMuteToggle = () => {
      loadMutedUsers();
    };
    window.addEventListener("poker_mute_toggle", handleMuteToggle);
    window.addEventListener("storage", handleMuteToggle);
    return () => {
      window.removeEventListener("poker_mute_toggle", handleMuteToggle);
      window.removeEventListener("storage", handleMuteToggle);
    };
  }, [loadMutedUsers]);

  // Sắp xếp tin nhắn theo created_at / timestamp tăng dần và lọc người chơi bị chặn
  const sortedMessages = React.useMemo(() => {
    return [...chatMessages]
      .filter((msg) => !msg.senderId || !mutedUserIds.includes(msg.senderId))
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  }, [chatMessages, mutedUserIds]);

  // Xử lý sự kiện scroll lên đỉnh để load history
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop === 0 && hasMoreChats && !isLoadingHistory) {
      prevScrollHeightRef.current = target.scrollHeight;
      isLiftingScroll.current = true;
      loadMoreChats();
    }
  };

  // Điều chỉnh scroll position để tránh giật vị trí khi prepending history
  React.useLayoutEffect(() => {
    if (containerRef.current && isLiftingScroll.current && prevScrollHeightRef.current > 0) {
      const newScrollHeight = containerRef.current.scrollHeight;
      const diff = newScrollHeight - prevScrollHeightRef.current;
      if (diff > 0) {
        containerRef.current.scrollTop = diff;
      }
      isLiftingScroll.current = false;
      prevScrollHeightRef.current = 0;
    }
  }, [chatMessages]);

  // Tự động cuộn xuống dưới khi có tin nhắn mới (chỉ khi không phải đang load history)
  React.useEffect(() => {
    if (!isLiftingScroll.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare size={13} className="text-emerald-400" />
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
            Table Chat
                                </span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="xl:hidden w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Quick Reactions */}
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800/40 shrink-0">
        <Smile size={11} className="text-slate-500 shrink-0" />
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() =>
              setChatInput((chatInput ? chatInput + " " : "") + emoji)
            }
            className="text-base hover:scale-125 transition-transform duration-100 leading-none"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs select-none scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800"
      >
        {/* Loading Spinner khi tải tin cũ */}
        {isLoadingHistory && (
          <div className="flex justify-center py-2 shrink-0">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {sortedMessages.map((msg, idx) => {
          if (msg.isSystem) {
            return (
              <div key={msg.id || idx} className="text-center py-1">
                <span className="px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-800/40 text-slate-500 text-[9px] font-medium tracking-wide">
                  {msg.text}
                </span>
              </div>
            );
          }

          const isMe = currentUser && (msg.sender === currentUser.user_name || msg.sender === currentUser.username || msg.sender === "You");
          const avatarUrl = msg.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${msg.sender}`;

          return (
            <div key={msg.id || idx} className={`flex items-start gap-2 ${isMe ? "flex-row-reverse text-right" : ""}`}>
              {/* Avatar */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={msg.sender}
                className="w-7 h-7 rounded-full border border-slate-800 bg-slate-900 object-cover shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${msg.sender}`;
                }}
              />

              {/* Message Content */}
              <div className={`flex flex-col gap-1 max-w-[80%] ${isMe ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-black tracking-wide ${isMe ? "text-emerald-400" : "text-slate-300"}`}>
                    {msg.sender}
                  </span>
                  {msg.seatNumber !== null && msg.seatNumber !== undefined ? (
                    <span className="px-1 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-wider">
                      Seat #{msg.seatNumber}
                    </span>
                  ) : (
                    <span className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-slate-500 text-[8px] font-black uppercase tracking-wider">
                      Spectators
                                                          </span>
                  )}
                </div>

                <div
                  className={`px-3 py-2 rounded-2xl text-[11px] leading-relaxed shadow-sm border ${
                    isMe
                       ? "bg-emerald-600/10 border-emerald-500/20 text-emerald-300 rounded-tr-sm"
                      : "bg-slate-900/80 border-slate-850 text-slate-300 rounded-tl-sm"
                  }`}
                >
                  <span className="break-all whitespace-pre-wrap">{msg.text}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendChatMessage}
        className="p-3 border-t border-slate-800/60 bg-slate-950/80 flex gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          className="flex-1 py-2 px-3.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/30 text-xs text-slate-200 placeholder-slate-600 transition-colors"
        />
        <button
          type="submit"
          disabled={!chatInput.trim()}
          className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 flex items-center justify-center transition-colors"
        >
          <Send size={13} />
        </button>
      </form>
    </>
  );
};

export const ChatDrawer = () => {
  const { showChat, setShowChat } = usePokerGame();
  const { isDesktop } = useResponsive();

  return (
    <>
      {/* ── DESKTOP (xl+): Left sidebar ── */}
      <aside
        className={`hidden xl:flex flex-col shrink-0 border-r border-slate-800/60 bg-slate-950/98 transition-all duration-300 overflow-hidden ${
          showChat ? "w-64" : "w-0"
        }`}
      >
        <ChatContent />
      </aside>

      {/* ── NON-DESKTOP: Floating button ── */}
      {!isDesktop && (
        <button
          onClick={() => setShowChat(!showChat)}
          className="xl:hidden fixed bottom-44 left-3 z-30 w-10 h-10 rounded-full bg-slate-900/95 border border-slate-700 shadow-xl flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-600/50 transition-colors backdrop-blur-sm"
          aria-label="Toggle chat"
        >
          <MessageSquare size={15} />
        </button>
      )}

      {/* ── NON-DESKTOP: Bottom Sheet ── */}
      <AnimatePresence>
        {showChat && !isDesktop && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChat(false)}
              className="xl:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="xl:hidden fixed inset-x-0 bottom-0 z-50 h-[70vh] bg-slate-950 border-t border-slate-800 rounded-t-3xl flex flex-col overflow-hidden"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-slate-700" />
              </div>
              <ChatContent onClose={() => setShowChat(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
