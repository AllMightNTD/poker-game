"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, X, Smile } from "lucide-react";
import { usePokerGame } from "../hooks/usePokerGame";
import { useResponsive } from "../hooks/useResponsive";

const QUICK_REACTIONS = ["👍", "🔥", "😂", "🤔", "💰", "😎"];

const ChatContent = ({ onClose }: { onClose?: () => void }) => {
  const { chatInput, setChatInput, chatMessages, sendChatMessage } = usePokerGame();
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare size={13} className="text-emerald-400" />
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
            Chat Bàn
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
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
        {chatMessages.map((msg, idx) =>
          msg.isSystem ? (
            <div key={idx} className="text-center">
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-500 text-[9px] font-medium">
                {msg.text}
              </span>
            </div>
          ) : (
            <div key={idx} className="space-y-0.5">
              <span className="font-black text-slate-300 text-[9px] uppercase tracking-wide">
                {msg.sender}
              </span>
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl rounded-tl-sm px-3 py-2">
                <span className="text-slate-300 text-[11px] leading-relaxed">{msg.text}</span>
              </div>
            </div>
          )
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendChatMessage}
        className="p-3 border-t border-slate-800/60 bg-slate-950/80 flex gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
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
