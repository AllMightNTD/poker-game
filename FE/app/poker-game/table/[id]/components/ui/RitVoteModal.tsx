"use client";

import { useCurrentUser } from "@/core/providers/user-provider";
import { useEffect, useState } from "react";
import { usePokerGame } from "../hooks/usePokerGame";

export function RitVoteModal() {
  const {
    ritVoters,
    ritVotesYesCount,
    ritVotesNoCount,
    voteRit
  } = usePokerGame();

  const { currentUser } = useCurrentUser();
  const [hasVoted, setHasVoted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15); // Default 15s

  const isVoter = currentUser?.id && ritVoters?.includes(currentUser.id);
  const showModal = ritVoters && ritVoters.length > 0;

  useEffect(() => {
    if (showModal) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasVoted(false);
      setTimeLeft(15); // Reset timer when new vote starts

      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showModal]);

  const handleVote = (agree: boolean) => {
    voteRit(agree);
    setHasVoted(true);
  };

  if (!showModal) return null;

  const totalVoters = ritVoters.length;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl relative overflow-hidden">

        {/* Animated background pulse for tension */}
        <div className="absolute -inset-10 bg-amber-500/10 blur-3xl rounded-full animate-pulse z-0 pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-2xl font-black text-white mb-2">RUN IT TWICE?</h2>
          <p className="text-slate-400 text-sm mb-6">
            Two boards will be dealt. The pot will be split in half for each board.
          </p>

          {/* Progress / Status */}
          <div className="flex justify-center items-center gap-6 mb-6">
            <div className="text-center">
              <span className="block text-3xl font-bold text-green-400">{ritVotesYesCount}</span>
              <span className="text-xs text-slate-500 font-bold uppercase">Yes</span>
            </div>
            <div className="w-px h-10 bg-slate-800"></div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-red-400">{ritVotesNoCount}</span>
              <span className="text-xs text-slate-500 font-bold uppercase">No</span>
            </div>
            <div className="w-px h-10 bg-slate-800"></div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-slate-300">{totalVoters}</span>
              <span className="text-xs text-slate-500 font-bold uppercase">Total</span>
            </div>
          </div>

          {isVoter ? (
            !hasVoted ? (
              <div className="flex gap-3">
                <button
                  onClick={() => handleVote(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-red-500/20 hover:text-red-400 border border-transparent hover:border-red-500/50 transition"
                >
                  NO
                </button>
                <button
                  onClick={() => handleVote(true)}
                  className="flex-1 py-3 rounded-xl bg-amber-500 text-black font-black hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition"
                >
                  YES
                </button>
              </div>
            ) : (
              <div className="bg-slate-800/50 border border-slate-700 py-3 rounded-xl">
                <p className="text-amber-500 font-bold">Waiting for others...</p>
              </div>
            )
          ) : (
            <div className="bg-slate-800/50 border border-slate-700 py-3 rounded-xl">
              <p className="text-slate-400 font-bold text-sm">Players are voting to Run It Twice</p>
            </div>
          )}

          {/* Timer bar */}
          <div className="mt-6 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 linear ${timeLeft < 5 ? 'bg-red-500' : 'bg-amber-500'}`}
              style={{ width: `${(timeLeft / 15) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">{timeLeft}s remaining</p>
        </div>
      </div>
    </div>
  );
}
