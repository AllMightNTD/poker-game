import { useSocket } from "@/core/providers/SocketProvider";
import { memo } from "react";
import { AnimationManager } from "../effects/AnimationManager";
import { ActionBar } from "../hero/ActionBar";
import { usePokerGame } from "../hooks/usePokerGame";
import { BoardStage } from "./BoardStage";
import { CommunityCards } from "./CommunityCards";
import { PotDisplay } from "./PotDisplay";
import DealerDeck from "./DealerDeck";
import Seat from "./Seat";

export const PokerTable = memo(function PokerTable() {
  const {
    tableRef,
    tableScale,
    tableBackground,
    getFeltStyles,
    players,
    waitingMessage,
    maxPlayers,
  } = usePokerGame();

  const felt = getFeltStyles(tableBackground);
  const { socket } = useSocket();

  return (
    /* Environment layer - Dark Casino Room */
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,_#1a2421_0%,_#0a100c_100%)]">
      {/* ── The Responsive table canvas ── */}
      <div
        ref={tableRef}
        className="relative w-full max-w-[1024px] mx-2 md:mx-6 aspect-[1.6/1] sm:aspect-[1.8/1] md:aspect-[2.2/1] shrink-0 rounded-[100px] sm:rounded-[140px] md:rounded-[180px] border-[12px] sm:border-[18px] md:border-[24px] border-[#1a0f08] flex items-center justify-center"
        style={{
          boxShadow: '0 40px 100px -20px rgba(0,0,0,1), inset 0 10px 25px rgba(0,0,0,0.9), inset 0 0 15px rgba(255,180,100,0.05)',
          backgroundImage: 'linear-gradient(to bottom, #301910, #140804)'
        }}
      >
        {socket && <AnimationManager socket={socket} />}
        {/* Inner felt surface */}
        <div
          className={`absolute inset-0 sm:inset-1 md:inset-1.5 rounded-[85px] sm:rounded-[120px] md:rounded-[160px] overflow-hidden shadow-[inset_0_10px_40px_rgba(0,0,0,0.9),_inset_0_0_20px_rgba(0,0,0,0.8)] bg-gradient-to-br from-[#0c3321] to-[#062014]`}
        >
          {/* Subtle radial light at center for realistic felt texture */}
          <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,_transparent_60%)] pointer-events-none" />

          {/* Gold trim inner border ring (Betting Line) */}
          <div className={`absolute inset-8 sm:inset-12 md:inset-16 rounded-[70px] sm:rounded-[100px] md:rounded-[140px] border-2 border-[#F4B942]/30 pointer-events-none opacity-80`} />
        </div>

        {/* Center HUD: Pot + Community Cards + Stage */}
        <div className="absolute flex flex-col items-center justify-center text-center space-y-3 z-20 top-[15%]">
          {waitingMessage && (
            <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider backdrop-blur-sm shadow-xl transition-all duration-300 ${waitingMessage.starting ? 'bg-amber-500/90 text-amber-950 animate-pulse' : 'bg-black/60 text-white/80'}`}>
              {waitingMessage.text}
            </div>
          )}
          <PotDisplay />
          <CommunityCards />
          <BoardStage />
        </div>

        {/* Player seats */}
        {Array.from({ length: maxPlayers || 6 }, (_, i) => {
          const seatNumber = i + 1;
          const player = players.find((p) => p.seatIndex === seatNumber);
          return <Seat key={`seat-${seatNumber}`} seatNumber={seatNumber} player={player} />;
        })}
      </div>

      {/* ── Action HUD Fixed at Bottom ── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[600px] px-4 z-40 pointer-events-auto">
        <ActionBar />
      </div>
    </div>
  );
});
