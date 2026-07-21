"use client";

import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Bot,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { handsApi } from "../api/blogsApi";
import type { HandAction, HandData, HandPlayer } from "../types";

// ─── Card rendering helper ─────────────────────────────────────────────────────
const SUIT_COLORS: Record<string, string> = {
  H: "text-red-400",
  D: "text-red-400",
  S: "text-slate-200",
  C: "text-slate-200",
};
const SUIT_SYMBOLS: Record<string, string> = {
  H: "♥",
  D: "♦",
  S: "♠",
  C: "♣",
};

function CardChip({ code }: { code: string }) {
  const rank = code.slice(0, -1);
  const suit = code.slice(-1).toUpperCase();
  return (
    <div className="inline-flex flex-col items-center justify-center w-8 h-11 bg-white rounded-md shadow-md text-xs font-black leading-none select-none">
      <span className={`${SUIT_COLORS[suit] ?? "text-slate-900"} text-sm`}>{rank}</span>
      <span className={`${SUIT_COLORS[suit] ?? "text-slate-900"} text-base leading-none`}>
        {SUIT_SYMBOLS[suit] ?? suit}
      </span>
    </div>
  );
}

function parseCards(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw.split(",").map((c) => c.trim()).filter(Boolean);
}

// ─── Action badge ─────────────────────────────────────────────────────────────
const ACTION_STYLES: Record<string, string> = {
  fold: "bg-slate-700/60 text-slate-400",
  check: "bg-blue-900/50 text-blue-300",
  call: "bg-green-900/50 text-green-300",
  raise: "bg-yellow-900/50 text-yellow-300",
  bet: "bg-orange-900/50 text-orange-300",
  allin: "bg-red-800/70 text-red-200 font-black",
  timeout: "bg-slate-800 text-slate-600",
};

function ActionBadge({ action }: { action: HandAction }) {
  const label =
    Number(action.amount) > 0
      ? `${action.action_type} ${Number(action.amount).toLocaleString()}`
      : action.action_type;
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs uppercase tracking-wide ${
        ACTION_STYLES[action.action_type] ?? "bg-slate-700 text-slate-400"
      }`}
    >
      {label}
      {action.is_all_in && " 🔥"}
    </span>
  );
}

// ─── Mini poker table SVG display ────────────────────────────────────────────
function MiniTable({
  players,
  currentAction,
  communityCards,
}: {
  players: HandPlayer[];
  currentAction: HandAction | null;
  communityCards: string[];
}) {
  const maxSeats = 9;
  const seats = Array.from({ length: maxSeats }, (_, i) => i + 1);

  // Seat positions around an ellipse
  const angleStep = (2 * Math.PI) / maxSeats;
  const rx = 42; // percent radius x
  const ry = 35; // percent radius y
  const cx = 50;
  const cy = 50;

  const seatPos = (seat: number) => {
    const angle = angleStep * (seat - 1) - Math.PI / 2;
    return {
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
    };
  };

  const playerBySeat = Object.fromEntries(players.map((p) => [p.seat_number, p]));

  return (
    <div className="relative w-full" style={{ paddingBottom: "60%" }}>
      <div className="absolute inset-0 rounded-[50%] bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 border-4 border-emerald-700/40 shadow-inner shadow-black/40 m-8" />

      {/* Community cards */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1">
        {communityCards.map((c, i) => (
          <CardChip key={i} code={c} />
        ))}
        {communityCards.length === 0 && (
          <span className="text-emerald-700 text-xs italic">No community cards</span>
        )}
      </div>

      {/* Seats */}
      {seats.map((seat) => {
        const pos = seatPos(seat);
        const player = playerBySeat[seat];
        const isActive = currentAction?.seat_number === seat;
        const isFolded =
          !player ||
          (currentAction && currentAction.action_type === "fold" && currentAction.seat_number === seat);

        return (
          <div
            key={seat}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <motion.div
              animate={isActive ? { scale: 1.15 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`flex flex-col items-center ${isFolded ? "opacity-30" : ""}`}
            >
              {/* Avatar circle */}
              <div
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold
                  ${isActive ? "border-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.8)]" : "border-slate-600"}
                  ${player ? "bg-slate-800 text-slate-200" : "bg-slate-900 text-slate-700 border-dashed"}`}
              >
                {player ? player.user_name.slice(0, 2).toUpperCase() : seat}
              </div>
              {player && (
                <div className="text-[9px] text-slate-400 mt-0.5 text-center max-w-[48px] truncate">
                  {player.user_name}
                </div>
              )}
              {isActive && (
                <ActionBadge action={currentAction!} />
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Replayer Component ───────────────────────────────────────────────────
export function PokerHandReplayer({ handId }: { handId: string }): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="my-8 rounded-2xl bg-slate-900 border border-slate-700 p-8 flex items-center justify-center gap-3 text-slate-500">
          <Loader2 size={20} className="animate-spin" />
          <span>Loading Hand Replayer...</span>
        </div>
      }
    >
      <ReplayerInner handId={handId} />
    </Suspense>
  );
}

