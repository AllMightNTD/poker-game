"use client";
import { pages } from "@/lib/mockData";
import { getRightSidebarData } from "@/lib/right-sidebar-api";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { useMiniChat } from "../chat/MiniChatContext";
import { useSocket } from "../providers/SocketProvider";

// Types for friend API response
interface FriendProfile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

interface FriendPresence {
  status: "online" | "away" | "busy" | "offline";
  last_seen_at?: Date | string;
  is_invisible?: boolean;
}

interface FriendUser {
  id: string;
  email: string;
  status: string;
  profile: FriendProfile | null;
  presence?: FriendPresence;
}

interface FriendItem {
  user_id: string;
  friend_id: string;
  list_type: string;
  created_at: string;
  friend_user: FriendUser;
}

// Types for group API response
interface GroupData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  privacy: string;
  type: string;
  member_count: number;
  post_count: number;
  created_by: string;
}

interface GroupMemberItem {
  group_id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
  group: GroupData;
}

function Avatar({
  src,
  alt,
  fallback,
  color = "bg-slate-400",
  size = "md",
}: {
  src?: string;
  alt?: string;
  fallback?: string;
  color?: string;
  size?: "sm" | "md";
}) {
  const sz = size === "sm" ? "w-8 h-8 text-xs" : "w-9 h-9 text-xs";
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn("rounded-full object-cover flex-shrink-0", sz)}
      />
    );
  }
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white font-bold flex-shrink-0",
        sz,
        color,
      )}
    >
      {fallback}
    </div>
  );
}

function StatusDot({ online, away }: { online?: boolean; away?: boolean }) {
  if (!online && !away) return null;
  return (
    <span
      className={cn(
        "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white",
        away ? "bg-yellow-400" : "bg-green-400",
      )}
    />
  );
}

import { useTranslations } from "next-intl";

export default function RightSidebar({ currentUser }: { currentUser?: any }) {
  const t = useTranslations("rightSidebar");
  const { openPopup } = useMiniChat();
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [userGroups, setUserGroups] = useState<GroupMemberItem[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const { socket } = useSocket();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!socket) return;

    const handlePresenceChange = (data: { userId: string; status: string; last_seen_at: string }) => {
      setFriends((prevFriends) =>
        prevFriends.map((f) => {
          if (f.friend_id === data.userId) {
            return {
              ...f,
              friend_user: {
                ...f.friend_user,
                presence: {
                  status: data.status as any,
                  last_seen_at: data.last_seen_at,
                },
              },
            };
          }
          return f;
        })
      );
    };

    socket.on("userPresenceChange", handlePresenceChange);

    return () => {
      socket.off("userPresenceChange", handlePresenceChange);
    };
  }, [socket]);

  useEffect(() => {
    if (fetchedRef.current) return;

    fetchedRef.current = true;

    let cancelled = false;

    const fetchData = async () => {
      try {
        const data = await getRightSidebarData();
        setFriends(data.friends);
        setLoadingFriends(false)
        setLoadingGroups(false)
        setUserGroups(data.groups);
      } catch (error) {
        console.error("Failed to fetch sidebar data:", error);
        setLoadingFriends(true)
        setLoadingGroups(false)
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <aside className="hidden xl:flex flex-col w-64 flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] pt-4 pb-6 overflow-y-auto">
        {/* Contacts (Friends from API) */}
        <div className="px-4 mb-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {t("contacts")}
          </p>
          <div className="space-y-0.5">
            {loadingFriends ? (
              <div className="flex flex-col gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-2 py-2 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-slate-200" />
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            ) : friends.length === 0 ? (
              <p className="text-xs text-slate-400 px-2">{t("noFriends")}</p>
            ) : (
              friends.map((f) => {
                const profile = f.friend_user?.profile;
                const displayName = profile?.full_name || f.friend_user?.email || "Unknown";
                const avatarUrl = profile?.avatar_url || undefined;
                const presence = f.friend_user?.presence;
                const isOnline = presence?.status === "online";
                const isAway = presence?.status === "away";

                const formatLastActive = (dateStr?: string | Date) => {
                  if (!dateStr) return "";
                  const date = new Date(dateStr);
                  const now = new Date();
                  const diffMs = now.getTime() - date.getTime();
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffHours = Math.floor(diffMins / 60);
                  const diffDays = Math.floor(diffHours / 24);

                  if (diffMins < 1) return t("justNow");
                  if (diffMins < 60) return t("minsAgo", { count: diffMins });
                  if (diffHours < 24) return t("hoursAgo", { count: diffHours });
                  if (diffDays === 1) return t("yesterday");
                  return t("daysAgo", { count: diffDays });
                };

                return (
                  <button
                    key={f.friend_id}
                    onClick={() =>
                      openPopup({
                        id: f.friend_id,
                        name: displayName,
                        avatar: avatarUrl || "",
                        status: isOnline ? "online" : isAway ? "away" : "offline",
                        type: "direct",
                      })
                    }
                    className="w-full flex items-center justify-between px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <Avatar
                          src={avatarUrl}
                          alt={displayName}
                          fallback={displayName.charAt(0).toUpperCase()}
                        />
                        <StatusDot online={isOnline} away={isAway} />
                      </div>
                      <div className="flex flex-col items-start text-left truncate">
                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 truncate max-w-[120px]">
                          {displayName}
                        </span>
                        {!isOnline && !isAway && presence?.last_seen_at && (
                          <span className="text-[10px] text-slate-400">
                            {formatLastActive(presence.last_seen_at)}
                          </span>
                        )}
                        {isAway && (
                          <span className="text-[10px] text-amber-500 font-medium">
                            {t("away")}
                          </span>
                        )}
                      </div>
                    </div>
                    {isOnline && (
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="mx-4 border-t border-slate-100 my-2" />

        {/* Groups */}
        <div className="px-4 mb-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {t("groups")}
          </p>
          <div className="space-y-0.5">
            {loadingGroups ? (
              <div className="flex flex-col gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-2 py-2 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-slate-200" />
                    <div className="h-3 w-20 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            ) : userGroups.length === 0 ? (
              <p className="text-xs text-slate-400 px-2">{t("noGroups")}</p>
            ) : (
              userGroups.map((gm) => {
                const g = gm.group;
                const groupName = g?.name || "Unknown Group";
                const initials = groupName.substring(0, 2).toUpperCase();
                // Generate a deterministic color from group id
                const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-orange-500", "bg-pink-500", "bg-cyan-500", "bg-indigo-500", "bg-rose-500"];
                const colorIndex = g?.id ? g.id.charCodeAt(0) % colors.length : 0;

                return (
                  <button
                    key={gm.group_id}
                    className="w-full flex items-center justify-between px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        {g?.avatar_url ? (
                          <img
                            src={g.avatar_url}
                            alt={groupName}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div
                            className={cn(
                              "w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0",
                              colors[colorIndex],
                            )}
                          >
                            {initials}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 truncate max-w-[120px]">
                          {groupName}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {g?.privacy} · {gm.role}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {t("members", { count: g?.member_count || 0 })}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="mx-4 border-t border-slate-100 my-2" />

        {/* Pages */}
        <div className="px-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {t("pages")}
          </p>
          <div className="space-y-0.5">
            {pages.map((p) => (
              <button
                key={p.id}
                className="w-full flex items-center justify-between px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0",
                        p.color,
                      )}
                    >
                      {p.avatar}
                    </div>
                    <StatusDot online={p.online} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                    {p.name}
                  </span>
                </div>
                <span className="w-2 h-2 rounded-full bg-green-400" />
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
