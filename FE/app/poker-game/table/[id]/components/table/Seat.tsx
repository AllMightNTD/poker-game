import { useCurrentUser } from '@/core/providers/user-provider';
import api from '@/lib/axios';
import { Coins, User, X, UserPlus } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useAnimationRegistry } from '../effects/AnimationRegistryContext';
import { getSeatPositions } from '../constants';
import { usePokerGame } from '../hooks/usePokerGame';
import { useResponsive } from '../hooks/useResponsive';
import { Player } from '../types';
import ActionBubble from './ActionBubble';
import BetChipStack from './BetChipStack';
import DealerButton from './DealerButton';
import SeatAvatar from './SeatAvatar';
import { LevelBadge } from '../ui/LevelBadge';
import SeatCards from './SeatCards';
import SeatInfo from './SeatInfo';
import SeatPanel from './SeatPanel';
import SeatTimerRing from './SeatTimerRing';
import { PlayerHudPopup } from '../hud/PlayerHudPopup';

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
    Promise.resolve().then(() => {
      setAmount(Math.min(maxBuyIn, Math.max(minBuyIn, smallBlind * 100)));
    });
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
      showToast("Please enter a valid display name.", "error");
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
        showToast("Successfully joined the table!", "success");
      } else {
        showToast("Your request to join is pending host approval.", "success");
      }
      onSubmit();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMsg = error?.response?.data?.message || "Unable to process join request.";
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
              Register for Seat #{seatNumber}
            </h3>
          </div>
          <button onClick={onClose} disabled={isLoading} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-50">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Display name</label>
            <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} disabled={isLoading} placeholder="Enter name..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-200 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all disabled:opacity-50" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 flex justify-between">
              <span>Chips to bring</span>
              <span className="text-amber-500/80">Min: {minBuyIn.toLocaleString()} - Max: {maxBuyIn.toLocaleString()}</span>
            </label>
            <div className="relative">
              <input type="number" inputMode="numeric" value={amount || ""} onChange={(e) => handleAmountChange(parseInt(e.target.value))} onBlur={handleAmountBlur} disabled={isLoading} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-black text-amber-400 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all disabled:opacity-50" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 uppercase">Chips</div>
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
            Cancel
                                </button>
          <button onClick={handleJoin} disabled={isLoading} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
            {isLoading ? <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : isOwner ? "TAKE SEAT" : "SEND REQUEST"}
          </button>
        </div>
      </div>
    </div>
  );
};

interface SeatProps {
  seatNumber: number;
  player?: Player | null;
}

