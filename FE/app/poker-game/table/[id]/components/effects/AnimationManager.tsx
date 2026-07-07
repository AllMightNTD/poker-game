import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { getSeatPositions } from "../constants";
import { usePokerGame } from "../hooks/usePokerGame";
import { WinnerData } from "../types";
import { useAnimationTimeline } from "./useAnimationTimeline";
import WinnerBanner from "./winner-banner/WinnerBanner";

interface AnimationManagerProps {
  socket: any;
}

// 1. Seat Highlight for Winners
const WinnerHighlight: React.FC<{ winners: WinnerData[]; maxPlayers: number; heroSeatNumber?: number }> = ({
  winners,
  maxPlayers,
  heroSeatNumber,
}) => {
  const positions = getSeatPositions(maxPlayers, heroSeatNumber);
  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {winners.map((winner) => {
        const pos = positions[winner.seatNumber - 1];
        if (!pos) return null;
        return (
          <motion.div
            key={winner.userId}
            className="absolute pointer-events-none flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2"
            style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
          >
            {/* Highlight Ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.06, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute w-[110px] sm:w-[150px] md:w-[200px] h-[110px] sm:h-[150px] md:h-[200px] rounded-full border-4 border-[#F4B942] shadow-[0_0_30px_rgba(244,185,66,0.6)]"
            />

            {/* Net Gain Text Popup */}
            {winner.netGainLoss !== undefined && winner.netGainLoss > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1, 1, 0], y: -80, scale: 1.2 }}
                transition={{ duration: 2.5, ease: "easeOut", delay: 0.5 }}
                className="absolute z-50 text-2xl md:text-4xl font-black tracking-wider"
                style={{
                  color: "#4ade80",
                  textShadow: "0px 4px 10px rgba(74, 222, 128, 0.8), 0px 0px 20px rgba(0,0,0,0.8)",
                  WebkitTextStroke: "1px #14532d",
                }}
              >
                +${winner.netGainLoss.toLocaleString()}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

// 2. Collect Pot to Center
const PotCollector: React.FC<{ winners: WinnerData[]; maxPlayers: number }> = ({
  winners,
  maxPlayers,
}) => {
  console.log('winners', winners);

  const positions = getSeatPositions(maxPlayers);
  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {winners.map((winner) => {
        const startPos = positions[winner.seatNumber - 1] || { top: 50, left: 50 };
        return (
          <motion.div
            key={winner.userId}
            initial={{ top: `${startPos.top}%`, left: `${startPos.left}%`, scale: 1, opacity: 1 }}
            animate={{ top: "38%", left: "50%", scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute w-8 h-8 -ml-4 -mt-4 bg-gradient-to-br from-[#F4B942] to-[#E0942A] rounded-full border-2 border-white/40 shadow-lg flex items-center justify-center text-xs font-black text-slate-950"
          >
            $
          </motion.div>
        );
      })}
    </div>
  );
};

// 3. Fly Chips from Center to Winners
const FlyingChips: React.FC<{ winners: WinnerData[]; maxPlayers: number }> = ({
  winners,
  maxPlayers,
}) => {
  const positions = getSeatPositions(maxPlayers);
  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {winners.map((winner) => {
        const targetPos = positions[winner.seatNumber - 1] || { top: 50, left: 50 };
        // Scale number of chips visually (min 5, max 25) based on win amount
        const chipCount = Math.min(25, Math.max(5, Math.floor(winner.amountWon / 500)));
        return Array.from({ length: chipCount }).map((_, i) => (
          <motion.div
            key={`${winner.userId}-${i}`}
            initial={{ top: "38%", left: "50%", scale: 0.5, opacity: 0 }}
            animate={{
              top: `${targetPos.top}%`,
              left: `${targetPos.left}%`,
              scale: 1,
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 1.0 + (Math.random() * 0.4), // slightly randomize duration
              delay: i * 0.05,
              ease: "easeOut",
            }}
            className="absolute w-6 h-6 -ml-3 -mt-3 bg-gradient-to-br from-[#F4B942] to-[#C9861C] rounded-full border border-white/20 shadow-md flex items-center justify-center text-[10px] font-black text-slate-900"
          >
            $
          </motion.div>
        ));
      })}
    </div>
  );
};

// Confetti fallback for big wins
const Confetti: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: 40 }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = 2 + Math.random() * 2;
        const color = ["#F4B942", "#E23744", "#38BDF8", "#34D399", "#A78BFA"][i % 5];
        return (
          <motion.div
            key={i}
            initial={{ y: -20, x: `${left}%`, rotate: 0, opacity: 1 }}
            animate={{ y: "100%", rotate: 360, opacity: 0 }}
            transition={{ duration, delay, ease: "linear", repeat: Infinity }}
            className="absolute w-2.5 h-5 rounded-xs"
            style={{ backgroundColor: color }}
          />
        );
      })}
    </div>
  );
};

