"use client";
import React, { createContext, useCallback, useContext, useState } from "react";

// Contact shape used across the mini chat system
export interface MiniChatContact {
  id: string;
  name: string;
  avatar: string;
  status?: "online" | "away" | "offline";
  conversationId?: string;
  type?: "direct" | "group";
}

interface MiniChatContextValue {
  activePopups: MiniChatContact[];
  minimizedIds: Set<string>;
  openPopup: (contact: MiniChatContact) => void;
  closePopup: (contactId: string) => void;
  toggleMinimize: (contactId: string) => void;
}

const MiniChatContext = createContext<MiniChatContextValue | null>(null);

// Maximum number of visible chat windows at once
const MAX_POPUPS = 3;

export function MiniChatProvider({ children }: { children: React.ReactNode }) {
  const [activePopups, setActivePopups] = useState<MiniChatContact[]>([]);
  const [minimizedIds, setMinimizedIds] = useState<Set<string>>(new Set());

  const openPopup = useCallback((contact: MiniChatContact) => {
    setActivePopups((prev) => {
      // If already open, just bring it to "expanded" state
      if (prev.find((p) => p.id === contact.id)) {
        setMinimizedIds((ids) => {
          const next = new Set(ids);
          next.delete(contact.id);
          return next;
        });
        return prev;
      }

      // If at max, remove the oldest popup (leftmost)
      const newList = prev.length >= MAX_POPUPS ? prev.slice(1) : prev;
      return [...newList, contact];
    });
    // Ensure newly opened window is not minimized
    setMinimizedIds((ids) => {
      const next = new Set(ids);
      next.delete(contact.id);
      return next;
    });
  }, []);

  const closePopup = useCallback((contactId: string) => {
    setActivePopups((prev) => prev.filter((p) => p.id !== contactId));
    setMinimizedIds((ids) => {
      const next = new Set(ids);
      next.delete(contactId);
      return next;
    });
  }, []);

  const toggleMinimize = useCallback((contactId: string) => {
    setMinimizedIds((ids) => {
      const next = new Set(ids);
      if (next.has(contactId)) {
        next.delete(contactId);
      } else {
        next.add(contactId);
      }
      return next;
    });
  }, []);

  return (
    <MiniChatContext.Provider
      value={{ activePopups, minimizedIds, openPopup, closePopup, toggleMinimize }}
    >
      {children}
    </MiniChatContext.Provider>
  );
}

export function useMiniChat() {
  const ctx = useContext(MiniChatContext);
  if (!ctx) throw new Error("useMiniChat must be used inside MiniChatProvider");
  return ctx;
}
