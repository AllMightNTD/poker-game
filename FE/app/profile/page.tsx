"use client";

import React, { useEffect, useState } from "react";
import { gamificationApi, PlayerStats, Achievement } from "@/features/gamification/api/gamification-api";
import { UserProvider, useCurrentUser } from "@/core/providers/user-provider";
import { LevelBadge } from "../poker-game/table/[id]/components/ui/LevelBadge";
import { Coins, Trophy, Swords, Zap, Star, Laptop, Globe, Trash2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { AuthService } from "@/features/auth/services/auth.service";

function ProfileContent() {
  const { currentUser } = useCurrentUser();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sessionRefresh, setSessionRefresh] = useState(0);

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to log out of this device remotely?")) return;
    try {
      await AuthService.revokeSession(id);
      setSessionRefresh((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to revoke user session", err);
      alert("Failed to revoke session.");
    }
  };

  // Fetch gamification stats
  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    const fetchStats = async () => {
      try {
        const [statsRes, achRes] = await Promise.all([
          gamificationApi.getMyStats().catch(err => {
            if (err?.response?.status !== 404) {
              console.error("Failed to load stats", err);
            }
            return null;
          }),
          gamificationApi.getMyAchievements().catch(err => {
            console.error("Failed to load achievements", err);
            return [];
          })
        ]);
        if (active) {
          setStats(statsRes);
          setAchievements(achRes || []);
        }
      } catch (err) {
        console.error("Unexpected error in fetchStats", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchStats();
    return () => { active = false; };
  }, [currentUser]);

  // Fetch active sessions
  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    const controller = new AbortController();
    AuthService.getSessions()
      .then((data) => {
        if (active) {
          setSessions(data || []);
          setLoadingSessions(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.error("Failed to load user sessions", err);
          setLoadingSessions(false);
        }
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [currentUser, sessionRefresh]);

  if (!currentUser || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  const formatNumber = (val: string | number) => {
    return new Intl.NumberFormat().format(Number(val));
  };

  const winRate = stats?.hands_played 
    ? Math.round((stats.hands_won / stats.hands_played) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Profile */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-8 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center gap-8"
        >
          {/* Avatar & Badge */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 shadow-xl">
              {currentUser.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-5xl">
                  👤
                </div>
              )}
            </div>
            <div className="absolute -bottom-4 -right-4">
              <LevelBadge level={stats?.level || 'bronze'} xp={stats?.current_xp || 0} showProgress={false} size="sm" />
            </div>
          </div>

          {/* User Info & XP */}
          <div className="flex-1 text-center md:text-left space-y-4 w-full">
            <div>
              <h1 className="text-3xl font-black text-white">{currentUser.name || currentUser.username}</h1>
              <p className="text-slate-400 font-mono text-sm mt-1">Player ID: {currentUser.id.substring(0,8)}</p>
            </div>

            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50 w-full max-w-md">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-amber-400 uppercase tracking-widest">{stats?.level || 'Bronze'}</span>
                <span className="text-xs text-slate-400">{formatNumber(stats?.current_xp || 0)} XP</span>
              </div>
              <LevelBadge level={stats?.level || 'bronze'} xp={stats?.current_xp || 0} showProgress={true} size="md" />
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatCard icon={<Swords className="text-rose-400" />} label="Hands Played" value={formatNumber(stats?.hands_played || 0)} />
          <StatCard icon={<Zap className="text-amber-400" />} label="Win Rate" value={`${winRate}%`} />
          <StatCard icon={<Coins className="text-emerald-400" />} label="Total Won" value={formatNumber(stats?.total_chips_won || 0)} />
          <StatCard icon={<Trophy className="text-indigo-400" />} label="Biggest Pot" value={formatNumber(stats?.biggest_pot || 0)} />
        </motion.div>

        {/* Achievements Showcase */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-800"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Star className="text-amber-400 w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white">Achievements</h2>
          </div>

          {achievements.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
              <Star className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              <p>No achievements unlocked yet.<br/>Play more hands to earn badges!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {achievements.map((ach, idx) => (
                <motion.div 
                  key={ach.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + (idx * 0.1) }}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center text-center gap-2 hover:border-amber-500/50 hover:bg-slate-900 transition cursor-default group"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition">
                    <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                      <Trophy className="text-amber-500 w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-200 mt-1 uppercase tracking-tight">{ach.type.replace(/_/g, ' ')}</p>
                    <p className="text-[9px] text-slate-500 mt-1 font-mono">
                      {new Date(ach.unlocked_at).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Active Sessions */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-800"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Laptop className="text-indigo-400 w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white">Active Device</h2>
            </div>
            <button
              onClick={() => setSessionRefresh((prev) => prev + 1)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition cursor-pointer"
            >
              Refresh
                                      </button>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            List of devices/browsers currently logged into your account. You can remotely log out of any suspicious active sessions.
                                </p>

          <div className="space-y-4">
            {loadingSessions ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-xl">
                No active sessions found.
                                                </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl hover:border-slate-700/60 transition group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 group-hover:text-indigo-400 transition shrink-0">
                        <Laptop size={20} />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-sm font-bold text-slate-200 truncate">
                          {session.device_info || "Unknown device"}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Globe size={12} /> {session.ip_address || "No IP"}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {new Date(session.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRevoke(session.id)}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl transition-colors cursor-pointer shrink-0 ml-3"
                      title="Revoke Session"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center gap-3 hover:bg-slate-800/50 transition">
    <div className="p-3 bg-slate-950 rounded-full shadow-inner border border-slate-800">
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-white mt-1">{value}</p>
    </div>
  </div>
);

export default function ProfilePage() {
  return (
    <UserProvider>
      <ProfileContent />
    </UserProvider>
  );
}