// 5. Next Hand Countdown
const NextHandOverlay: React.FC = () => {
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900/95 border border-[#F4B942]/25 rounded-2xl px-6 py-4 flex flex-col items-center gap-2 shadow-2xl"
      >
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Chuẩn bị ván tiếp theo
        </span>
        <div className="text-3xl font-black text-[#F4B942] animate-pulse">
          Bắt đầu sau {seconds}s
        </div>
      </motion.div>
    </div>
  );
};

export const AnimationManager: React.FC<AnimationManagerProps> = ({ socket }) => {
  const { currentStep, activePayload, triggerWinnerTimeline } = useAnimationTimeline();
  const { maxPlayers, players } = usePokerGame();

  const maxPlayersVal = maxPlayers || 9;
  const heroSeatNumber = players.find(p => p.isHero)?.seatIndex;

  useEffect(() => {
    if (!socket) return;

    const handleHandEnded = (data: { winners: any[]; total_pot: number }) => {
      const formattedWinners: WinnerData[] = [];
      data.winners.forEach((w) => {
        const userId = w.user_id || w.username || w.seat_number.toString();
        const handName = w.hand_name || "Winner";
        const playerName = w.display_name || w.username || `Player ${w.seat_number}`;
        const isBigWin = (w.win_amount || 0) > 1000000;

        if (w.pots && w.pots.length > 0) {
          w.pots.forEach((p: any) => {
            formattedWinners.push({
              userId,
              playerName,
              seatNumber: w.seat_number,
              amountWon: p.amount,
              netGainLoss: w.net_gain_loss,
              handName,
              potLabel: p.label,
              isBigWin,
            });
          });
        } else {
          formattedWinners.push({
            userId,
            playerName,
            seatNumber: w.seat_number,
            amountWon: w.win_amount || 0,
            netGainLoss: w.net_gain_loss,
            handName,
            isBigWin,
          });
        }
      });

      console.log('formattedWinners', formattedWinners);


      triggerWinnerTimeline(formattedWinners, data.total_pot || 0);
    };

    socket.on("table:hand-ended", handleHandEnded);

    return () => {
      socket.off("table:hand-ended", handleHandEnded);
    };
  }, [socket, triggerWinnerTimeline]);

  if (!activePayload) return null;

  const hasBigWin = activePayload.winners.some((w: WinnerData) => w.isBigWin);


  return (
    <>
      <AnimatePresence>
        {currentStep === "HIGHLIGHT_WINNERS" && (
          <WinnerHighlight winners={activePayload.winners} maxPlayers={maxPlayersVal} heroSeatNumber={heroSeatNumber} />
        )}

        {currentStep === "COLLECT_POT_TO_CENTER" && (
          <PotCollector winners={activePayload.winners} maxPlayers={maxPlayersVal} />
        )}

        {currentStep === "FLY_CHIPS_TO_WINNERS" && (
          <FlyingChips winners={activePayload.winners} maxPlayers={maxPlayersVal} />
        )}

        {currentStep === "SHOW_BANNER" && (
          <>
            <WinnerBanner handName={activePayload.handName} winners={activePayload.winners} />
            {hasBigWin && <Confetti />}
          </>
        )}
      </AnimatePresence>
    </>
  );
};