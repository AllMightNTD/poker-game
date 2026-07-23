"use client";

import { motion } from "framer-motion";
import { Coins } from "lucide-react";

// --- CG SVGs - Tối ưu nét vẽ mượt mà, sắc sảo ---
const HeartSuit = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`${className} fill-current filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]`} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const DiamondSuit = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`${className} fill-current filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]`} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L3.5 12 12 22l8.5-10L12 2z" />
  </svg>
);

const SpadeSuit = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`${className} fill-current filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]`} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C11.5 2 6 7.5 6 12c0 3.3 2.7 6 6 6s6-2.7 6-6c0-4.5-5.5-10-6-10zm1.5 14L15 21H9l1.5-5h3z" />
  </svg>
);

const ClubSuit = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`${className} fill-current filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]`} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8.5c1.4 0 2.5-1.1 2.5-2.5S13.4 3.5 12 3.5s-2.5 1.1-2.5 2.5 1.1 2.5 2.5 2.5zm-3.5 6c1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5-2.5 1.1-2.5 2.5 1.1 2.5 2.5 2.5zm7 0c1.4 0 2.5-1.1 2.5-2.5S16.9 9.5 15.5 9.5s-2.5 1.1-2.5 2.5 1.1 2.5 2.5 2.5zM12.5 13.5L14 20.5H10l1.5-7h1z" />
  </svg>
);

const SUIT_COLORS = {
  H: "text-red-600 drop-shadow-[0_1px_0px_rgba(255,255,255,0.8)]",
  D: "text-red-500 drop-shadow-[0_1px_0px_rgba(255,255,255,0.8)]",
  S: "text-neutral-900 drop-shadow-[0_1px_0px_rgba(255,255,255,0.5)]",
  C: "text-emerald-950 dark:text-neutral-950 drop-shadow-[0_1px_0px_rgba(255,255,255,0.5)]",
};

const SuitIcon = ({ suit, className = "w-4 h-4" }: { suit: "H" | "D" | "S" | "C"; className?: string }) => {
  const colorClass = SUIT_COLORS[suit];
  const fullClassName = `${className} ${colorClass}`;

  if (suit === "H") return <HeartSuit className={fullClassName} />;
  if (suit === "D") return <DiamondSuit className={fullClassName} />;
  if (suit === "S") return <SpadeSuit className={fullClassName} />;
  return <ClubSuit className={fullClassName} />;
};

