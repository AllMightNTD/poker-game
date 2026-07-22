import { useSocket } from "@/core/providers/SocketProvider";
import { Menu, MessageSquare, ScrollText, User } from "lucide-react";
import { memo, useEffect, useRef } from "react";
import { AnimationManager } from "../effects/AnimationManager";
import { AnimationRegistryProvider, useAnimationRegistry } from "../effects/AnimationRegistryContext";
import { ThrowableOverlay } from "../effects/ThrowableOverlay";
import { useGameAnimation } from "../effects/useGameAnimation";
import { ActionBar } from "../hero/ActionBar";
import { usePokerGame } from "../hooks/usePokerGame";
import { useResponsive } from "../hooks/useResponsive";
import { BotControlPanel } from "../hud/BotControlPanel";
import { PokerCard } from "../ui/PokerCard";
import { BoardStage } from "./BoardStage";
import { CommunityCards } from "./CommunityCards";
import { PotDisplay } from "./PotDisplay";
import Seat from "./Seat";

const PokerTableInner = memo(function PokerTableInner() {
  const { isMobile, isTablet } = useResponsive();
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
    tableName,
    smallBlind,
    bigBlind,
    currentHighestBet,
    showChat,
    setShowChat,
    showHistory,
    setShowHistory,
    setIsSettingsOpen,
    formatChipsVal,
    tableId,
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
    /* Environment layer - Translucent over base TableBackground */
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-transparent">

      {/* ── Floating Cash Game Info (Top Left) ── */}
      <div className="absolute top-[3%] left-[4%] z-30 bg-black/45 backdrop-blur-md border border-[#E7C678]/15 p-3 rounded-lg text-left pointer-events-auto select-text hidden md:block shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="text-[10px] font-black text-[#E7C678] tracking-[0.2em] uppercase mb-1">
          CASH GAME
        </div>
        <div className="text-[11px] font-bold text-white/95 tracking-wide">
          BLINDS: ${formatChipsVal(smallBlind)} / ${formatChipsVal(bigBlind)}
        </div>
        <div className="text-[9px] font-semibold text-white/40 tracking-wider uppercase mt-0.5">
          TABLE: {tableName || "7 - Vegas CG"}
        </div>
      </div>

      {/* Mobile/Tablet Menu Button (Top Left) */}
      <div className="absolute top-[3%] left-[4%] z-30 block md:hidden pointer-events-auto">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="px-3 py-1.5 bg-gradient-to-b from-[#1b1712] to-[#0b0806] border border-[#C99C3D]/40 rounded-lg text-[9px] font-black text-[#E7C678] tracking-widest uppercase shadow-md active:scale-95 transition-all"
        >
          MENU
        </button>
      </div>

      {/* ── Floating Header Buttons (Top Right) ── */}
      <div className="absolute top-[3%] right-[4%] z-30 flex items-center gap-2 pointer-events-auto">
        <BotControlPanel
          roomId={tableId}
          isRoomOwner={true}
          activeSeats={players}
        />
        {/* User Menu Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-b from-[#1b1712] to-[#0b0806] border border-[#C99C3D]/45 rounded-lg text-[9px] font-black text-[#E7C678] tracking-widest uppercase shadow-md hover:border-[#E7C678] hover:from-[#2e261e] hover:to-[#17120e] transition-all duration-200"
        >
          <User size={12} className="text-[#E7C678]" />
          {!isMobile && <span>User Menu</span>}
          <Menu size={10} className="text-[#E7C678] ml-0.5" />
        </button>

        {/* Chat Button */}
        <button
          onClick={() => setShowChat(!showChat)}
          className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[9px] font-black tracking-widest uppercase shadow-md transition-all duration-200 ${showChat
            ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-400"
            : "bg-gradient-to-b from-[#1b1712] to-[#0b0806] border-[#C99C3D]/45 text-[#E7C678] hover:border-[#E7C678] hover:from-[#2e261e] hover:to-[#17120e]"
            }`}
        >
          <MessageSquare size={12} />
          {!isMobile && <span>Chat</span>}
        </button>

        {/* History Button */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[9px] font-black tracking-widest uppercase shadow-md transition-all duration-200 ${showHistory
            ? "bg-amber-950/80 border-amber-500/60 text-amber-400"
            : "bg-gradient-to-b from-[#1b1712] to-[#0b0806] border-[#C99C3D]/45 text-[#E7C678] hover:border-[#E7C678] hover:from-[#2e261e] hover:to-[#17120e]"
            }`}
        >
          <ScrollText size={12} />
          {!isMobile && <span>History</span>}
        </button>
      </div>

      {/* ── The Responsive table canvas ── */}
      <div
        ref={tableRef}
        className={`relative w-full shrink-0 bg-gradient-to-b from-[#3a3530] via-[#1e1b18] to-[#0f0e0c] p-[8px] sm:p-[12px] md:p-[16px] shadow-[0_40px_100px_rgba(0,0,0,0.98),_inset_0_4px_8px_rgba(255,255,255,0.12),_inset_0_-4px_8px_rgba(0,0,0,0.95)] flex items-center justify-center transition-all duration-300
          ${isMobile || isTablet
            ? 'aspect-[1/1.55] max-w-[420px] sm:max-w-[480px] mx-4 my-2 rounded-[55px] sm:rounded-[70px]'
            : 'aspect-[1.8/1] md:aspect-[2.2/1] max-w-[1024px] mx-6 rounded-[100px] sm:rounded-[140px] md:rounded-[180px]'
          }`}
      >
        {/* Wood ring/race-track - Ebony Wood style */}
        <div
          className={`w-full h-full bg-gradient-to-b from-[#141210] via-[#0b0a09] to-[#050404] p-[8px] sm:p-[10px] md:p-[12px] shadow-[0_8px_20px_rgba(0,0,0,0.9),_inset_0_2px_4px_rgba(255,255,255,0.08),_inset_0_-2px_4px_rgba(0,0,0,0.9)] flex items-center justify-center border-t border-[#3a3530]/40 border-b border-[#0f0e0c]/40
            ${isMobile || isTablet ? 'rounded-[49px] sm:rounded-[62px]' : 'rounded-[92px] sm:rounded-[128px] md:rounded-[164px]'}`}
        >
          {/* Inner felt surface */}
          <div
            className={`w-full h-full relative overflow-hidden shadow-[inset_0_8px_30px_rgba(0,0,0,0.9)] transition-all duration-300 ${felt.gradient}
              ${isMobile || isTablet ? 'rounded-[43px] sm:rounded-[54px]' : 'rounded-[86px] sm:rounded-[120px] md:rounded-[154px]'}`}
          >
            {/* Subtle radial light at center for realistic felt texture */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12)_0%,_transparent_60%)] pointer-events-none" />

            {/* Gold trim inner border ring (Betting Line) */}
            <div
              className={`absolute border-2 ${felt.line} pointer-events-none opacity-80 transition-all duration-300
                ${isMobile || isTablet
                  ? 'inset-5 rounded-[26px] sm:rounded-[36px]'
                  : 'inset-6 sm:inset-10 md:inset-12 rounded-[70px] sm:rounded-[100px] md:rounded-[140px]'}`}
            />

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
          className={`absolute inset-0 pointer-events-none z-50 overflow-hidden
            ${isMobile || isTablet ? 'rounded-[55px] sm:rounded-[70px]' : 'rounded-[100px] sm:rounded-[140px] md:rounded-[180px]'}`}
        />

        {socket && <AnimationManager socket={socket} />}
        <ThrowableOverlay />

        {/* Center HUD: Pot + Community Cards + Stage/Bet */}
        <div className="absolute flex flex-col items-center justify-center text-center space-y-2 md:space-y-3 z-20 top-[26%] left-1/2 -translate-x-1/2">
          {waitingMessage && (
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-xl transition-all duration-300 ${waitingMessage.starting ? 'bg-amber-500/90 text-amber-950 animate-pulse' : 'bg-black/60 text-white/80'}`}>
              {waitingMessage.text}
            </div>
          )}
          <PotDisplay />
          <CommunityCards />

          {/* Round Bet chip indicator (BET: $120 style) */}
          {currentHighestBet > 0 ? (
            <div className="bg-[#0b2418]/90 border border-[#E7C678]/25 text-[#E7C678] font-black py-1 px-4 rounded-lg text-[10px] md:text-xs tracking-[0.12em] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5),_0_2px_6px_rgba(0,0,0,0.3)] backdrop-blur-[2px]">
              BET: ${formatChipsVal(String(currentHighestBet))}
            </div>
          ) : (
            <BoardStage />
          )}

          {gameStage === 'ended' && communityCards.length > 0 && communityCards.length < 5 && !rabbitCards && (
            <button
              onClick={triggerRabbitHunt}
              className="mt-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black text-xs font-black tracking-wider uppercase shadow-[0_0_12px_rgba(245,158,11,0.3)] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              🐰 Rabbit Hunt
            </button>
          )}

          {rabbitCards && rabbitCards.length > 0 && (
            <div className="mt-2 flex flex-col items-center gap-1">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/20">
                🐰 Rabbit Hunted
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
                All players are All-In! Do you agree to Run It Twice (deal two boards, split the pot)?
              </p>
              <div className="text-xs text-amber-300/60 font-mono">
                Vote: {ritVotesYesCount} / {ritVoters.length} Agree
              </div>
              <div className="flex gap-4 w-full mt-2">
                <button
                  onClick={() => voteRit(true)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-[0_4px_12px_rgba(16,185,129,0.3)] active:scale-95 transition-all cursor-pointer"
                >
                  Agree
                </button>
                <button
                  onClick={() => voteRit(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-600 hover:to-red-700 text-white text-sm font-bold shadow-[0_4px_12px_rgba(244,63,94,0.3)] active:scale-95 transition-all cursor-pointer"
                >
                  Rejected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Action HUD Fixed at Bottom ── */}
      <div className={`fixed left-1/2 -translate-x-1/2 w-full z-40 pointer-events-auto transition-all duration-300
        ${isMobile || isTablet
          ? "bottom-2 max-w-[420px] px-3"
          : "bottom-0 max-w-[700px] px-0 pb-1"
        }`}
      >
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

