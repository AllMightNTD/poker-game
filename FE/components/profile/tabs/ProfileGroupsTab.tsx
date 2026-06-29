"use client";
import React, { useState } from "react";
import { Users, MoreHorizontal, Plus, Loader2, Globe, Lock, EyeOff, Shield, Star } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import api from "@/lib/axios";

const getMediaUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
  return `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`;
};

type FilterType = "all" | "managed" | "owned";

export function ProfileGroupsTab({ user, isOwnProfile }: { user: any; isOwnProfile: boolean }) {
  const t = useTranslations("profile.groups");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const { data: groupsData, isFetching } = useQuery({
    queryKey: ["profile-groups", user?.id, activeFilter],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await api.get(`/api/v1/user/${user.id}/groups?filter=${activeFilter}&page=1&limit=20`);
      return res.data?.metadata || res.data || { data: [], meta: {} };
    },
    enabled: !!user?.id,
    placeholderData: keepPreviousData,
  });

  const groups = groupsData?.data || [];
  const totalCount = groupsData?.meta?.total || 0;

  const categories: { id: FilterType; label: string }[] = [
    { id: "all", label: t("filterAll") },
    { id: "managed", label: t("filterManaged") },
    { id: "owned", label: t("filterOwned") },
  ];

  const emptyMessage = activeFilter === "all" ? t("emptyAll") : activeFilter === "managed" ? t("emptyManaged") : t("emptyOwned");

  const PrivacyIcon = ({ privacy }: { privacy: string }) => {
    if (privacy === "public") return <Globe size={11} className="inline mr-1" />;
    if (privacy === "closed") return <Lock size={11} className="inline mr-1" />;
    return <EyeOff size={11} className="inline mr-1" />;
  };

  const privacyLabel = (privacy: string) => {
    if (privacy === "public") return t("privacyPublic");
    if (privacy === "closed") return t("privacyClosed");
    return t("privacySecret");
  };

  const RoleBadge = ({ role, isOwner }: { role: string; isOwner: boolean }) => {
    if (isOwner) return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
        <Star size={9} className="fill-amber-500" /> {t("roleOwner")}
      </span>
    );
    if (role === "admin") return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
        <Shield size={9} /> {t("roleAdmin")}
      </span>
    );
    if (role === "moderator") return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
        <Shield size={9} /> {t("roleModerator")}
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
        <Users size={9} /> {t("roleMember")}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-300 w-full">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{t("title")}</h2>
          <p className="text-sm text-slate-400 font-medium">{t("count", { count: totalCount })}</p>
        </div>
        <div className="flex items-center gap-2">
          {isOwnProfile && (
            <button className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors">
              <Plus size={16} /> {t("createBtn")}
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-4 flex items-center gap-2 overflow-x-auto scrollbar-hide border-b border-slate-100">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeFilter === cat.id ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {(!groupsData && isFetching) ? (
        <div className="p-16 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Users size={48} className="opacity-30" />
          <p className="text-sm font-semibold">{emptyMessage}</p>
          <p className="text-xs text-center max-w-xs">{t("emptyDesc")}</p>
        </div>
      ) : (
        <div className={`p-4 grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-200 ${isFetching ? "opacity-60" : "opacity-100"}`}>
          {groups.map((group: any) => (
            <Link href={`/groups/${group.slug || group.id}`} key={group.id} className="flex flex-col sm:flex-row items-start sm:items-center p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:shadow-md transition-all group">
              <div className="relative w-full sm:w-[88px] h-20 sm:h-[60px] rounded-xl overflow-hidden mb-3 sm:mb-0 sm:mr-4 shrink-0 bg-slate-100">
                {group.cover_url || group.avatar_url ? (
                  <img src={getMediaUrl(group.cover_url || group.avatar_url)} alt={group.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                    <Users size={24} className="text-blue-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-sm line-clamp-1">{group.name}</h3>
                <p className="text-xs font-medium text-slate-400 mt-0.5">
                  <PrivacyIcon privacy={group.privacy} />
                  {privacyLabel(group.privacy)} · {t("memberCount", { count: group.member_count || 0 })}
                </p>
                <div className="mt-2"><RoleBadge role={group.role} isOwner={group.is_owner} /></div>
              </div>
              <button onClick={(e) => e.preventDefault()} className="hidden sm:block p-2 ml-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors shrink-0">
                <MoreHorizontal size={18} />
              </button>
            </Link>
          ))}
        </div>
      )}

      {totalCount > 20 && (
        <div className="p-4 border-t border-slate-100 text-center">
          <button className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline">{t("viewMore")}</button>
        </div>
      )}
    </div>
  );
}
