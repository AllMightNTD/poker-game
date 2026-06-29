"use client";
import React, { useState } from "react";
import { Search, MoreHorizontal, Loader2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import api from "@/lib/axios";
import { useDebounce } from "@/hooks/useDebounce";

interface ProfileFriendsTabProps {
  user: any;
  isOwnProfile: boolean;
}

export function ProfileFriendsTab({ user, isOwnProfile }: ProfileFriendsTabProps) {
  const t = useTranslations("profile.friends");
  const [activeTab, setActiveTab] = useState<"all" | "mutual">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data: friendsData, isLoading: isLoadingFriends, isFetching } = useQuery({
    queryKey: ["friends", user?.id, activeTab, debouncedSearch],
    queryFn: async () => {
      if (!user?.id) return null;
      if (activeTab === "mutual" && !isOwnProfile) {
        const res = await api.get(`/api/v1/user/${user.id}/mutual-friends?page=1&limit=20`);
        return res.data?.metadata || res.data || { data: [], meta: {} };
      }
      if (debouncedSearch) {
        const res = await api.get(`/api/v1/user/${user.id}/friends/search?keyword=${debouncedSearch}&page=1&limit=20`);
        return res.data?.metadata || res.data || { data: [], meta: {} };
      }
      const res = await api.get(`/api/v1/user/${user.id}/friends?page=1&limit=20`);
      return res.data?.metadata || res.data || { data: [], meta: {} };
    },
    enabled: !!user?.id,
    placeholderData: keepPreviousData,
  });

  const categories = [
    { id: "all", label: t("filterAll") },
    ...(!isOwnProfile ? [{ id: "mutual", label: t("filterMutual") }] : []),
  ];

  const friends = friendsData?.data || [];
  const totalCount = friendsData?.meta?.total || 0;
  const displayCount = activeTab === "all" ? (user?.stats?.total_friends || totalCount) : totalCount;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-300 w-full">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{t("title")}</h2>
          <p className="text-sm text-slate-400 font-medium">
            {t("count", { count: displayCount })}
            {activeTab === "mutual" && ` ${t("filterMutual").toLowerCase()}`}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            {isFetching ? (
              <Loader2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" />
            ) : (
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            )}
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-9 pr-4 text-sm font-medium outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="px-6 py-4 flex items-center gap-2 overflow-x-auto scrollbar-hide border-b border-slate-100">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === cat.id ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {(!friendsData && isFetching) ? (
        <div className="p-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {friends.length === 0 ? (
            <div className="col-span-1 md:col-span-2 py-8 text-center text-slate-500">
              {t("noFriends")}
            </div>
          ) : (
            friends.map((item: any) => {
              const friendUser = item.friend_user || item;
              const profile = friendUser.profile || {};
              const avatar = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || friendUser.email || "U")}`;
              const name = profile.full_name || friendUser.email?.split("@")[0] || "User";
              return (
                <div key={friendUser.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-4">
                    <img src={avatar} alt={name} className="w-16 h-16 rounded-xl object-cover bg-slate-50" />
                    <div>
                      <Link href={`/profile/${friendUser.id}`} className="font-bold text-slate-800 hover:text-blue-600 transition-colors text-base line-clamp-1">
                        {name}
                      </Link>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {totalCount > 20 && (
        <div className="p-4 border-t border-slate-100 text-center">
          <button className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline">
            {t("viewMore")}
          </button>
        </div>
      )}
    </div>
  );
}
