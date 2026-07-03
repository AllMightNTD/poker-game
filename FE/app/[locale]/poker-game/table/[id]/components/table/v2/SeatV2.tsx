import React, { useMemo, useState, useEffect } from 'react';
import SeatAvatar from './SeatAvatar';
import SeatTimerRing from './SeatTimerRing';
import SeatInfo from './SeatInfo';
import SeatCards from './SeatCards';
import ActionBubble from './ActionBubble';
import BetChipStack from './BetChipStack';
import DealerButton from './DealerButton';
import SeatPanel from './SeatPanel';
import { useResponsive } from '../../hooks/useResponsive';
import { usePokerGame } from '../../hooks/usePokerGame';
import { Player } from '../../types';
import { getSeatPositions } from '../../constants';
import { useCurrentUser } from '@/core/providers/user-provider';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import { Coins, X, User } from 'lucide-react';
import { motion } from 'framer-motion';

// --- BuyInModal Logic ---
interface BuyInModalProps {
  seatNumber: number;
  smallBlind: number;
  defaultName: string;
  isOwner: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const BuyInModal: React.FC<BuyInModalProps> = ({ seatNumber, smallBlind, defaultName, isOwner, onClose, onSubmit }) => {
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
    if (isNaN(val)) setAmount(0);
    else setAmount(val);
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
        <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="text-emerald-400 w-4 h-4" />
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
              Đăng Ký Vào Ghế #{seatNumber}
            </h3>
          </div>
          <button onClick={onClose} disabled={isLoading} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-50">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Tên hiển thị</label>
            <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} disabled={isLoading} placeholder="Nhập tên..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-200 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all disabled:opacity-50" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 flex justify-between">
              <span>Số phỉnh mang vào</span>
              <span className="text-amber-500/80">Min: {minBuyIn.toLocaleString()} - Max: {maxBuyIn.toLocaleString()}</span>
            </label>
            <div className="relative">
              <input type="number" inputMode="numeric" value={amount || ""} onChange={(e) => handleAmountChange(parseInt(e.target.value))} onBlur={handleAmountBlur} disabled={isLoading} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-black text-amber-400 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all disabled:opacity-50" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 uppercase">Phỉnh</div>
            </div>
            <input type="range" min={minBuyIn} max={maxBuyIn} step={smallBlind} value={amount} onChange={(e) => setAmount(parseInt(e.target.value) || minBuyIn)} disabled={isLoading} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-50 mt-2" />
            <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase mt-1">
              <button onClick={() => !isLoading && setAmount(minBuyIn)} className="hover:text-slate-300 disabled:opacity-50" disabled={isLoading}>Min</button>
              <button onClick={() => !isLoading && setAmount(smallBlind * 100)} className="hover:text-slate-300 disabled:opacity-50" disabled={isLoading}>100 BB</button>
              <button onClick={() => !isLoading && setAmount(maxBuyIn)} className="hover:text-slate-300 disabled:opacity-50" disabled={isLoading}>Max</button>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-950/40 border-t border-slate-800/60 flex gap-2">
          <button onClick={onClose} disabled={isLoading} className="flex-1 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50">
            Hủy
          </button>
          <button onClick={handleJoin} disabled={isLoading} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
            {isLoading ? <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : isOwner ? "NGỒI VÀO BÀN" : "GỬI YÊU CẦU"}
          </button>
        </div>
      </div>
    </div>
  );
};

interface SeatV2Props {
  seatNumber: number;
  player?: Player | null;
}