const Seat: React.FC<SeatProps> = ({
  seatNumber,
  player = null,
}) => {
  const { isMobile, isTablet } = useResponsive();
  const { ownerId, smallBlind, players, sitRequests, maxPlayers } = usePokerGame();
  const { currentUser } = useCurrentUser();

  const [isBuyInOpen, setIsBuyInOpen] = useState(false);
  const [isHudOpen, setIsHudOpen] = useState(false);

  const isOwner = currentUser?.id === ownerId;
  const heroSeatNumber = useMemo(() => players.find(p => p.isHero)?.seatIndex, [players]);
  const positions = useMemo(() => getSeatPositions(maxPlayers || 6, heroSeatNumber, isMobile || isTablet), [maxPlayers, heroSeatNumber, isMobile, isTablet]);
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

  const { registerSeat } = useAnimationRegistry();
  const seatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (seatRef.current) {
      registerSeat(seatNumber, seatRef.current);
    }
    return () => {
      registerSeat(seatNumber, null);
    };
  }, [seatNumber, registerSeat]);

  if (!player) {
    const isSeated = players.some((p) => p.id === currentUser?.id);
    const pendingReq = sitRequests?.find((r) => Number(r.seat_number) === seatNumber);
    const isPending = !!pendingReq;
    const isUserPending = sitRequests?.some((r) => r.user_id === currentUser?.id) || false;
    const isPendingOrSeated = isSeated || isUserPending;

    return (
      <>
        <div ref={seatRef} style={positionStyle} className="absolute z-10 -translate-x-1/2 -translate-y-1/2 w-[95px] sm:w-[150px] md:w-[220px]">
          {isPending ? (
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-slate-800 border-2 border-dashed border-amber-500/50 flex items-center justify-center overflow-hidden">
                {pendingReq.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pendingReq.avatar} alt="Pending Avatar" className="w-full h-full object-cover opacity-50 grayscale" />
                ) : (
                  <User className="w-4 h-4 text-slate-500" />
                )}
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
              className={`w-11 h-11 md:w-14 md:h-14 mx-auto rounded-full border border-[#E7C678]/20 bg-gradient-to-b from-[#1b1712]/45 to-[#0b0806]/60 flex flex-col items-center justify-center transition-all duration-300 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8),_0_2px_8px_rgba(0,0,0,0.5)] backdrop-blur-[2px] ${
                isPendingOrSeated 
                  ? 'opacity-40 cursor-not-allowed' 
                  : 'cursor-pointer hover:border-[#E7C678]/80 hover:from-[#2e261e]/60 hover:to-[#17120e]/80 hover:shadow-[0_0_15px_rgba(231,198,120,0.35),_inset_0_1px_2px_rgba(255,255,255,0.15)] hover:scale-105 group'
              }`}
            >
              <UserPlus className="w-4 h-4 md:w-5 md:h-5 text-[#E7C678]/45 group-hover:text-[#E7C678]/80 transition-colors duration-300 mb-0.5" />
              <span className="text-[7px] md:text-[8px] font-bold text-[#E7C678]/40 group-hover:text-[#E7C678]/80 transition-colors duration-300 uppercase tracking-[0.15em] leading-none">SIT</span>
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
      ref={seatRef}
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
      <SeatPanel
        isActive={player.isActive}
        isFolded={player.isFolded}
        isSittingOut={player.lastAction === 'Sit Out' || player.lastAction === 'Disconnected'}
      >

        {/* Avatar + Timer Ring */}
        <div
          onClick={() => setIsHudOpen(true)}
          className="relative z-30 shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
        >
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
          
          {/* Gamification Level Badge */}
          {(!player.isActive) && (
            <div className="absolute -bottom-1 -right-2 scale-[0.5] origin-bottom-right z-30 pointer-events-none">
              <LevelBadge 
                level={player.gamification_level || 'bronze'} 
                xp={player.gamification_xp || 0} 
                showProgress={false} 
                size="sm" 
              />
            </div>
          )}
        </div>

        {/* Info Box */}
        <SeatInfo
          name={displayName}
          chips={parseInt(player.chips || '0')}
          isHero={player.isHero}
          isMobile={isMobile}
          status={player.lastAction || ''}
          isBot={!!player.isBot}
          isActive={player.isActive}
        />

        {/* Hole Cards */}
        <SeatCards
          cards={player.cards || []}
          isFolded={player.isFolded}
          isHero={player.isHero}
          isMobile={isMobile}
        />

      </SeatPanel>

      {isHudOpen && (
        <PlayerHudPopup
          player={player}
          onClose={() => setIsHudOpen(false)}
        />
      )}
    </div>
  );
};

const areSeatsEqual = (prevProps: SeatProps, nextProps: SeatProps) => {
  if (prevProps.seatNumber !== nextProps.seatNumber) return false;

  const p1 = prevProps.player;
  const p2 = nextProps.player;

  if (!p1 && !p2) return true;
  if (!p1 || !p2) return false;

  if (
    p1.id !== p2.id ||
    p1.name !== p2.name ||
    p1.avatar !== p2.avatar ||
    p1.chips !== p2.chips ||
    p1.current_bet !== p2.current_bet ||
    p1.isActive !== p2.isActive ||
    p1.isDealer !== p2.isDealer ||
    p1.isSmallBlind !== p2.isSmallBlind ||
    p1.isBigBlind !== p2.isBigBlind ||
    p1.lastAction !== p2.lastAction ||
    p1.isFolded !== p2.isFolded ||
    p1.hasAllIn !== p2.hasAllIn ||
    p1.isHero !== p2.isHero ||
    p1.isBot !== p2.isBot
  ) {
    return false;
  }

  const c1 = p1.cards || [];
  const c2 = p2.cards || [];
  if (c1.length !== c2.length) return false;
  for (let i = 0; i < c1.length; i++) {
    if (c1[i].suit !== c2[i].suit || c1[i].rank !== c2[i].rank) {
      return false;
    }
  }

  return true;
};

Seat.displayName = 'Seat';
export default React.memo(Seat, areSeatsEqual);
