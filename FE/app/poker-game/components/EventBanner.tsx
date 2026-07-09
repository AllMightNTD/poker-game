import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Trophy, Sparkles, Coins, Zap, Megaphone } from "lucide-react";
import httpClient from "@/core/api/http-client";

interface BannerItem {
  id: string | number;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  color: string;
  icon: React.ReactNode;
}

const mapIcon = (iconType: string) => {
  switch (iconType) {
    case "Trophy":
      return <Trophy className="text-[#F4B942] w-12 h-12" />;
    case "Sparkles":
      return <Sparkles className="text-blue-400 w-12 h-12" />;
    case "Coins":
      return <Coins className="text-[#F4B942] w-12 h-12" />;
    case "Zap":
      return <Zap className="text-rose-400 w-12 h-12" />;
    default:
      return <Megaphone className="text-indigo-400 w-12 h-12" />;
  }
};

const STATIC_BANNERS: BannerItem[] = [
  {
    id: "s1",
    title: "Weekly Freeroll $5,000 GTD",
    subtitle: "Giải Đấu Miễn Phí Mỗi Chủ Nhật",
    description: "Đăng ký tham gia hoàn toàn miễn phí, thử thách bản lĩnh cùng 1,000+ cao thủ toàn quốc và rinh giải thưởng khủng.",
    badge: "Sự Kiện Hot",
    color: "from-amber-500/20 via-orange-600/10 to-[#0b141d]",
    icon: <Trophy className="text-[#F4B942] w-12 h-12" />,
  },
  {
    id: "s2",
    title: "Golden Spade Season 5",
    subtitle: "Mùa Giải Xếp Hạng Mới Đã Mở",
    description: "Leo rank tích điểm VPIP và Hand thắng để nhận ngay Avatar VIP đặc quyền, khung sảnh lấp lánh và hàng triệu chip thưởng.",
    badge: "Mùa Giải Mới",
    color: "from-blue-500/20 via-[#0a2540]/10 to-[#0b141d]",
    icon: <Sparkles className="text-blue-400 w-12 h-12" />,
  },
  {
    id: "s3",
    title: "Deposit Bonus: +100% Chips",
    subtitle: "Khuyến Mãi Nạp Đầu Không Giới Hạn",
    description: "Nhân đôi số phỉnh nạp đầu tiên vào tài khoản. Độc quyền hỗ trợ nạp rút siêu tốc trong 30 giây qua ngân hàng.",
    badge: "Khuyến Mãi",
    color: "from-emerald-500/20 via-teal-900/10 to-[#0b141d]",
    icon: <Coins className="text-[#F4B942] w-12 h-12" />,
  },
  {
    id: "s4",
    title: "Weekly Leaderboard Race",
    subtitle: "Đua Top Tuần - Nhận 50,000,000 Chips",
    description: "Top 3 người chơi tích lũy lợi nhuận Pot lớn nhất trong tuần sẽ nhận thưởng trực tiếp vào ví chính vào sáng Thứ 2.",
    badge: "Bảng Xếp Hạng",
    color: "from-rose-500/20 via-purple-900/10 to-[#0b141d]",
    icon: <Zap className="text-rose-400 w-12 h-12" />,
  },
];

export const EventBanner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState<BannerItem[]>(STATIC_BANNERS);

  useEffect(() => {
    const fetchActiveEvents = async () => {
      try {
        const res = await httpClient.get("/api/v1/lobby/events/active");
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const mappedBanners: BannerItem[] = res.data.map((event: any) => ({
            id: event.id,
            title: event.title,
            subtitle: event.subtitle,
            description: event.description,
            badge: event.badge,
            color: event.color_gradient || "from-amber-500/20 via-orange-600/10 to-[#0b141d]",
            icon: mapIcon(event.icon_type),
          }));
          setBanners(mappedBanners);
        } else {
          setBanners(STATIC_BANNERS);
        }
      } catch (e) {
        console.error("Lỗi lấy danh sách banner từ server:", e);
        setBanners(STATIC_BANNERS);
      }
    };

    fetchActiveEvents();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handlePrev = () => {
    if (banners.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    if (banners.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (banners.length === 0) return null;

  const current = banners[currentIndex] || banners[0];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[#F4B942]/10 bg-[#0b141d]/75 shadow-2xl backdrop-blur-md">
      {/* Banner background gradient slide */}
      <div
        className={`w-full h-full bg-gradient-to-r ${current.color} p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 transition-all duration-700 min-h-[180px] md:min-h-[220px]`}
      >
        <div className="flex-1 space-y-3 text-left">
          <span className="inline-block px-3 py-1 rounded-full bg-[#F4B942]/10 border border-[#F4B942]/20 text-[10px] font-black uppercase tracking-wider text-[#F4B942]">
            {current.badge}
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-[#F7EFDD] tracking-tight">
            {current.title}
          </h2>
          <h4 className="text-sm font-bold text-[#F4B942]/80">
            {current.subtitle}
          </h4>
          <p className="text-xs md:text-sm text-[#F7EFDD]/60 max-w-2xl leading-relaxed">
            {current.description}
          </p>
        </div>

        <div className="hidden md:flex shrink-0 w-24 h-24 bg-[#08121a]/80 border border-white/5 rounded-2xl items-center justify-center shadow-inner animate-pulse">
          {current.icon}
        </div>
      </div>

      {/* Navigation Controls */}
      {banners.length > 1 && (
        <div className="absolute right-4 bottom-4 flex items-center gap-1.5 z-20">
          <button
            onClick={handlePrev}
            className="w-8 h-8 rounded-lg bg-black/40 hover:bg-[#F4B942]/20 border border-white/5 hover:border-[#F4B942]/30 text-[#F7EFDD]/60 hover:text-white transition-all flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-1 px-1">
            {banners.map((_, idx) => (
              <span
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex ? "w-4 bg-[#F4B942]" : "w-1.5 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="w-8 h-8 rounded-lg bg-black/40 hover:bg-[#F4B942]/20 border border-white/5 hover:border-[#F4B942]/30 text-[#F7EFDD]/60 hover:text-white transition-all flex items-center justify-center cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