function ReplayerInner({ handId }: { handId: string }): React.ReactElement {
  const [step, setStep] = useState(-1); // -1 = before first action
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200); // ms per step
  const [showAiCoach, setShowAiCoach] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data } = useSuspenseQuery<HandData>({
    queryKey: ["hand-replayer", handId],
    queryFn: () => handsApi.getById(handId),
  });

  const aiCoachMutation = useMutation({
    mutationFn: () => handsApi.requestAiCoach(handId),
  });

  const actions = data?.actions ?? [];
  const totalSteps = actions.length;
  const currentAction = step >= 0 && step < totalSteps ? actions[step] : null;

  // Auto-play
  const stopPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    intervalRef.current = setInterval(() => {
      setStep((prev) => {
        if (prev >= totalSteps - 1) {
          stopPlay();
          return prev;
        }
        return prev + 1;
      });
    }, speed);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed, totalSteps, stopPlay]);

  const handlePlay = () => {
    if (step >= totalSteps - 1) setStep(-1);
    setIsPlaying(true);
  };

  const communityCards = parseCards(data?.hand.community_cards);

  // Filter community cards based on current stage
  const stageRevealedCards = (): string[] => {
    if (!currentAction) return [];
    const stage = currentAction.stage;
    if (stage === "preflop") return [];
    if (stage === "flop") return communityCards.slice(0, 3);
    if (stage === "turn") return communityCards.slice(0, 4);
    return communityCards;
  };

  const STAGES = ["preflop", "flop", "turn", "river"] as const;
  const currentStageIndex = currentAction ? STAGES.indexOf(currentAction.stage) : -1;


  return (
    <div
      id={`hand-replayer-${handId}`}
      className="my-10 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 font-black text-sm">🃏 HAND REPLAYER</span>
          {data.hand.table_name && (
            <span className="text-slate-600 text-xs">— {data.hand.table_name}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-600 text-xs">
            Pot: <span className="text-yellow-400">{Number(data.hand.total_pot).toLocaleString()}</span>
          </span>
          <span className="text-slate-700 text-xs">{data.players.length} players</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Table visualization */}
        <div className="flex-1 p-4">
          <MiniTable
            players={data.players}
            currentAction={currentAction}
            communityCards={stageRevealedCards()}
          />

          {/* Stage indicator */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {STAGES.map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <span
                  className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${
                    i === currentStageIndex
                      ? "bg-yellow-500 text-black"
                      : i < currentStageIndex
                      ? "text-slate-500"
                      : "text-slate-700"
                  }`}
                >
                  {s}
                </span>
                {i < 3 && <ChevronRight size={10} className="text-slate-700" />}
              </div>
            ))}
          </div>

          {/* Player cards (hero reveal at end) */}
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            {data.players.map((p) => {
              const cards = parseCards(p.hole_cards);
              const showCards = step >= totalSteps - 1 && cards.length > 0;
              return (
                <div key={p.user_id} className="flex flex-col items-center gap-1">
                  <div
                    className={`text-[10px] text-center font-medium truncate max-w-[56px] ${
                      p.is_winner ? "text-yellow-400" : "text-slate-500"
                    }`}
                  >
                    {p.is_winner && "👑 "}
                    {p.user_name}
                  </div>
                  <div className="flex gap-0.5">
                    {showCards ? (
                      cards.map((c, i) => <CardChip key={i} code={c} />)
                    ) : (
                      <>
                        <div className="w-8 h-11 bg-slate-800 border border-slate-700 rounded-md flex items-center justify-center text-slate-700 text-xs">?</div>
                        <div className="w-8 h-11 bg-slate-800 border border-slate-700 rounded-md flex items-center justify-center text-slate-700 text-xs">?</div>
                      </>
                    )}
                  </div>
                  <div className={`text-[9px] ${Number(p.net_gain_loss) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {Number(p.net_gain_loss) >= 0 ? "+" : ""}
                    {Number(p.net_gain_loss).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: action timeline + AI Coach */}
        <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col">
          {/* Timeline */}
          <div className="flex-1 p-3 overflow-y-auto max-h-64 lg:max-h-none">
            <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Timeline</div>
            <div className="space-y-1">
              {actions.map((action, i) => (
                <motion.button
                  key={action.id}
                  onClick={() => { stopPlay(); setStep(i); }}
                  className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all ${
                    i === step
                      ? "bg-yellow-500/15 border border-yellow-500/30"
                      : i < step
                      ? "opacity-40"
                      : "hover:bg-slate-800"
                  }`}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="text-[9px] text-slate-600 w-4 shrink-0">{i + 1}</span>
                  <span className="text-xs text-slate-400 truncate max-w-[80px]">{action.user_name}</span>
                  <ActionBadge action={action} />
                </motion.button>
              ))}
            </div>
          </div>

          {/* AI Coach section */}
          <div className="border-t border-slate-800 p-3">
            <button
              onClick={() => {
                setShowAiCoach(true);
                if (!aiCoachMutation.data && !aiCoachMutation.isPending) {
                  aiCoachMutation.mutate();
                }
              }}
              disabled={aiCoachMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs font-bold transition-all disabled:opacity-60"
              id={`btn-ai-coach-${handId}`}
            >
              {aiCoachMutation.isPending ? (
                <><Loader2 size={12} className="animate-spin" /> Analyzing...</>
              ) : (
                <><Bot size={12} /> AI Coach Feedback</>
              )}
            </button>

            <AnimatePresence>
              {showAiCoach && aiCoachMutation.data && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <div className="p-3 bg-teal-950/40 border border-teal-800/30 rounded-xl">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Bot size={11} className="text-teal-400" />
                      <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">
                        Gemini AI Coach
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {aiCoachMutation.data.analysis}
                    </div>
                    <div className="text-[9px] text-slate-600 mt-2 text-right">
                      {new Date(aiCoachMutation.data.generated_at).toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              )}
              {showAiCoach && aiCoachMutation.isError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-xs text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg p-2"
                >
                  ⚠️ Failed to connect to AI Coach. Try again later.
                                                  </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-t border-slate-800">
        <button
          onClick={() => { stopPlay(); setStep(-1); }}
          className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Back to top"
        >
          <SkipBack size={16} />
        </button>

        <button
          onClick={isPlaying ? stopPlay : handlePlay}
          className="flex items-center gap-2 px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg text-sm transition-all"
          id={`btn-play-${handId}`}
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          {isPlaying ? "Pause" : step >= totalSteps - 1 ? "Replay" : "Play"}
        </button>

        <button
          onClick={() => { stopPlay(); setStep(Math.min(step + 1, totalSteps - 1)); }}
          className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Next step"
        >
          <SkipForward size={16} />
        </button>

        {/* Step counter */}
        <div className="flex-1 mx-2">
          <input
            type="range"
            min={-1}
            max={totalSteps - 1}
            value={step}
            onChange={(e) => { stopPlay(); setStep(Number(e.target.value)); }}
            aria-label="Action Navigation"
            className="w-full accent-yellow-400 h-1.5 rounded-full cursor-pointer"
          />
        </div>

        <span className="text-slate-600 text-xs shrink-0">
          {step + 1} / {totalSteps}
        </span>

        {/* Speed selector */}
        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="text-xs bg-slate-800 border border-slate-700 text-slate-400 rounded-lg px-2 py-1 focus:outline-none"
        >
          <option value={2000}>0.5×</option>
          <option value={1200}>1×</option>
          <option value={600}>2×</option>
          <option value={300}>4×</option>
        </select>
      </div>
    </div>
  );
}