const CardBackPattern = ({ styleType = "classic" }: { styleType?: "classic" | "modern" | "cyberpunk" }) => {
  const strokeColor =
    styleType === "modern"
      ? "text-cyan-400/20"
      : styleType === "cyberpunk"
        ? "text-yellow-400/25"
        : "text-amber-500/25";

  return (
    <svg viewBox="0 0 100 150" className={`w-full h-full mix-blend-overlay opacity-60 ${strokeColor}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={`card-back-grid-${styleType}`} width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M 6 0 L 6 12 M 0 6 L 12 6" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="6" cy="6" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.7" />
        </pattern>
      </defs>
      <rect width="100" height="150" fill={`url(#card-back-grid-${styleType})`} />
      {/* Tăng độ bo góc của khung viền pattern mặt sau từ rx="6" lên rx="12" để đồng bộ */}
      <rect x="4" y="4" width="92" height="142" rx="12" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    </svg>
  );
};

interface PokerCardProps {
  suit: "H" | "D" | "S" | "C" | "back" | "?" | string;
  rank: string;
  isFaceUp: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  deckStyle?: "classic" | "modern" | "cyberpunk";
}

export const PokerCard = ({ suit, rank, isFaceUp, size = "md", className = "", deckStyle = "classic" }: PokerCardProps) => {
  // THAY ĐỔI TẠI ĐÂY: Nâng cấp bán kính bo góc (border-radius) sâu và bầu bĩnh hơn theo chuẩn ảnh mẫu của bạn
  const sizeClasses = {
    xs: "w-[32px] h-[46px] rounded-[6px]",
    sm: "w-[40px] h-[58px] rounded-[8px]",
    md: "w-[64px] h-[92px] rounded-[14px]",
    lg: "w-[88px] h-[126px] rounded-[22px]",
  };

  const backGradient =
    deckStyle === "modern"
      ? "from-slate-900 via-indigo-950 to-neutral-950 border-indigo-500/60 shadow-[inset_0_0_12px_rgba(99,102,241,0.5)]"
      : deckStyle === "cyberpunk"
        ? "from-neutral-950 via-zinc-900 to-neutral-950 border-yellow-500/50 shadow-[inset_0_0_12px_rgba(234,179,8,0.4)]"
        : "from-red-800 via-red-950 to-stone-950 border-amber-600/60 shadow-[inset_0_0_15px_rgba(220,38,38,0.5)]";

  const tokenColor =
    deckStyle === "modern"
      ? "text-cyan-400 border-cyan-400/40 shadow-[0_0_10px_rgba(34,211,238,0.4)]"
      : deckStyle === "cyberpunk"
        ? "text-yellow-400 border-yellow-400/40 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
        : "text-amber-400 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]";

  const textColors = SUIT_COLORS[suit as keyof typeof SUIT_COLORS] || "text-neutral-900";

  return (
    <div className={`${sizeClasses[size]} relative ${className} transition-transform duration-200 hover:-translate-y-1`} style={{ perspective: 1200 }}>
      <motion.div
        className="w-full h-full relative select-none"
        initial={false}
        animate={{ rotateY: isFaceUp ? 0 : 180 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 220, damping: 22 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* --- MẶT TRƯỚC LÁ BÀI (FRONT FACE) --- */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-stone-50 via-white to-neutral-200 border border-neutral-300/80 shadow-[0_8px_20px_rgba(0,0,0,0.4),_inset_0_2px_2px_rgba(255,255,255,0.8),_inset_0_-2px_4px_rgba(0,0,0,0.08)] flex flex-col justify-between overflow-hidden rounded-[inherit]"
          style={{ backfaceVisibility: "hidden", padding: size === "xs" ? "2px" : size === "sm" ? "4px" : size === "md" ? "8px" : "12px" }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/60 pointer-events-none mix-blend-overlay z-20" />

          {/* Điều chỉnh lại viền 3D inset theo tỉ lệ bo góc mới giúp đường cong mềm mại hơn */}
          <div className="absolute inset-[3px] border border-black/[0.03] rounded-[calc(inherit-3px)] pointer-events-none z-10" />

          {/* Góc trên bên trái */}
          <div className="flex flex-col items-center leading-none text-left self-start relative z-10">
            <span className={`font-serif font-black tracking-tight ${size === "xs" ? "text-[10px]" : size === "sm" ? "text-xs" : size === "md" ? "text-lg" : "text-2xl"} ${textColors}`}>
              {rank}
            </span>
            {suit && suit !== "back" && suit !== "?" && (
              <SuitIcon suit={suit as any} className={`mt-0.5 ${size === "xs" ? "w-2.5 h-2.5" : size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5"}`} />
            )}
          </div>

          {/* Biểu tượng CG lớn ở trung tâm lá bài */}
          {size !== "sm" && suit && suit !== "back" && suit !== "?" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.9] z-0 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
              <SuitIcon suit={suit as any} className={size === "md" ? "w-9 h-9" : "w-14 h-14"} />
            </div>
          )}

          {/* Góc dưới bên phải (Xoay ngược 180 độ) */}
          <div className="flex flex-col items-center leading-none text-left self-end rotate-180 z-10 relative">
            <span className={`font-serif font-black tracking-tight ${size === "xs" ? "text-[10px]" : size === "sm" ? "text-xs" : size === "md" ? "text-lg" : "text-2xl"} ${textColors}`}>
              {rank}
            </span>
            {suit && suit !== "back" && suit !== "?" && (
              <SuitIcon suit={suit as any} className={`mt-0.5 ${size === "xs" ? "w-2.5 h-2.5" : size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5"}`} />
            )}
          </div>
        </div>

        {/* --- MẶT SAU LÁ BÀI (BACK FACE) --- */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${backGradient} border-2 shadow-[0_10px_25px_rgba(0,0,0,0.55),_inset_0_1px_2px_rgba(255,255,255,0.2)] flex items-center justify-center overflow-hidden rounded-[inherit]`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-bl from-white/20 via-transparent to-black/40 pointer-events-none z-10" />

          {/* Tăng độ bo góc đường chỉ viền trong mặt sau */}
          <div className={`absolute inset-[4px] border ${deckStyle === 'classic' ? 'border-amber-500/30' : 'border-white/10'} rounded-[calc(inherit-4px)] pointer-events-none`} />

          <div className="absolute inset-0 z-0">
            <CardBackPattern styleType={deckStyle} />
          </div>

          <div className={`absolute w-[44%] h-[44%] rounded-full border-2 ${tokenColor} flex items-center justify-center bg-gradient-to-b from-stone-900 to-neutral-950 shadow-[0_4px_10px_rgba(0,0,0,0.6),_inset_0_2px_4px_rgba(0,0,0,0.6)] z-20`}>
            <Coins className="w-[55%] h-[55%] filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)] animate-pulse" style={{ animationDuration: '3s' }} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};