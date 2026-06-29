// src/components/layout/NotificationCenter.tsx
"use client";
import { cn } from "@/lib/utils";
import { Heart, MessageCircle, Sparkles, UserPlus, Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

interface NotificationCenterProps {
  notifications: any[];
  unreadCount: number;
  onClose: () => void;
  onSeeAllClick?: () => void;
  onMarkAsRead?: (id: string) => void;
}

export const NotificationCenter = ({
  notifications,
  unreadCount,
  onClose,
  onSeeAllClick,
  onMarkAsRead,
}: NotificationCenterProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations("notification");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'FRIEND_REQUEST':
      case 'FRIEND_ACCEPTED':
        return <UserPlus size={14} className="text-white" />;
      case 'POST_LIKE':
        return <Heart size={14} className="text-white" fill="white" />;
      case 'POST_COMMENT':
      case 'COMMENT_REPLY':
        return <MessageCircle size={14} className="text-white" />;
      default:
        return <Bell size={14} className="text-white" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'FRIEND_REQUEST':
      case 'FRIEND_ACCEPTED':
        return "bg-[#00FFD1]";
      case 'POST_LIKE':
        return "bg-[#00C2FF]";
      case 'POST_COMMENT':
      case 'COMMENT_REPLY':
        return "bg-blue-400";
      default:
        return "bg-orange-400";
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
  };

  const requestedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Auto mark displayed notifications as read
    const visibleNotifications = notifications.slice(0, 5);
    const unreadVisible = visibleNotifications.filter(n => !n.read_at && !requestedIds.current.has(n.id));
    
    if (unreadVisible.length > 0 && onMarkAsRead) {
      unreadVisible.forEach(n => {
        requestedIds.current.add(n.id);
        onMarkAsRead(n.id);
      });
    }
  }, [notifications, onMarkAsRead]);

  return (
    <aside
      ref={ref}
      aria-label={t("ariaLabel")}
      // Removed top-12 mt-2 and added top-full pt-3 wrapper logic via a wrapper div inside or just adjust top
      // Wait, we can't easily change the parent wrapper here, but we can make this element stretch up with a transparent border/padding.
      // Or we can just use top-full and mt-2, but add a pseudo element for the bridge.
      className="absolute right-0 top-9 mt-0 pt-3 w-85 z-50 animate-in fade-in slide-in-from-top-2 duration-300 before:absolute before:-top-3 before:right-0 before:w-full before:h-3 before:bg-transparent"
    >
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,194,255,0.18)] border border-[#BEEFFF] overflow-hidden">
      <header className="p-5 border-b border-[#F4FDFF] bg-gradient-to-r from-white to-[#F4FDFF] flex justify-between items-center">
        <h3 className="font-black text-[#102A43] text-lg flex items-center gap-2">
          {t("title")}{" "}
          <Sparkles size={18} className="text-[#00C2FF]" aria-hidden="true" />
        </h3>
        {unreadCount > 0 && (
          <span
            role="status"
            className="text-[10px] bg-[#00C2FF] text-white px-3 py-1 rounded-full font-black shadow-lg shadow-[#00C2FF]/20 tracking-widest"
          >
            {unreadCount} {t("new")}
          </span>
        )}
      </header>

      <div
        className="max-h-[450px] overflow-y-auto no-scrollbar"
        role="log"
        aria-live="polite"
      >
        {notifications.length === 0 ? (
          <div className="p-5 text-center text-slate-400 text-sm">{t("empty")}</div>
        ) : (
          notifications.slice(0, 5).map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (onMarkAsRead && !n.read_at) onMarkAsRead(n.id);
              }}
              className={cn("p-5 hover:bg-[#F4FDFF] transition-all cursor-pointer flex gap-4 items-start border-b border-[#F4FDFF] last:border-0 group relative", !n.read_at && "bg-[#F4FDFF]/50")}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-[#00C2FF]/20 transition-all relative shadow-sm">
                  <Image
                    src={n.actor?.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.actor?.email}`}
                    alt={t("avatarOf", { name: n.actor?.profile?.full_name || n.actor?.email || t("anonymous") })}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div
                  className={cn(
                    "absolute -bottom-1 -right-1 p-1.5 rounded-[10px] border-2 border-white shadow-md transition-transform group-hover:scale-110",
                    getColor(n.type),
                  )}
                  aria-hidden="true"
                >
                  {getIcon(n.type)}
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <p className="text-[14px] text-[#102A43] leading-[1.4]">
                  <span className="font-black hover:text-[#00C2FF] transition-colors">
                    {n.actor?.profile?.full_name || n.actor?.email || t("anonymous")}
                  </span>{" "}
                  <span className="text-[#102A43]/70 font-medium">
                    {n.payload?.message || t("defaultMessage")}
                  </span>
                </p>
                <time
                  dateTime={n.created_at}
                  className="text-[10px] font-black text-[#00C2FF] uppercase tracking-[0.1em]"
                >
                  {formatTime(n.created_at)}
                </time>
              </div>

              {!n.read_at && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#00C2FF] transition-opacity" />
              )}
            </div>
          ))
        )}
      </div>

      {notifications.length > 5 && (
        <button
          onClick={onSeeAllClick}
          className="block w-full p-5 text-center text-[12px] font-black text-[#102A43]/40 hover:text-[#00C2FF] hover:bg-[#F4FDFF] transition-all bg-white border-t border-[#F4FDFF] uppercase tracking-[0.2em]"
        >
          {t("seeAll")}
        </button>
      )}
      </div>
    </aside>
  );
};

