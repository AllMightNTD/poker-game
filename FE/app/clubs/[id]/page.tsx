"use client";

import { useClubDetail, useClubStats, useClubTables, useLeaveClub } from "@/features/clubs/hooks/useClubs";
import ClubCreateTableModal from "@/features/clubs/components/ClubCreateTableModal";
import { Activity, Check, Coins, Copy, LogOut, Play, Plus, Trophy, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ClubDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const { data: detailData, isLoading: isDetailLoading } = useClubDetail(id);
  const { data: tablesData, isLoading: isTablesLoading } = useClubTables(id);
  const { data: stats } = useClubStats(id);
  const { mutateAsync: leaveClub } = useLeaveClub();

  const [showCreateTable, setShowCreateTable] = useState(false);
  const [copied, setCopied] = useState(false);

  const isLoading = isDetailLoading || isTablesLoading;

  const club = detailData ? {
    ...detailData.club,
    myRole: detailData.my_membership?.role,
    myBalance: detailData.my_membership?.credit_balance,
    members: detailData.members || []
  } : null;

  const tables = tablesData?.rooms || [];

  const handleCopyCode = () => {
    if (club?.code) {
      navigator.clipboard.writeText(club.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeaveClub = async () => {
    if (!confirm("Bạn có chắc chắn muốn rời khỏi câu lạc bộ này không? Bạn sẽ không thể vào lại trừ khi có mã mời mới.")) return;
    try {
      await leaveClub(id);
      router.push("/clubs");
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to leave club');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020817] flex justify-center items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-yellow-500 blur-xl opacity-30 animate-pulse rounded-full"></div>
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-r-2 border-yellow-500 relative z-10"></div>
        </div>
      </div>
    );
  }

  if (!club) return null;

  const isAgentOrOwner = club.myRole === 'OWNER' || club.myRole === 'AGENT';
  const isOwner = club.myRole === 'OWNER';

  return (
    <div className="min-h-screen bg-[#020817] text-white p-4 md:p-10 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push(`/clubs`)}
            className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-300"
          >
            <div className="p-2 rounded-full bg-slate-900 border border-slate-800 group-hover:bg-slate-800 group-hover:border-slate-600 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </div>
            <span className="font-medium text-sm tracking-wide">Back to Clubs</span>
          </button>
        </div>

        {/* Hero Section */}
        <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-slate-800/60 shadow-2xl mb-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-yellow-500/20 to-transparent opacity-50 blur-3xl rounded-bl-full"></div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center relative z-10 gap-8">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-inner">
                  <span className="text-3xl font-black text-yellow-500">{club.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent tracking-tight">
                      {club.name}
                    </h1>
                    <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-black border border-yellow-500/20 uppercase tracking-widest">
                      {club.myRole}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-2 max-w-2xl text-lg leading-relaxed">{club.description || 'Welcome to our exclusive poker club. Join tables and play.'}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-6">
                <div className="group relative">
                  <div className="absolute inset-0 bg-yellow-500/20 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center gap-3 bg-slate-950/80 rounded-xl px-5 py-2.5 border border-slate-700/50 hover:border-yellow-500/50 transition-all cursor-pointer" onClick={handleCopyCode}>
                    <span className="text-slate-400 text-sm font-medium">Invite Code</span>
                    <span className="font-mono font-black text-yellow-500 tracking-[0.2em] text-lg">{club.code}</span>
                    <div className="ml-2 text-slate-500 group-hover:text-yellow-500 transition-colors">
                      {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-950/80 rounded-xl px-5 py-2.5 border border-slate-700/50">
                  <Users size={18} className="text-blue-400" />
                  <span className="font-black text-lg">{club.members?.length || 0}</span>
                  <span className="text-slate-400 text-sm font-medium">Members</span>
                </div>

                <div className="flex items-center gap-3 bg-slate-950/80 rounded-xl px-5 py-2.5 border border-slate-700/50">
                  <Coins size={18} className="text-yellow-500" />
                  <span className="text-slate-400 text-sm font-medium">My Balance</span>
                  <span className="font-black text-lg text-white">{Number(club.myBalance || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto min-w-[220px]">
              {isAgentOrOwner && (
                <button
                  onClick={() => setShowCreateTable(true)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-300 hover:to-yellow-500 transition-all duration-300 font-black shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transform hover:-translate-y-0.5"
                >
                  <Plus size={20} strokeWidth={3} /> Create Table
                </button>
              )}
              <button
                onClick={() => router.push(`/clubs/${id}/members`)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-500 transition-all duration-300 font-bold"
              >
                <Users size={18} /> Manage Members
              </button>

              {!isOwner && (
                <button
                  onClick={handleLeaveClub}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300 font-bold mt-2 lg:mt-0"
                >
                  <LogOut size={18} /> Leave Club
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section (Agent/Owner only) */}
        {isAgentOrOwner && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <div className="relative group overflow-hidden bg-slate-900/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/60 hover:border-slate-600 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Trophy size={48} className="text-yellow-500" />
              </div>
              <h3 className="text-slate-400 font-semibold mb-2 text-sm uppercase tracking-wider flex items-center gap-2">
                Total Rake Generated
              </h3>
              <p className="text-4xl font-black text-yellow-500 tracking-tight">{Number(stats.totalRake).toLocaleString()}</p>
            </div>

            <div className="relative group overflow-hidden bg-slate-900/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/60 hover:border-slate-600 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity size={48} className="text-blue-500" />
              </div>
              <h3 className="text-slate-400 font-semibold mb-2 text-sm uppercase tracking-wider flex items-center gap-2">
                Total Hands Played
              </h3>
              <p className="text-4xl font-black text-white tracking-tight">{stats.totalHands.toLocaleString()}</p>
            </div>

            <div className="relative group overflow-hidden bg-slate-900/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/60 hover:border-slate-600 transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users size={48} className="text-green-500" />
              </div>
              <h3 className="text-slate-400 font-semibold mb-2 text-sm uppercase tracking-wider flex items-center gap-2">
                Active Members
              </h3>
              <p className="text-4xl font-black text-white tracking-tight">{stats.activeMembersCount}</p>
            </div>
          </div>
        )}

        {/* Tables List */}
        <div>
          <div className="flex justify-between items-end mb-6 border-b border-slate-800/50 pb-4">
            <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <div className="w-2 h-8 bg-yellow-500 rounded-full"></div>
              Active Tables
            </h2>
          </div>

          {tables.length === 0 ? (
            <div className="text-center py-24 bg-slate-900/40 backdrop-blur-sm rounded-3xl border border-slate-800/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-slate-800/80 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-12 shadow-2xl border border-slate-700/50">
                  <Play className="w-10 h-10 text-slate-500 -rotate-12" fill="currentColor" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">No Tables Running</h3>
                <p className="text-slate-400 text-lg">
                  {isAgentOrOwner ? "Create a table to invite members to play." : "Waiting for an agent to create a table."}
                </p>
                {isAgentOrOwner && (
                  <button
                    onClick={() => setShowCreateTable(true)}
                    className="mt-6 px-6 py-2.5 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition"
                  >
                    Create Table Now
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tables.map((table: any) => (
                <div key={table.room_id} className="group flex flex-col bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-slate-800 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors line-clamp-1" title={table.room_name}>
                      {table.room_name}
                    </h3>
                    <div className="flex h-3 w-3 relative ml-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8 flex-1">
                    <div className="flex items-center justify-between bg-slate-950/50 rounded-lg p-3 border border-slate-800/50">
                      <span className="text-slate-400 text-sm font-medium">Blinds</span>
                      <span className="font-black text-yellow-500">{table.small_blind} / {table.big_blind}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm font-medium flex items-center gap-1.5">
                        <Users size={14} /> Players
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-800 rounded-full h-2 min-w-[60px]">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(table.current_players_count / table.max_players) * 100}%` }}></div>
                        </div>
                        <span className="font-bold text-white text-sm">{table.current_players_count}/{table.max_players}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm font-medium flex items-center gap-1.5">
                        <Coins size={14} /> Buy-in
                      </span>
                      <span className="font-bold text-slate-300 text-sm">{table.min_buy_in} <span className="text-slate-600">-</span> {table.max_buy_in}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/poker-game?roomId=${table.room_id}`)}
                    className="w-full py-3 rounded-xl bg-slate-800 border border-slate-700 text-white group-hover:bg-yellow-500 group-hover:border-yellow-500 group-hover:text-black transition-all duration-300 font-black tracking-wide"
                  >
                    PLAY NOW
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateTable && (
        <ClubCreateTableModal
          clubId={id}
          onClose={() => setShowCreateTable(false)}
          onSuccess={() => setShowCreateTable(false)}
        />
      )}
    </div>
  );
}
