"use client";

import { clubsApi } from "@/features/clubs/api/clubs-api";
import ClubCreateTableModal from "@/features/clubs/components/ClubCreateTableModal";
import { Check, Copy, Play, Plus, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClubDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [club, setClub] = useState<any>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [clubData, tablesData, statsData] = await Promise.all([
        clubsApi.getClubDetail(id),
        clubsApi.getClubTables(id),
        clubsApi.getClubStats(id).catch(() => null)
      ]);
      setClub(clubData);
      setTables(tablesData.rooms || []);
      setStats(statsData);
    } catch (err) {
      console.error(err);
      router.push("/clubs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
      fetchData();
    }
  }, [id]);

  const handleCopyCode = () => {
    if (club?.code) {
      navigator.clipboard.writeText(club.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!club) return null;

  const isAgentOrOwner = club.myRole === 'OWNER' || club.myRole === 'AGENT';

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-black text-white">{club.name}</h1>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 text-sm font-bold border border-amber-500/30">
                  {club.myRole}
                </span>
              </div>
              <p className="text-slate-400 max-w-2xl">{club.description || 'Welcome to our exclusive poker club.'}</p>

              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center gap-2 bg-slate-950 rounded-lg px-4 py-2 border border-slate-800">
                  <span className="text-slate-400 text-sm">Invite Code:</span>
                  <span className="font-mono font-bold text-amber-500 tracking-wider text-lg">{club.code}</span>
                  <button onClick={handleCopyCode} className="ml-2 text-slate-500 hover:text-white transition">
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 rounded-lg px-4 py-2 border border-slate-800">
                  <Users size={18} className="text-slate-400" />
                  <span className="font-bold">{club.members?.length || 0}</span>
                  <span className="text-slate-500 text-sm">Members</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 min-w-[200px]">
              {isAgentOrOwner && (
                <button
                  onClick={() => setShowCreateTable(true)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-black hover:bg-amber-400 transition font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                >
                  <Plus size={18} /> Create Table
                </button>
              )}
              <button
                onClick={() => router.push(`/clubs/${id}/members`)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition font-semibold"
              >
                <Users size={18} /> Manage Members
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section (Agent/Owner only) */}
        {isAgentOrOwner && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h3 className="text-slate-400 font-semibold mb-2">Total Rake Generated</h3>
              <p className="text-3xl font-black text-amber-500">{Number(stats.totalRake).toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h3 className="text-slate-400 font-semibold mb-2">Total Hands Played</h3>
              <p className="text-3xl font-black text-white">{stats.totalHands.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h3 className="text-slate-400 font-semibold mb-2">Active Members</h3>
              <p className="text-3xl font-black text-white">{stats.activeMembersCount}</p>
            </div>
          </div>
        )}

        {/* Tables List */}
        <div>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold">Club Tables</h2>
          </div>

          {tables.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-12">
                <Play className="w-8 h-8 text-slate-500 -rotate-12" />
              </div>
              <h3 className="text-xl font-bold text-slate-300">No Active Tables</h3>
              <p className="text-slate-500 mt-2">
                {isAgentOrOwner ? "Create a table to start playing." : "Waiting for an agent to create a table."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables.map(table => (
                <div key={table.room_id} className="bg-slate-900 rounded-2xl p-6 border border-slate-800 hover:border-amber-500/50 transition">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white">{table.room_name}</h3>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${table.status === 'RUNNING' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                      {table.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Blinds</span>
                      <span className="font-semibold">{table.small_blind} / {table.big_blind}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Players</span>
                      <span className="font-semibold">{table.current_players_count} / {table.max_players}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Buy-in</span>
                      <span className="font-semibold">{table.min_buy_in} - {table.max_buy_in}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/poker-game?roomId=${table.room_id}`)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-black transition font-bold"
                  >
                    Play Now
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
          onSuccess={() => {
            setShowCreateTable(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
