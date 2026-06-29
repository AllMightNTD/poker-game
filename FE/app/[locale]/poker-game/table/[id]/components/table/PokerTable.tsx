"use client";

import React, { memo } from "react";
import { usePokerGame } from "../hooks/usePokerGame";
import { Seat } from "./Seat";
import { PotDisplay } from "./PotDisplay";
import { CommunityCards } from "./CommunityCards";
import { BoardStage } from "./BoardStage";

export const PokerTable = memo(function PokerTable() {
  const {
    tableRef,
    tableScale,
    tableBackground,
    getFeltStyles,
    players,
  } = usePokerGame();

  const felt = getFeltStyles(tableBackground);

  return (
    /* Centering wrapper — fills parent main, centers table with flexbox */
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">

      {/* ── The 850×480 table canvas ── */}
      <div
        ref={tableRef}
        className="relative w-[850px] h-[480px] shrink-0 rounded-[180px] border-[16px] border-amber-950/80 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95)] flex items-center justify-center"
        style={{
          transform: `scale(${tableScale})`,
          transformOrigin: "center center",
        }}
      >
        {/* Outer wood rail highlight */}
        <div className="absolute inset-0 rounded-[165px] border border-amber-600/20 pointer-events-none" />

        {/* Inner felt surface */}
        <div
          className={`absolute inset-2 rounded-[160px] bg-gradient-to-b ${felt.gradient} overflow-hidden shadow-[inset_0_6px_40px_rgba(0,0,0,0.85)]`}
        >
          {/* Subtle radial light at center */}
          <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(ellipse_60%_40%_at_center,_white,_transparent)] pointer-events-none" />
          {/* Inner border ring */}
          <div className={`absolute inset-10 rounded-[120px] border ${felt.line} pointer-events-none`} />
          {/* Second ring */}
          <div className={`absolute inset-16 rounded-[100px] border ${felt.line} opacity-50 pointer-events-none`} />
        </div>

        {/* Center HUD: Pot + Community Cards + Stage */}
        <div className="absolute flex flex-col items-center justify-center text-center space-y-2 z-20">
          <PotDisplay />
          <CommunityCards />
          <BoardStage />
        </div>

        {/* Player seats */}
        {players.map((player) => (
          <Seat key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
});
