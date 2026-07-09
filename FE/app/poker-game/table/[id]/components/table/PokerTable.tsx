import { useSocket } from "@/core/providers/SocketProvider";
import { memo, useEffect, useRef } from "react";
import { AnimationManager } from "../effects/AnimationManager";
import { ActionBar } from "../hero/ActionBar";
import { usePokerGame } from "../hooks/usePokerGame";
import { BoardStage } from "./BoardStage";
import { CommunityCards } from "./CommunityCards";
import { PotDisplay } from "./PotDisplay";
import { PokerCard } from "../ui/PokerCard";
import Seat from "./Seat";
import { AnimationRegistryProvider, useAnimationRegistry } from "../effects/AnimationRegistryContext";
import { useGameAnimation } from "../effects/useGameAnimation";

const PokerTableInner = memo(function PokerTableInner() {
  const {
    tableRef,
    tableBackground,
    getFeltStyles,
    players,
    waitingMessage,
    maxPlayers,
    isRitVotingActive,
    ritVotesYesCount,
    ritVoters,
    voteRit,
    gameStage,
    communityCards,
    rabbitCards,
    triggerRabbitHunt,
    cardDeckStyle,
  } = usePokerGame();

  const felt = getFeltStyles(tableBackground);
  const { socket } = useSocket();
  const { registerTableContainer, registerCenter } = useAnimationRegistry();
  const { setAnimationContainer } = useGameAnimation();
  const animContainerRef = useRef<HTMLDivElement | null>(null);

  // Hook registry coordinates
  useEffect(() => {
    if (tableRef.current) {
      registerTableContainer(tableRef.current);
    }
  }, [tableRef, registerTableContainer]);

  return (
    /* Environment layer - Dark Casino Room */
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,_#1a2421_0%,_#0a100c_100%)]">
      {/* ── The Responsive table canvas ── */}
      <div
        ref={tableRef}
        className="relative w-full max-w-[1024px] mx-2 md:mx-6 aspect-[1.6/1] sm:aspect-[1.8/1] md:aspect-[2.2/1] shrink-0 bg-gradient-to-b from-[#1c110b] to-[#0b0604] rounded-[100px] sm:rounded-[140px] md:rounded-[180px] p-[8px] sm:p-[12px] md:p-[16px] shadow-[0_30px_70px_rgba(0,0,0,0.95),_inset_0_4px_6px_rgba(255,255,255,0.1),_inset_0_-4px_6px_rgba(0,0,0,0.8)] flex items-center justify-center"
      >
        {/* Wood ring/race-track */}
        <div className="w-full h-full bg-gradient-to-b from-[#4d2d18] via-[#331c0e] to-[#1c0f07] rounded-[92px] sm:rounded-[128px] md:rounded-[164px] p-[6px] sm:p-[8px] md:p-[10px] shadow-[0_4px_10px_rgba(0,0,0,0.6),_inset_0_2px_4px_rgba(255,255,255,0.2)] flex items-center justify-center">
          {/* Inner felt surface */}
          <div
            className={`w-full h-full rounded-[86px] sm:rounded-[120px] md:rounded-[154px] relative overflow-hidden shadow-[inset_0_8px_25px_rgba(0,0,0,0.8)] ${felt.gradient}`}
          >
            {/* Subtle radial light at center for realistic felt texture */}
            <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15)_0%,_transparent_60%)] pointer-events-none" />

            {/* Gold trim inner border ring (Betting Line) */}
            <div className={`absolute inset-6 sm:inset-10 md:inset-12 rounded-[70px] sm:rounded-[100px] md:rounded-[140px] border-2 ${felt.line} pointer-events-none opacity-80`} />
            
            {/* Table visual center registration point */}
            <div ref={registerCenter} className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-0" />
          </div>
        </div>

        {/* Overlay container for running WAAPI animations */}
        <div 
          ref={(el) => {
            animContainerRef.current = el;
            setAnimationContainer(el);
          }} 
          className="absolute inset-0 pointer-events-none z-50 overflow-hidden rounded-[100px] sm:rounded-[140px] md:rounded-[180px]" 
        />

        {socket && <AnimationManager socket={socket} />}

        {/* Dealer Illustration */}
        <div className="absolute -top-[14%] left-1/2 -translate-x-1/2 w-[15%] md:w-[13%] aspect-[216/204] z-10 pointer-events-none drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/dealer_transparent.png" alt="Dealer" className="w-full h-full object-contain" />
        </div>

        {/* Chips Tray */}
        <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[12%] md:w-[10%] aspect-[174/44] z-20 pointer-events-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/chips_tray_transparent.png" alt="Chips Tray" className="w-full h-full object-contain" />
        </div>

        {/* Deck Shooter */}
        <div className="absolute top-[7.5%] left-[41.5%] -translate-x-1/2 w-[3.5%] md:w-[3%] aspect-[54/65] z-20 pointer-events-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/deck_shooter_transparent.png" alt="Deck Shooter" className="w-full h-full object-contain" />
        </div>

        {/* Discard Shoe */}
        <div className="absolute top-[7.5%] left-[58.5%] -translate-x-1/2 w-[7.5%] md:w-[6.5%] aspect-[112/85] z-20 pointer-events-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/discard_shoe_transparent.png" alt="Discard Shoe" className="w-full h-full object-contain" />
        </div>

        {/* Center HUD: Pot + Community Cards + Stage */}
        <div className="absolute flex flex-col items-center justify-center text-center space-y-2 md:space-y-4 z-20 top-[26%] left-1/2 -translate-x-1/2">
          {waitingMessage && (
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-xl transition-all duration-300 ${waitingMessage.starting ? 'bg-amber-500/90 text-amber-950 animate-pulse' : 'bg-black/60 text-white/80'}`}>
              {waitingMessage.text}
            </div>
          )}
          <PotDisplay />
          <CommunityCards />
          <BoardStage />

          {gameStage === 'ended' && communityCards.length > 0 && communityCards.length < 5 && !rabbitCards && (
            <button
              onClick={triggerRabbitHunt}
              className="mt-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black text-xs font-black tracking-wider uppercase shadow-[0_0_12px_rgba(245,158,11,0.3)] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              🐰 Săn thỏ (Rabbit Hunt)
            </button>
          )}

          {rabbitCards && rabbitCards.length > 0 && (
            <div className="mt-2 flex flex-col items-center gap-1">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/20">
                🐰 Thỏ săn được
              </span>
              <div className="flex gap-1.5 py-1">
                {rabbitCards.map((card, idx) => (
                  <div key={`rabbit-${idx}`} className="relative opacity-90 scale-90 border border-amber-500/30 rounded-lg overflow-hidden shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    <PokerCard
                      suit={card.suit}
                      rank={card.rank}
                      isFaceUp={true}
                      size="md"
                      deckStyle={cardDeckStyle}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Player seats */}
        {Array.from({ length: maxPlayers || 6 }, (_, i) => {
          const seatNumber = i + 1;
          const player = players.find((p) => p.seatIndex === seatNumber);
          return <Seat key={`seat-${seatNumber}`} seatNumber={seatNumber} player={player} />;
        })}

        {/* RIT Voting Modal Overlay */}
        {isRitVotingActive && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center rounded-[100px] sm:rounded-[140px] md:rounded-[180px] overflow-hidden">
            <div className="bg-[#14221d] border border-amber-500/40 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-[0_10px_50px_rgba(0,0,0,0.8)] text-center flex flex-col items-center gap-4">
              <div className="text-amber-400 text-lg font-extrabold uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                🔀 Run It Twice?
              </div>
              <p className="text-xs text-[#FDF1BA]/80 leading-relaxed">
                Tất cả người chơi đều All-In! Bạn có đồng ý Run It Twice (chia 2 board bài chung, chia đôi Pot) không?
              </p>
              <div className="text-xs text-amber-300/60 font-mono">
                Biểu quyết: {ritVotesYesCount} / {ritVoters.length} Đồng ý
              </div>
              <div className="flex gap-4 w-full mt-2">
                <button
                  onClick={() => voteRit(true)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-[0_4px_12px_rgba(16,185,129,0.3)] active:scale-95 transition-all cursor-pointer"
                >
                  Đồng ý
                </button>
                <button
                  onClick={() => voteRit(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-600 hover:to-red-700 text-white text-sm font-bold shadow-[0_4px_12px_rgba(244,63,94,0.3)] active:scale-95 transition-all cursor-pointer"
                >
                  Từ chối
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Action HUD Fixed at Bottom ── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[600px] px-4 z-40 pointer-events-auto">
        <ActionBar />
      </div>
    </div>
  );
});

export const PokerTable = memo(function PokerTable() {
  return (
    <AnimationRegistryProvider>
      <PokerTableInner />
    </AnimationRegistryProvider>
  );
});

