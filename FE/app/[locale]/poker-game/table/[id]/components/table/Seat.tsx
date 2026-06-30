"use client";

import { useCurrentUser } from "@/core/providers/user-provider";
import api from "@/lib/axios";
import { motion } from "framer-motion";
import { Coins, User, X } from "lucide-react";
import { useParams } from "next/navigation";
import React, { memo, useEffect, useState } from "react";
import { seatPositions } from "../constants";
import { usePokerGame } from "../hooks/usePokerGame";
import { useResponsive } from "../hooks/useResponsive";
import { Player } from "../types";
import { PokerCard } from "../ui/PokerCard";

interface SeatProps {
  seatNumber: number;
  player?: Player | null;
}

const ACTION_STYLE: Record<string, string> = {
  Fold: "bg-rose-950/90 border-rose-500/60 text-rose-300",
  Check: "bg-slate-800/90 border-slate-600 text-slate-400",
};

function getActionStyle(action: string) {
  if (ACTION_STYLE[action]) return ACTION_STYLE[action];
  if (action.includes("Raise") || action.includes("Bet") || action.includes("All"))
    return "bg-amber-950/90 border-amber-500/60 text-amber-300";
  return "bg-emerald-950/90 border-emerald-500/60 text-emerald-300";
}

/** Position chip: D / SB / BB */
const PositionChip = ({ label, color }: { label: string; color: string }) => (
  <div
    className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-black border border-slate-950 shadow-md z-20 ${color}`}
  >
    {label}
  </div>
);

const getBetOffset = (seatNum: number, isMobile: boolean) => {
  const scale = isMobile ? 0.75 : 1;
  switch (seatNum) {
    case 1: // Top middle
      return { top: `${64 * scale}px`, left: "50%", transform: "translateX(-50%)" };
    case 2: // Right
      return { top: `${35 * scale}px`, left: `-${64 * scale}px` };
    case 3: // Bottom right
      return { top: `-${35 * scale}px`, left: `-${64 * scale}px` };
    case 4: // Bottom middle (Hero)
      return { bottom: `${64 * scale}px`, left: "50%", transform: "translateX(-50%)" };
    case 5: // Bottom left
      return { top: `-${35 * scale}px`, right: `-${64 * scale}px` };
    case 6: // Left
      return { top: `${35 * scale}px`, right: `-${64 * scale}px` };
    default:
      return { top: "0px", left: "0px" };
  }
};

interface BuyInModalProps {
  seatNumber: number;
  smallBlind: number;
  defaultName: string;
  isOwner: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const BuyInModal: React.FC<BuyInModalProps> = ({
  seatNumber,
  smallBlind,
  defaultName,
  isOwner,
  onClose,
  onSubmit,
}) => {
  const params = useParams();
  const tableId = params?.id as string;
  const { showToast, minBuyin, maxBuyin } = usePokerGame();

  const minBuyIn = minBuyin || (smallBlind * 40);
  const maxBuyIn = maxBuyin || (smallBlind * 200);
  const [amount, setAmount] = useState(smallBlind * 100);
  const [customName, setCustomName] = useState(defaultName || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAmount(Math.min(maxBuyIn, Math.max(minBuyIn, smallBlind * 100)));
  }, [minBuyin, maxBuyin, smallBlind, minBuyIn, maxBuyIn]);

  const handleAmountChange = (val: number) => {
    if (isNaN(val)) {
      setAmount(0);
    } else {
      setAmount(val);
    }
  };

  const handleAmountBlur = () => {
    if (amount < minBuyIn) setAmount(minBuyIn);
    if (amount > maxBuyIn) setAmount(maxBuyIn);
  };

  const handleJoin = async () => {
    if (!customName || customName.trim().length === 0) {
      showToast("Vui lòng nhập tên hiển thị hợp lệ.", "error");
      return;
    }
    if (amount < minBuyIn || amount > maxBuyIn) {
      showToast(`Số phỉnh phải từ ${minBuyIn.toLocaleString()} đến ${maxBuyIn.toLocaleString()}`, "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(`/api/v1/rooms/${tableId}/seats/join`, {
        seat_number: seatNumber,
        display_name: customName,
        buy_in_chips: amount,
      });

      const data = response.data;
      if (data.auto_approved) {
        showToast("Tham gia bàn chơi thành công!", "success");
      } else {
        showToast("Yêu cầu xin ngồi của bạn đang chờ chủ phòng duyệt.", "success");
      }
      onSubmit();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Không thể thực hiện yêu cầu tham gia.";
      showToast(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="text-emerald-400 w-4 h-4" />
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
              Đăng Ký Vào Ghế #{seatNumber}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-7 h-7 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Custom Name Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Tên hiển thị
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              disabled={isLoading}
              placeholder="Nhập tên của bạn..."
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold uppercase tracking-wider focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Custom Stack Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Số phỉnh buy-in (Min: {minBuyIn.toLocaleString()} - Max: {maxBuyIn.toLocaleString()})
            </label>
            <input
              type="number"
              min={minBuyIn}
              max={maxBuyIn}
              value={amount || ""}
              onChange={(e) => handleAmountChange(parseInt(e.target.value))}
              onBlur={handleAmountBlur}
              disabled={isLoading}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-black tracking-wider focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Slider input */}
          <div className="space-y-1 pt-2">
            <input
              type="range"
              min={minBuyIn}
              max={maxBuyIn}
              step={smallBlind * 2 || 10}
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || minBuyIn)}
              disabled={isLoading}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-50"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase mt-1">
              <button onClick={() => !isLoading && setAmount(minBuyIn)} className="hover:text-slate-300 disabled:opacity-50" disabled={isLoading}>Min</button>
              <button onClick={() => !isLoading && setAmount(smallBlind * 100)} className="hover:text-slate-300 disabled:opacity-50" disabled={isLoading}>100 BB</button>
              <button onClick={() => !isLoading && setAmount(maxBuyIn)} className="hover:text-slate-300 disabled:opacity-50" disabled={isLoading}>Max</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/40 border-t border-slate-800/60 flex gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleJoin}
            disabled={isLoading}
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isLoading ? (
              <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : isOwner ? (
              "NGỒI VÀO BÀN"
            ) : (
              "GỬI YÊU CẦU"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const Seat = memo(function Seat({ seatNumber, player }: SeatProps) {
  const {
    gameStage,
    cardDeckStyle,
    timerVal,
    maxTimerVal,
    formatChipsVal,
    players,
    smallBlind,
    ownerId,
    sitRequests,
  } = usePokerGame();
  const params = useParams();
  const tableId = params?.id as string;
  const { isMobile } = useResponsive();
  const { currentUser } = useCurrentUser();
  const [isBuyInOpen, setIsBuyInOpen] = useState(false);

  const pos = seatPositions[seatNumber - 1] || seatPositions[0];
  const isOwner = currentUser?.id === ownerId;

  if (!player) {
    const isSeated = players.some((p) => p.id === currentUser?.id);
    const pendingReq = sitRequests?.find((r) => Number(r.seat_number) === seatNumber);
    const isPending = !!pendingReq;
    const isUserPending = sitRequests?.some((r) => r.user_id === currentUser?.id) || false;
    const isPendingOrSeated = isSeated || isUserPending;

    return (
      <>
        <motion.div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
          style={{ top: pos.top, left: pos.left }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {isPending ? (
            (() => {
              const displayName = pendingReq.username || "Người chơi";
              const avatarUrl = pendingReq.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName)}`;
              return (
                <div
                  className={`
                    relative bg-slate-950/95 border border-amber-500/40 rounded-2xl flex items-center shadow-[0_0_15px_rgba(245,158,11,0.25)]
                    transition-all duration-300 scale-95 opacity-80
                    ${isMobile ? "w-[72px] p-1 gap-1" : "w-28 md:w-32 p-1.5 md:p-2 gap-1.5 md:gap-2"}
                  `}
                >
                  {/* Avatar with pulsing yellow border */}
                  <div className="relative shrink-0">
                    <div
                      className={`rounded-xl bg-slate-900 border overflow-hidden flex items-center justify-center border-amber-500/50
                        ${isMobile ? "w-7 h-7" : "w-8 h-8 md:w-10 md:h-10"}
                      `}
                    >
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Name + Pending status */}
                  <div className="min-w-0 flex-1">
                    {!isMobile && (
                      <p className="text-[10px] font-black text-slate-200 uppercase truncate leading-tight">
                        {displayName}
                      </p>
                    )}
                    <p className="text-[8px] font-bold text-amber-500 uppercase tracking-widest leading-none mt-0.5 animate-pulse">
                      Đang Chờ...
                    </p>
                  </div>
                </div>
              );
            })()
          ) : isPendingOrSeated ? (
            <div
              className={`
                relative bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl flex items-center justify-center shadow-inner
                ${isMobile ? "w-[72px] h-9" : "w-28 md:w-32 h-11 md:h-12"}
              `}
            >
              <span className="text-[9px] font-bold text-slate-700 uppercase">Ghế trống</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 items-center">
              <button
                onClick={() => setIsBuyInOpen(true)}
                className={`
                  relative bg-slate-900/60 hover:bg-slate-900/90 border border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl flex items-center justify-center gap-1.5 shadow-2xl transition-all duration-300 group
                  ${isMobile ? "w-[72px] h-9" : "w-28 md:w-32 h-11 md:h-12"}
                `}
              >
                <div className="w-5 h-5 rounded-lg bg-slate-950/60 flex items-center justify-center border border-slate-800 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 text-slate-500 group-hover:text-emerald-400 transition-all">
                  <span className="text-xs font-bold font-mono">+</span>
                </div>
                <span className="text-[9px] font-black text-slate-400 group-hover:text-emerald-400 uppercase tracking-wider transition-colors">Ngồi</span>
              </button>
              {isOwner && (
                <button
                  onClick={async () => {
                    try {
                      await api.post(`/v1/lobby/${tableId}/bots/add`, {
                        seat_number: seatNumber,
                        buy_in_chips: 5000,
                      });
                    } catch (err: any) {
                      alert(err.response?.data?.message || err.message);
                    }
                  }}
                  className="text-[8px] font-black text-slate-500 hover:text-amber-500 transition-colors uppercase tracking-widest"
                >
                  + Add Bot
                </button>
              )}
            </div>
          )}
        </motion.div>

        {isBuyInOpen && (
          <BuyInModal
            seatNumber={seatNumber}
            smallBlind={parseInt(smallBlind) || 50}
            defaultName={currentUser?.username || currentUser?.email?.split('@')[0] || ""}
            isOwner={isOwner}
            onClose={() => setIsBuyInOpen(false)}
            onSubmit={() => {
              setIsBuyInOpen(false);
            }}
          />
        )}
      </>
    );
  }

  const isHero = player.isHero;

  const chipDisplay = (() => {
    const n = parseInt(player.chips);
    if (isMobile)
      return n >= 1_000_000
        ? `${(n / 1_000_000).toFixed(1)}M`
        : n >= 1_000
          ? `${Math.round(n / 1_000)}K`
          : String(n);
    return formatChipsVal(player.chips);
  })();

  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
      style={{ top: pos.top, left: pos.left }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* Bot removal button for Host */}
      {player.isBot && isOwner && (
        <button
          onClick={async () => {
            if (confirm(`Bạn có chắc chắn muốn xóa Bot ${player.name}?`)) {
              try {
                await api.post(`/v1/lobby/${tableId}/bots/remove`, {
                  seat_number: seatNumber,
                });
              } catch (err: any) {
                alert(err.response?.data?.message || err.message);
              }
            }
          }}
          className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-slate-900 hover:bg-rose-950 border border-slate-700 hover:border-rose-500 flex items-center justify-center text-slate-400 hover:text-rose-400 shadow-md z-30 transition-all cursor-pointer"
        >
          <X size={8} />
        </button>
      )}
      {/* Active bet chips badge */}
      {player && player.current_bet && parseInt(player.current_bet) > 0 && (
        <div
          className="absolute z-30 flex items-center gap-1 bg-slate-950/90 border border-slate-700/60 rounded-full px-2 py-0.5 shadow-xl whitespace-nowrap"
          style={getBetOffset(seatNumber, isMobile)}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white/20 flex items-center justify-center shadow-sm">
            <span className="text-[5px] text-slate-950 font-black">c</span>
          </div>
          <span className="text-[9px] font-black text-amber-400">
            {parseInt(player.current_bet).toLocaleString()}
          </span>
        </div>
      )}

      {/* Hole cards — above panel */}
      {!player.isFolded && player.cards && player.cards.length > 0 && (
        <div className="absolute -top-[22px] left-1/2 -translate-x-1/2 flex -space-x-2.5 z-30 pointer-events-none">
          {player.cards.map((card, cIdx) => (
            <PokerCard
              key={`hole-${player.id}-${cIdx}`}
              suit={card.suit}
              rank={card.rank}
              isFaceUp={isHero || gameStage === "showdown"}
              size={isMobile ? "sm" : isHero ? "md" : "sm"}
              deckStyle={cardDeckStyle}
              className={`shadow-lg ${cIdx === 0 ? "-rotate-6 translate-y-[2px]" : "rotate-6"
                }`}
            />
          ))}
        </div>
      )}

      {/* Player panel */}
      <div
        className={`
          relative bg-slate-950/95 border rounded-2xl flex items-center shadow-2xl
          transition-all duration-300
          ${isMobile ? "w-[72px] p-1 gap-1" : "w-28 md:w-32 p-1.5 md:p-2 gap-1.5 md:gap-2"}
          ${player.isActive
            ? "border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.35)] scale-105"
            : player.isFolded
              ? "border-slate-800 opacity-35 grayscale"
              : player.hasAllIn
                ? "border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                : "border-slate-700"
          }
        `}
      >
        {/* Active timer bar */}
        {player.isActive && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div
              className="absolute bottom-0 left-0 h-[3px] bg-emerald-400 transition-all duration-1000"
              style={{ width: `${(timerVal / maxTimerVal) * 100}%` }}
            />
          </div>
        )}
        {/* Active glow ring animation */}
        {player.isActive && (
          <div className="absolute inset-0 rounded-2xl ring-2 ring-emerald-400/50 animate-pulse pointer-events-none" />
        )}

        {/* Avatar + position badges */}
        <div className="relative shrink-0">
          <div
            className={`rounded-xl bg-slate-900 border overflow-hidden flex items-center justify-center
              ${isMobile ? "w-7 h-7" : "w-8 h-8 md:w-10 md:h-10"}
              ${player.isActive ? "border-emerald-400" : "border-slate-700"}
            `}
          >
            {player.avatar ? (
              <img
                src={player.avatar}
                alt={player.name}
                className={`w-full h-full object-cover ${player.lastAction === "MẤT MẠNG" ? "opacity-30 blur-[1px]" : ""}`}
              />
            ) : (
              <User size={isMobile ? 10 : 12} className="text-slate-500" />
            )}
            {player.lastAction === "MẤT MẠNG" && (
              <div className="absolute inset-0 bg-rose-950/80 flex items-center justify-center text-[7px] md:text-[8px] font-black text-rose-300 uppercase select-none animate-pulse">
                Offline
              </div>
            )}
          </div>
          {/* D / SB / BB badge — only one can show */}
          {player.isDealer && (
            <PositionChip label="D" color="bg-amber-400 text-slate-950" />
          )}
          {player.isSmallBlind && !player.isDealer && (
            <PositionChip label="SB" color="bg-blue-500 text-white" />
          )}
          {player.isBigBlind && !player.isDealer && (
            <PositionChip label="BB" color="bg-violet-500 text-white" />
          )}
        </div>

        {/* Name + chips */}
        <div className="min-w-0 flex-1">
          {!isMobile && (
            <p className="text-[9px] md:text-[10px] font-black text-slate-200 truncate leading-tight uppercase tracking-wide flex items-center gap-1">
              {player.name}
              {player.isBot && (
                <span className="bg-amber-500/20 text-amber-400 text-[6px] px-1 py-0.2 rounded font-black border border-amber-500/30">BOT</span>
              )}
            </p>
          )}
          <p
            className={`font-bold text-amber-400 leading-tight ${isMobile ? "text-[8px]" : "text-[9px] md:text-[10px] mt-0.5"
              }`}
          >
            {chipDisplay}
          </p>
          {player.hasAllIn && (
            <p className="text-[7px] font-black text-amber-500 uppercase">ALL-IN</p>
          )}
        </div>
      </div>

      {/* Action badge — hidden for hero (shown in ActionBar instead) */}
      {player.lastAction && !isHero && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute -bottom-5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md
            text-[8px] font-black uppercase tracking-wider border shadow-md whitespace-nowrap
            ${getActionStyle(player.lastAction)}`}
        >
          {player.lastAction}
        </motion.div>
      )}
    </motion.div>
  );
});
