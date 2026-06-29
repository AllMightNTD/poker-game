// src/app/(main)/bookmarks/page.tsx
"use client";
import { FolderPlus, Lock, MoreVertical } from "lucide-react";
import { useTranslations } from "next-intl";

export default function BookmarksPage() {
  const t = useTranslations("bookmarks");
  const collections = [
    {
      id: 1,
      name: t("webDev"),
      count: 12,
      color: "bg-[#F4FDFF]",
      iconColor: "text-[#00C2FF]",
    },
    {
      id: 2,
      name: t("uiux"),
      count: 8,
      color: "bg-[#E6FFF3]",
      iconColor: "text-[#00FFD1]",
    },
    {
      id: 3,
      name: t("goodDocs"),
      count: 25,
      color: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      id: 4,
      name: t("personalProject"),
      count: 5,
      color: "bg-indigo-50",
      iconColor: "text-indigo-500",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#102A43]">
            {t("title")} <span className="text-[#00C2FF]">📂</span>
          </h1>
          <p className="text-sm font-bold text-[#102A43]/40 uppercase tracking-widest mt-1">
            {t("subtitle")}
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 bg-[#00C2FF] text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-[#00C2FF]/25 hover:bg-[#00AEEF] hover:scale-105 transition-all active:scale-95">
          <FolderPlus size={20} />
          {t("addNew")}
        </button>
      </div>

      {/* Grid Collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map((col) => (
          <div
            key={col.id}
            className="bg-white p-2 rounded-[2.5rem] border border-[#BEEFFF] shadow-sm hover:shadow-[0_20px_50px_rgba(0,194,255,0.1)] transition-all group cursor-pointer"
          >
            {/* Folder Cover */}
            <div
              className={`${col.color} rounded-[2rem] p-6 flex items-start justify-between transition-colors`}
            >
              <div className="space-y-4">
                <div className="bg-white p-3 rounded-2xl w-fit shadow-sm group-hover:scale-110 transition-transform">
                  <Lock size={20} className={col.iconColor} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#102A43] group-hover:text-[#00C2FF] transition-colors">
                    {col.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`w-2 h-2 rounded-full animate-pulse ${col.iconColor.replace("text", "bg")}`}
                    />
                    <p
                      className={`text-[10px] font-black uppercase tracking-widest ${col.iconColor}`}
                    >
                      {t("savedKnowledge", { count: col.count })}
                    </p>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-white/50 rounded-full transition-colors text-[#102A43]/20 hover:text-[#102A43]">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Avatars of Contributors/Items Preview */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-xl border-2 border-white overflow-hidden shadow-sm"
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${col.name + i}`}
                      className="w-full h-full object-cover bg-gray-50"
                      alt="preview"
                    />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-xl bg-[#F4FDFF] border-2 border-white flex items-center justify-center text-[10px] font-black text-[#00C2FF]">
                  +{col.count - 3}
                </div>
              </div>

              <div className="text-[10px] font-black text-[#102A43]/20 uppercase">
                {t("updatedDaysAgo", { count: 2 })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
