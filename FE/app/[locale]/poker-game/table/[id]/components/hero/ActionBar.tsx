"use client";

import { useCurrentUser } from "@/core/providers/user-provider";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Minus, Plus } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { usePokerGame } from "../hooks/usePokerGame";
import { useResponsive } from "../hooks/useResponsive";
import { LinearTimer } from "../ui/Timer";

/** Format chip number to K / M shorthand */
function fmt(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${Math.round(val / 1_000)}K`;
  return val.toLocaleString("vi-VN");
}

export const ActionBar: React.FC = () => {
  const { isMobile } = useResponsive();
  const { currentUser } = useCurrentUser();
  const {
    players,
    pot,
    minRaise,
    maxRaise,
    raiseAmount,
    setRaiseAmount,
    handleUserAction,
    timerVal,
    maxTimerVal,
    currentHighestBet,
    ownerId,
    startGame,
    gameStage,
  } = usePokerGame();

  const [isRaiseMode, setIsRaiseMode] = useState(false);

  const hero = players.find((p) => p.isHero);
  const isHeroActive = hero?.isActive ?? false;
  const isHeroFolded = hero?.isFolded ?? false;

  const heroCurrentBet = parseInt(hero?.current_bet || "0");
  const callAmount = Math.max(0, currentHighestBet - heroCurrentBet);

  const [inputRaw, setInputRaw] = useState(
    minRaise.toLocaleString("vi-VN")
  );

  const potNum = parseInt(pot) || 0;
  const step = Math.max(1, Math.round((maxRaise - minRaise) / 100));

  // Keep input display in sync when raiseAmount changes via slider / quick-bet
  useEffect(() => {
    setInputRaw(raiseAmount.toLocaleString("vi-VN"));
  }, [raiseAmount]);

  /* ---- helpers ---- */
  const clamp = (v: number) => Math.min(maxRaise, Math.max(minRaise, v));

  const setPreset = useCallback(
    (val: number) => {
      const v = clamp(Math.round(val));
      setRaiseAmount(v);
      setIsRaiseMode(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [minRaise, maxRaise]
  );

  const handleInputChange = (raw: string) => {
    // Allow only digits
    const digits = raw.replace(/\D/g, "");
    if (!digits) { setInputRaw(""); return; }
    const num = parseInt(digits, 10);
    setInputRaw(num.toLocaleString("vi-VN"));
    setRaiseAmount(clamp(num));
  };

  const handleSlider = (val: number) => setRaiseAmount(val);

  const doAction = (action: string) => {
    handleUserAction(action, action === "raise" ? raiseAmount : 0);
    setIsRaiseMode(false);
  };

  const isAllIn = raiseAmount >= maxRaise;

  const raiseLabel = isAllIn
    ? `RAISE ${fmt(raiseAmount)} (ALL-IN)`
    : `RAISE ${fmt(raiseAmount)}`;

  /* Quick-bet presets */
  const quickBets = [
    { label: "MIN", val: minRaise },
    { label: "½ POT", val: potNum / 2 },
    { label: "POT", val: potNum },
    { label: "ALL-IN", val: maxRaise },
  ];

  const isHost = currentUser?.id === ownerId;
  const showStartButton = isHost && gameStage === "ended";

  if (showStartButton) {
    const canStart = players.length >= 2;
    return (
      <footer className="bg-slate-950/98 border-t border-slate-800/60 shrink-0 z-20">
        <div className="flex items-center justify-center p-4">
          <button
            onClick={startGame}
            disabled={!canStart}
            className={`w-full max-w-md py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 border shadow-lg
              ${canStart
                ? "bg-emerald-500 hover:bg-emerald-400 border-emerald-400 text-slate-950 shadow-emerald-900/20"
                : "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-50 shadow-none"
              }`}
          >
            Bắt đầu ván đấu
          </button>
        </div>
      </footer>
    );
  }

  /* ---- SPECTATOR state ---- */
  if (!hero) {
    return null;
  }

  /* ---- FOLDED state ---- */
  if (isHeroFolded) {
    return (
      <footer className="bg-slate-950/98 border-t border-slate-900 shrink-0 z-20">
        <div className="flex items-center justify-center py-4 text-slate-600">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Đã bỏ bài — Đang chờ ván tiếp theo...
          </span>
        </div>
      </footer>
    );
  }

  /* ---- NOT ACTIVE state (Someone else's turn or waiting) ---- */
  if (!isHeroActive) {
    const activePlayer = players.find((p) => p.isActive);
    return (
      <footer className="bg-slate-950/98 border-t border-slate-900 shrink-0 z-20">
        <div className="flex items-center justify-center py-4 text-slate-500 gap-2">
          {activePlayer ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Đang chờ lượt chơi của {activePlayer.name}...
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Đang chờ ván đấu bắt đầu...
              </span>
            </>
          )}
        </div>
      </footer>
    );
  }

  /* ---- MAIN RENDER ---- */
  return (
    <footer className="bg-slate-950/98 border-t border-slate-800/60 shrink-0 z-20">
      {/* Turn timer bar */}
      {isHeroActive && <LinearTimer value={timerVal} max={maxTimerVal} />}

      <div className={`flex flex-col gap-2 ${isMobile ? "p-2.5" : "p-3 md:p-4"}`}>

        {/* ── Row 1: FOLD | CHECK | CALL ── */}
        <div className="flex items-stretch gap-2">
          <button
            onClick={() => doAction("fold")}
            className="flex-1 py-3.5 rounded-xl border border-rose-600/40 hover:border-rose-500
              bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 font-black text-[11px]
              uppercase tracking-widest transition-all active:scale-95"
          >
            FOLD
          </button>

          <button
            onClick={() => doAction("check")}
            disabled={callAmount > 0}
            className={`flex-1 py-3.5 rounded-xl border font-black text-[11px]
              uppercase tracking-widest transition-all active:scale-95
              ${callAmount > 0
                ? "border-slate-800 bg-slate-950 text-slate-600 cursor-not-allowed opacity-50"
                : "border-slate-700 hover:border-slate-500 bg-slate-900/50 hover:bg-slate-900 text-slate-300"
              }`}
          >
            CHECK
          </button>

          <button
            onClick={() => doAction("call")}
            disabled={callAmount === 0}
            className={`flex-1 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all
              active:scale-95 shadow-lg border
              ${callAmount === 0
                ? "border-slate-800 bg-slate-950 text-slate-600 cursor-not-allowed opacity-50 shadow-none"
                : "bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-900/40 border-emerald-500"
              }`}
          >
            CALL {callAmount > 0 ? fmt(callAmount) : ""}
          </button>
        </div>

        {/* ── Raise expander: input + slider (only in RAISE mode) ── */}
        <AnimatePresence>
          {isRaiseMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-2 pb-1">

                {/* Custom amount input row */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreset(raiseAmount - step)}
                    className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700
                      text-slate-300 hover:text-white hover:border-slate-500
                      flex items-center justify-center transition-colors shrink-0 active:scale-95"
                  >
                    <Minus size={14} />
                  </button>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={inputRaw}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={minRaise.toLocaleString("vi-VN")}
                    className="flex-1 text-center bg-slate-900 border border-slate-700
                      focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30
                      rounded-xl py-2 px-3 text-amber-400 font-black text-sm
                      focus:outline-none transition-colors"
                  />

                  <button
                    onClick={() => setPreset(raiseAmount + step)}
                    className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700
                      text-slate-300 hover:text-white hover:border-slate-500
                      flex items-center justify-center transition-colors shrink-0 active:scale-95"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Range slider */}
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[9px] font-bold text-slate-600 uppercase shrink-0">Min</span>
                  <input
                    type="range"
                    min={minRaise}
                    max={maxRaise}
                    step={step}
                    value={raiseAmount}
                    onChange={(e) => handleSlider(parseInt(e.target.value))}
                    className="flex-1 h-1.5 rounded-full cursor-pointer accent-amber-500"
                  />
                  <span className="text-[9px] font-bold text-slate-600 uppercase shrink-0">All-In</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Row 2: Quick bets + RAISE confirm ── */}
        <div className="flex items-center gap-1.5">
          {quickBets.map((opt) => {
            const v = Math.round(opt.val);
            const isSelected = isRaiseMode && raiseAmount === clamp(v);
            return (
              <button
                key={opt.label}
                onClick={() => setPreset(opt.val)}
                className={`
                  flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider
                  transition-all border active:scale-95
                  ${isSelected
                    ? "bg-amber-500/20 border-amber-500/60 text-amber-300"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                  }
                `}
              >
                {opt.label}
              </button>
            );
          })}

          {/* RAISE button — enter mode OR confirm */}
          <button
            onClick={() => {
              if (!isRaiseMode) {
                setPreset(raiseAmount);   // enter mode with current amount
              } else {
                doAction("raise");        // confirm raise
              }
            }}
            className={`
              flex-[2] py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider
              transition-all active:scale-95 flex items-center justify-center gap-1 border
              ${isRaiseMode
                ? isAllIn
                  ? "bg-gradient-to-r from-rose-600 to-amber-500 border-amber-400 text-white shadow-lg"
                  : "bg-amber-500 hover:bg-amber-400 border-amber-400 text-slate-950 shadow-lg shadow-amber-900/30"
                : "bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-amber-400"
              }
            `}
          >
            {isRaiseMode
              ? <span className="truncate px-1">{raiseLabel}</span>
              : <><ChevronRight size={12} /> RAISE</>
            }
          </button>
        </div>
      </div>
    </footer>
  );
};
