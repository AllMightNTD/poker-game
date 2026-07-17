import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect } from "react";
import { getSeatPositions } from "../constants";
import { usePokerGame } from "../hooks/usePokerGame";
import { WinnerData } from "../types";
import { useAnimationTimeline } from "./useAnimationTimeline";
import WinnerBanner from "./winner-banner/WinnerBanner";
import { useGameAnimation } from "./useGameAnimation";

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

// Confetti fallback for big wins
const getPseudoRand = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const Confetti: React.FC = () => {
  const particles = React.useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => {
      const left = getPseudoRand(i + 1) * 100;
      const delay = getPseudoRand(i + 2) * 2;
      const duration = 2 + getPseudoRand(i + 3) * 2;
      const color = ["#F4B942", "#E23744", "#38BDF8", "#34D399", "#22D3EE"][i % 5];
      return { left, delay, duration, color };
    });
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, x: `${p.left}%`, rotate: 0, opacity: 1 }}
          animate={{ y: "100%", rotate: 360, opacity: 0 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "linear", repeat: Infinity }}
          className="absolute w-2.5 h-5 rounded-xs"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
};



export const AnimationManager: React.FC<AnimationManagerProps> = ({ socket }) => {
  const { currentStep, activePayload, triggerWinnerTimeline } = useAnimationTimeline();
  const { maxPlayers, players } = usePokerGame();
  const { animateDealing, animateBetting, animateFold, animatePotCollect, animatePotDistribute } = useGameAnimation();

  const maxPlayersVal = maxPlayers || 9;
  const heroSeatNumber = players.find(p => p.isHero)?.seatIndex;

  // Trigger WAAPI animations when step transitions
  useEffect(() => {
    if (!activePayload) return;

    if (currentStep === "COLLECT_POT_TO_CENTER") {
      activePayload.winners.forEach((winner) => {
        animatePotCollect(winner.seatNumber);
      });
    } else if (currentStep === "FLY_CHIPS_TO_WINNERS") {
      activePayload.winners.forEach((winner) => {
        const chipCount = Math.min(15, Math.max(3, Math.floor(winner.amountWon / 1000)));
        for (let i = 0; i < chipCount; i++) {
          animatePotDistribute(winner.seatNumber, i * 60);
        }
      });
    }
  }, [currentStep, activePayload, animatePotCollect, animatePotDistribute]);

  useEffect(() => {
    if (!socket) return;

    // 1. Listen for new hand start to animate dealing cards
    const handleHandStarted = (data: { seats?: any[] }) => {
      // Find active players that will receive cards
      const activeSeats = data.seats 
        ? data.seats.filter(s => s.status === "active").map(s => s.seatIndex)
        : players.filter(p => !p.isFolded && p.chips !== "0").map(p => p.seatIndex);
      
      if (activeSeats.length === 0) return;

      // Deal 2 cards to each player sequentially (Round 1 then Round 2)
      let cardCounter = 0;
      for (let round = 0; round < 2; round++) {
        activeSeats.forEach((seatNum) => {
          const delay = cardCounter * 120; // 120ms between each card deal
          const isHero = players.find(p => p.seatIndex === seatNum)?.isHero || false;
          animateDealing(seatNum, delay, isHero);
          cardCounter++;
        });
      }
    };

    // 2. Listen for actions to animate betting and folding
    const handleActionRecorded = (data: { seat_number: number; action_type?: string; action?: string; amount?: number }) => {
      const action = (data.action_type || data.action || "").toLowerCase();
      
      if (action === "fold") {
        animateFold(data.seat_number);
      } else if (["bet", "call", "raise", "allin"].includes(action) && (data.amount || 0) > 0) {
        animateBetting(data.seat_number);
      }
    };

    // 3. Listen for street advanced to collect current bets into center pot
    const handleStreetAdvanced = () => {
      // Collect chips from any player who has made a bet in this street
      players.forEach((p) => {
        const betAmount = parseInt(p.current_bet || "0", 10);
        if (betAmount > 0) {
          animatePotCollect(p.seatIndex);
        }
      });
    };

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

    socket.on("table:hand-started", handleHandStarted);
    socket.on("table:action-recorded", handleActionRecorded);
    socket.on("table:street-advanced", handleStreetAdvanced);
    socket.on("table:hand-ended", handleHandEnded);

    return () => {
      socket.off("table:hand-started", handleHandStarted);
      socket.off("table:action-recorded", handleActionRecorded);
      socket.off("table:street-advanced", handleStreetAdvanced);
      socket.off("table:hand-ended", handleHandEnded);
    };
  }, [socket, players, triggerWinnerTimeline, animateDealing, animateBetting, animateFold, animatePotCollect]);

  if (!activePayload) return null;

  const hasBigWin = activePayload.winners.some((w: WinnerData) => w.isBigWin);

  return (
    <>
      <AnimatePresence>
        {currentStep === "HIGHLIGHT_WINNERS" && (
          <WinnerHighlight winners={activePayload.winners} maxPlayers={maxPlayersVal} heroSeatNumber={heroSeatNumber} />
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