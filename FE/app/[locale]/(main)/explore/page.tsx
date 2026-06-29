// src/app/(main)/explore/page.tsx
"use client";
import { Flame, Search, Sparkles, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ExplorePage() {
  const t = useTranslations("explore");
  const categories = [
    {
      name: t("programming"),
      slug: "dev",
      color: "bg-[#F4FDFF]",
      text: "text-[#00C2FF]",
      icon: "💻",
    },
    {
      name: t("design"),
      slug: "design",
      color: "bg-[#E6FFF3]",
      text: "text-[#00FFD1]",
      icon: "🎨",
    },
    {
      name: t("marketing"),
      slug: "marketing",
      color: "bg-blue-50",
      text: "text-blue-500",
      icon: "🚀",
    },
    {
      name: t("languages"),
      slug: "languages",
      color: "bg-indigo-50",
      text: "text-indigo-400",
      icon: "🌏",
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Search Bar lớn phong cách Ocean */}
      <div className="relative group">
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          className="w-full p-7 rounded-[3rem] bg-white border-2 border-transparent shadow-[0_20px_60px_rgba(0,194,255,0.12)] focus:border-[#BEEFFF] focus:ring-4 focus:ring-[#00C2FF]/5 outline-none text-xl font-bold text-[#102A43] transition-all placeholder:text-[#102A43]/20"
        />
        <div className="absolute right-4 top-4 bg-[#00C2FF] p-4 rounded-[2rem] text-white shadow-lg shadow-[#00C2FF]/30 group-hover:scale-105 transition-transform cursor-pointer active:scale-95">
          <Search size={28} strokeWidth={3} />
        </div>
      </div>

      {/* 2. Categories Grid */}
      <section>
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-2xl font-black text-[#102A43] flex items-center gap-2">
            {t("hotTopics")} <Sparkles className="text-[#00FFD1]" size={24} />
          </h2>
          <button className="text-xs font-black text-[#00C2FF] uppercase tracking-widest hover:underline">
            {t("seeAll")}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.slug}
              className={`${cat.color} p-8 rounded-[2.5rem] border-2 border-white shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer group`}
            >
              <span className="text-4xl mb-4 block group-hover:animate-bounce">
                {cat.icon}
              </span>
              <h4 className={`font-black text-lg ${cat.text}`}>{cat.name}</h4>
              <p className="text-[10px] text-[#102A43]/30 font-black uppercase mt-1 tracking-tighter">
                {t("knowledgeCount")}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Trending Articles Section */}
      <section className="bg-white rounded-[3rem] p-8 border border-[#BEEFFF] shadow-[0_10px_40px_rgba(0,194,255,0.05)]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-[#102A43] flex items-center gap-2">
            {t("trending")}{" "}
            <Flame size={24} className="text-[#00C2FF] animate-pulse" />
          </h2>
          <TrendingUp size={20} className="text-[#102A43]/20" />
        </div>

        <div className="grid grid-cols-1 gap-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row gap-6 group cursor-pointer"
            >
              <div className="w-full sm:w-32 h-32 rounded-[2rem] overflow-hidden shrink-0 shadow-md">
                <img
                  src={`https://picsum.photos/seed/${i + 50}/400`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  alt="trending"
                />
              </div>
              <div className="flex flex-col justify-center space-y-2">
                <div className="flex gap-2">
                  <span className="bg-[#F4FDFF] text-[#00C2FF] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#BEEFFF]">
                    #Knowledge2026
                  </span>
                  <span className="bg-[#E6FFF3] text-[#00FFD1] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#BEEFFF]">
                    #TechFlow
                  </span>
                </div>
                <h3 className="font-black text-lg text-[#102A43] group-hover:text-[#00C2FF] transition-colors leading-tight">
                  Tương lai của AI-Block trong việc xây dựng hệ thống quản lý
                  kiến thức cá nhân
                </h3>
                <div className="flex items-center gap-4 text-[#102A43]/40 text-[11px] font-black uppercase tracking-tighter">
                  <span className="flex items-center gap-1">
                    <Search size={12} /> {t("views", { count: 3.8 })}
                  </span>
                  <span className="flex items-center gap-1">
                    ⏱️ {t("readTime", { count: 15 })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-8 py-4 bg-[#F4FDFF] rounded-2xl text-[#00C2FF] font-black text-sm hover:bg-[#00C2FF] hover:text-white transition-all uppercase tracking-[0.2em]">
          {t("seeMoreTrending")}
        </button>
      </section>
    </div>
  );
}
