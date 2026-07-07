"use client";

import { useCurrentUser } from "@/core/providers/user-provider";
import React, { useMemo } from "react";
import { usePokerGame } from "../hooks/usePokerGame";
import { PokerPlayer } from "../types";
import { LinearTimer } from "../ui/Timer";
import { betOrRaiseLabel, computeCallAmount } from "../utils/raiseCalculator";
import { ActionButtons } from "./action-bar/ActionButton";
import { RaisePanel } from "./action-bar/RaisePanel";
import { StartGamePanel } from "./action-bar/StartGamePanel";
import { TableStatusBanner } from "./action-bar/TableStatusBanner";
import { useRaiseController } from "./useRaiseController";

export const ActionBar: React.FC = () => {
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
    muckOption,
    setMuckOption,
  } = usePokerGame();

  const allPlayers = players as PokerPlayer[];
  const hero = allPlayers.find((p) => p.isHero);
  const heroCurrentBet = parseInt(hero?.current_bet || "0");
  const heroStack = hero?.stack !== undefined ? Number(hero.stack) : undefined;
  const potNum = parseInt(pot) || 0;

  // Cap the call amount to the hero's real stack — a legal call can never
  // exceed what the hero actually has (a genuine all-in call).
  const callAmount = useMemo(
    () => computeCallAmount(currentHighestBet, heroCurrentBet, heroStack),
    [currentHighestBet, heroCurrentBet, heroStack]
  );
  const isCallAllIn = !!heroStack && callAmount > 0 && callAmount >= heroStack;
  // "Bet" when nobody has opened the street yet, "Raise" once there's a bet
  // to build on top of — standard poker terminology.
  const raiseOrBetLabel = betOrRaiseLabel(currentHighestBet);

  const controller = useRaiseController({
    minRaise,
    maxRaise,
    raiseAmount,
    setRaiseAmount,
    potNum,
    callAmount,
  });

  const doAction = (action: string) => {
    handleUserAction(action, action === "raise" ? raiseAmount : 0);
    controller.closeRaiseMode();
  };

  const isHost = currentUser?.id === ownerId;
  if (isHost && gameStage === "waiting") {
    return <StartGamePanel canStart={allPlayers.length >= 2} onStart={startGame} />;
  }

  if (!hero) return null;

  const muckOptionBar = (
    <div className="flex justify-end items-center px-2 py-1 text-xs text-[#FDF1BA]/70 select-none">
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={muckOption}
          onChange={(e) => setMuckOption(e.target.checked)}
          className="rounded border-[#FDF1BA]/20 bg-black/40 text-amber-500 focus:ring-amber-500/50 w-3.5 h-3.5 cursor-pointer"
        />
        <span>Tự động úp bài (Auto Muck)</span>
      </label>
    </div>
  );

  if (hero.isFolded) return (
    <div className="w-full flex flex-col">
      {muckOptionBar}
      <TableStatusBanner variant="folded" />
    </div>
  );
  if (!hero.isActive) {
    const activePlayer = allPlayers.find((p) => p.isActive);
    return (
      <div className="w-full flex flex-col">
        {muckOptionBar}
        <TableStatusBanner variant="waiting-turn" activePlayerName={activePlayer?.name} />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col relative">
      {muckOptionBar}
      <div className="w-full rounded-t-md overflow-hidden mb-1">
        <LinearTimer value={timerVal} max={maxTimerVal} />
      </div>

      <RaisePanel
        visible={controller.isRaiseMode && !controller.forcedAllIn}
        minRaise={minRaise}
        maxRaise={maxRaise}
        raiseAmount={raiseAmount}
        controller={controller}
      />

      <ActionButtons
        callAmount={callAmount}
        isCallAllIn={isCallAllIn}
        raiseOrBetLabel={raiseOrBetLabel}
        isRaiseMode={controller.isRaiseMode}
        isAllIn={controller.isAllIn}
        raiseAmount={raiseAmount}
        canRaise={maxRaise >= minRaise && maxRaise > callAmount}
        onFold={() => doAction("fold")}
        onCheck={() => doAction("check")}
        onCall={() => doAction("call")}
        onRaiseButtonClick={() =>
          controller.isRaiseMode ? doAction("raise") : controller.openRaiseMode()
        }
      />
    </div>
  );
};

export default ActionBar;

