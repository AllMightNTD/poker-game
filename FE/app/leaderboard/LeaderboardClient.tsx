"use client";

import { useCurrentUser } from "@/core/providers/user-provider";
import { gamificationApi, LeaderboardEntry } from "@/features/gamification/api/gamification-api";
import { motion } from "framer-motion";
import { Crown, Medal, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function LeaderboardContent() {
  const { currentUser } = useCurrentUser();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await gamificationApi.getLeaderboard(type);
        setEntries(res);
      } catch (err) {
        console.error("Failed to load leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [type]);

  const formatChips = (val: string | number) => {
    return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(Number(val));
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-400 w-6 h-6 drop-shadow-md" />;
    if (rank === 2) return <Medal className="text-slate-300 w-6 h-6 drop-shadow-md" />;
    if (rank === 3) return <Medal className="text-amber-700 w-6 h-6 drop-shadow-md" />;
    return <span className="text-slate-500 font-bold w-6 text-center">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 flex items-center justify-center gap-4">
            <Trophy className="text-amber-400 w-10 h-10" />
            HALL OF FAME
            <Trophy className="text-amber-400 w-10 h-10" />
          </h1>
          <p className="text-slate-400">Top players by total chips won.</p>

          <div className="inline-flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            <button
              onClick={() => setType('weekly')}
              className={`px-6 py-2 rounded-md font-bold transition ${type === 'weekly' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setType('monthly')}
              className={`px-6 py-2 rounded-md font-bold transition ${type === 'monthly' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'}`}
            >
              Monthly
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
          </div>
        ) : (
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-sm uppercase tracking-wider">
                  <th className="py-4 px-6 font-bold w-20 text-center">Rank</th>
                  <th className="py-4 px-6 font-bold">Player</th>
                  <th className="py-4 px-6 font-bold text-right">Hands Played</th>
                  <th className="py-4 px-6 font-bold text-right text-emerald-400">Total Won</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition ${entry.user_id === currentUser?.id ? 'bg-amber-500/10 border-amber-500/20' : ''}`}
                  >
                    <td className="py-4 px-6 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </td>
                    <td className="py-4 px-6 font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 flex-shrink-0 relative">
                        {entry.user?.avatar ? (
                          <Image src={entry.user.avatar} alt="Avatar" fill className="object-cover" sizes="32px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                        )}
                      </div>
                      {entry.user?.name || entry.user?.username || 'Unknown'}
                      {entry.user_id === currentUser?.id && <span className="ml-2 px-2 py-0.5 bg-amber-500 text-black text-[10px] rounded-full uppercase tracking-wider">You</span>}
                    </td>
                    <td className="py-4 px-6 text-right text-slate-300 font-mono">
                      {entry.hands_played}
                    </td>
                    <td className="py-4 px-6 text-right font-black text-emerald-400 tabular-nums">
                      {formatChips(entry.chips_won)}
                    </td>
                  </motion.tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">
                      No data available for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