const SeatV2: React.FC<SeatV2Props> = ({
  seatNumber,
  player = null,
}) => {
  const { isMobile } = useResponsive();
  const { gameStage, ownerId, smallBlind, players, sitRequests, maxPlayers } = usePokerGame();
  const { currentUser } = useCurrentUser();
  
  const [isBuyInOpen, setIsBuyInOpen] = useState(false);

  const isOwner = currentUser?.id === ownerId;
  const heroSeatNumber = useMemo(() => players.find(p => p.isHero)?.seatIndex, [players]);
  const positions = useMemo(() => getSeatPositions(maxPlayers || 6, heroSeatNumber), [maxPlayers, heroSeatNumber]);
  const pos = positions[seatNumber - 1] || positions[0];
  const positionStyle = { top: `${pos.top}%`, left: `${pos.left}%` };
  const actionEndTime = null;

  const isUserSeated = useMemo(() => players.some((p) => p.isHero), [players]);
  const displayName = useMemo(() => {
    if (!player) return '';
    if (player.isHero || player.isBot) return player.name || '';
    if (!isUserSeated) return `Player ${seatNumber}`;
    return player.name || '';
  }, [player, isUserSeated, seatNumber]);

  // Compute bet throw vector
  const betVector = useMemo(() => {
    const dx = 50 - pos.left;
    const dy = 50 - pos.top;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const distance = isMobile ? 50 : 80; // Distance to push chips towards center
    return { x: (dx / len) * distance, y: (dy / len) * distance };
  }, [pos.left, pos.top, isMobile]);

  // Compute card deal vector (from deck at 50, 38)
  const cardVector = useMemo(() => {
    const dx = 50 - pos.left;
    const dy = 38 - pos.top;
    // Approximate pixels (assuming average table width 800px -> 1% = 8px, height 400px -> 1% = 4px)
    return { x: dx * 8, y: dy * 4 };
  }, [pos.left, pos.top]);

  // Size classes for responsive avatar
  const avatarSizeClass = useMemo(() => {
    if (isMobile) return "w-10 h-10";
    if (typeof window !== "undefined" && window.innerWidth < 768) return "w-12 h-12";
    return player?.isHero ? "w-[72px] h-[72px]" : "w-16 h-16";
  }, [isMobile, player?.isHero]);

  // Ring size
  const ringSize = useMemo(() => {
    if (isMobile) return 46;
    if (typeof window !== "undefined" && window.innerWidth < 768) return 56;
    return player?.isHero ? 82 : 74;
  }, [isMobile, player?.isHero]);

  if (!player) {
    const isSeated = players.some((p) => p.id === currentUser?.id);
    const pendingReq = sitRequests?.find((r) => Number(r.seat_number) === seatNumber);
    const isPending = !!pendingReq;
    const isUserPending = sitRequests?.some((r) => r.user_id === currentUser?.id) || false;
    const isPendingOrSeated = isSeated || isUserPending;

    return (
      <>
        <div style={positionStyle} className="absolute z-10 -translate-x-1/2 -translate-y-1/2 w-[95px] sm:w-[150px] md:w-[220px]">
          {isPending ? (
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-slate-800 border-2 border-dashed border-amber-500/50 flex items-center justify-center overflow-hidden">
                {pendingReq.avatar ? <img src={pendingReq.avatar} alt="Pending Avatar" className="w-full h-full object-cover opacity-50 grayscale" /> : <User className="w-4 h-4 text-slate-500" />}
              </div>
              <div className="px-2 py-1 bg-slate-900/80 rounded-md border border-amber-500/30 backdrop-blur-sm">
                <span className="text-[8px] md:text-[10px] text-amber-400 font-bold whitespace-nowrap">Waiting...</span>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => {
                if (isPendingOrSeated) return;
                setIsBuyInOpen(true);
              }}
              className={`w-12 h-12 md:w-16 md:h-16 mx-auto rounded-full border border-white/20 bg-black/40 flex flex-col items-center justify-center transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md ${isPendingOrSeated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#F4B942]/60 hover:bg-black/60 hover:shadow-[0_0_20px_rgba(244,185,66,0.3)] hover:scale-105 group'}`}
            >
              <span className="text-white/60 group-hover:text-[#F4B942] text-[18px] font-light leading-none mb-0.5">+</span>
              <span className="text-[8px] md:text-[9px] font-black text-white/60 group-hover:text-[#F4B942] uppercase tracking-widest">Ngồi</span>
            </div>
          )}
        </div>
        
        {isBuyInOpen && (
          <BuyInModal
            seatNumber={seatNumber}
            smallBlind={parseInt(smallBlind || '50', 10)}
            defaultName={currentUser?.name || "Player"}
            isOwner={isOwner}
            onClose={() => setIsBuyInOpen(false)}
            onSubmit={() => setIsBuyInOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <div 
      style={positionStyle} 
      className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center
        w-[110px] sm:w-[160px] md:w-[220px]
        ${player.isActive ? 'z-40' : 'z-20'}`}
    >
      {/* 3D Chip Stack for Bets */}
      <BetChipStack amount={parseInt(player.current_bet || '0')} throwVector={betVector} />

      {/* Action Bubble */}
      <ActionBubble action={player.lastAction || ''} />

      {/* Main Seat Container */}
      <SeatPanel isActive={player.isActive} isHero={player.isHero} isFolded={player.isFolded}>
        
        {/* Avatar + Timer Ring */}
        <div className="relative shrink-0">
          {player.isActive && <SeatTimerRing endTime={actionEndTime} size={ringSize} maxTime={30000} />}
          <SeatAvatar 
            avatarUrl={player.avatar || ''} 
            isFolded={player.isFolded} 
            isActive={player.isActive} 
            isHero={player.isHero} 
            sizeClass={avatarSizeClass} 
          />
          {/* Dealer Button */}
          {player.isDealer && <DealerButton />}
        </div>

        {/* Info Box */}
        <SeatInfo 
          name={displayName} 
          chips={parseInt(player.chips || '0')} 
          isHero={player.isHero} 
          isMobile={isMobile} 
          status={player.lastAction || ''} 
          isBot={!!player.isBot} 
        />

        {/* Hole Cards */}
        <SeatCards 
          cards={player.cards || []} 
          isFolded={player.isFolded} 
          isHero={player.isHero} 
          gameStage={gameStage} 
          isMobile={isMobile} 
        />
        
      </SeatPanel>
    </div>
  );
};
SeatV2.displayName = 'SeatV2';
export default React.memo(SeatV2);
