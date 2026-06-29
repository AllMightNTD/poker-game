// src/app/(main)/profile/me/page.tsx
"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Bookmark,
  Calendar,
  Grid,
  Link as LinkIcon,
  MessageSquare,
  Settings,
  ShieldCheck,
} from "lucide-react";

const UserProfile = () => {
  const user = {
    full_name: "Hoàng Long",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    bio: "Chia sẻ kiến thức về lập trình Next.js và thiết kế hệ thống. 🚀",
    email: "longhoang@example.com",
    created_at: "Tháng 5, 2024",
    status: "active",
    stats: {
      articles: 42,
      followers: "1.2k",
      following: 850,
    },
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-700">
      {/* Header Profile - Ocean White Shadow */}
      <div className="bg-white rounded-[3rem] p-8 shadow-[0_20px_60px_rgba(0,194,255,0.08)] border border-[#BEEFFF] mb-8">
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Avatar với vòng tròn Gradient Ocean */}
          <div className="relative shrink-0">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-[3rem] p-1.5 bg-gradient-to-tr from-[#00C2FF] to-[#00FFD1] shadow-xl shadow-[#00C2FF]/20">
              <div className="w-full h-full rounded-[2.7rem] p-1 bg-white">
                <img
                  src={user.avatar_url}
                  className="w-full h-full rounded-[2.5rem] object-cover bg-[#F4FDFF]"
                  alt="Avatar"
                />
              </div>
            </div>
            {user.status === "active" && (
              <div className="absolute bottom-3 right-3 w-7 h-7 bg-[#00FFD1] border-4 border-white rounded-full shadow-lg animate-pulse" />
            )}
          </div>

          {/* User Info Section */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-5 mb-6">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-3xl font-black text-[#102A43] tracking-tight">
                  {user.full_name}
                </h1>
                <ShieldCheck
                  size={24}
                  className="text-[#00C2FF]"
                  fill="#00C2FF20"
                />
              </div>
              <div className="flex items-center justify-center gap-3">
                <button className="bg-[#00C2FF] text-white px-8 py-2.5 rounded-2xl font-black text-sm shadow-lg shadow-[#00C2FF]/30 hover:bg-[#00AEEF] hover:scale-105 transition-all active:scale-95">
                  Theo dõi
                </button>
                <button className="p-2.5 bg-[#F4FDFF] text-[#00C2FF] rounded-xl hover:bg-[#00C2FF] hover:text-white transition-all shadow-sm">
                  <Settings size={22} />
                </button>
              </div>
            </div>

            {/* Stats bar - Màu Dark Blue #102A43 */}
            <div className="flex items-center justify-center md:justify-start gap-10 mb-6">
              <StatItem label="Bài viết" value={user.stats.articles} />
              <StatItem label="Người theo dõi" value={user.stats.followers} />
              <StatItem label="Đang theo dõi" value={user.stats.following} />
            </div>

            {/* Bio & Metadata */}
            <p className="text-[#102A43]/70 text-[15px] font-medium leading-relaxed mb-6 max-w-md">
              {user.bio}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-5 text-[12px] font-black uppercase tracking-widest text-[#102A43]/30">
              <div className="flex items-center gap-1.5">
                <Calendar size={16} className="text-[#00FFD1]" />
                <span>Gia nhập {user.created_at}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <LinkIcon size={16} className="text-[#00C2FF]" />
                <span className="text-[#00C2FF] cursor-pointer hover:underline">
                  knowledge-block.io
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation - Tuyến tính Xanh */}
      <div className="flex items-center justify-center border-b border-[#F4FDFF] mb-8 gap-16">
        <TabItem icon={<Grid size={22} />} label="Bài viết" active />
        <TabItem icon={<Bookmark size={22} />} label="Bộ sưu tập" />
        <TabItem icon={<MessageSquare size={22} />} label="Thảo luận" />
      </div>

      {/* Grid bài viết - Ảnh bo tròn cực mạnh */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 px-4 md:px-0">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div
            key={i}
            whileHover={{ y: -8, scale: 1.02 }}
            className="aspect-square bg-[#F4FDFF] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-sm border-4 border-white hover:shadow-xl hover:shadow-[#00C2FF]/10 transition-all duration-300"
          >
            <img
              src={`https://picsum.photos/seed/${i + 40}/600/600`}
              className="w-full h-full object-cover"
              alt="Post"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const StatItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex flex-col items-center md:items-start group cursor-pointer">
    <span className="font-black text-xl text-[#102A43] group-hover:text-[#00C2FF] transition-colors">
      {value}
    </span>
    <span className="text-[10px] text-[#102A43]/40 font-black uppercase tracking-tighter">
      {label}
    </span>
  </div>
);

const TabItem = ({
  icon,
  label,
  active,
}: {
  icon: any;
  label: string;
  active?: boolean;
}) => (
  <button
    className={cn(
      "flex items-center gap-2 py-5 border-b-4 transition-all relative group",
      active
        ? "border-[#00C2FF] text-[#00C2FF]"
        : "border-transparent text-[#102A43]/30 hover:text-[#102A43]/60",
    )}
  >
    <span
      className={cn(
        "transition-transform group-hover:scale-110",
        active && "animate-bounce",
      )}
    >
      {icon}
    </span>
    <span className="text-[11px] font-black uppercase tracking-[0.2em]">
      {label}
    </span>
  </button>
);

export default UserProfile;
