"use client";

import { useMyClubs } from "@/features/clubs/hooks/useClubs";

import ClubCreateModal from "@/features/clubs/components/ClubCreateModal";
import ClubJoinModal from "@/features/clubs/components/ClubJoinModal";
import { ArrowRight, Coins, LogIn, Plus, Shield, Sparkles, Star, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ClubsPage() {
  const router = useRouter();
  const { data: clubs = [], isLoading } = useMyClubs();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);



  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER": return <Star className="w-3.5 h-3.5 text-yellow-500" />;
      case "AGENT": return <Shield className="w-3.5 h-3.5 text-blue-400" />;
      default: return <Users className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "OWNER": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "AGENT": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default: return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white p-4 md:p-10 relative overflow-hidden">
      {/* Immersive Background Effects */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[150px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold tracking-wider text-slate-300 mb-4 shadow-lg">
              <Sparkles size={14} className="text-yellow-500" />
              POKER COMMUNITIES
            </div>
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight mb-2">
              My Clubs
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-xl leading-relaxed">
              Join exclusive communities, host private tables, and play with friends in a secure environment.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-4 w-full lg:w-auto">
            <button
              onClick={() => setShowJoin(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/80 backdrop-blur-md border border-slate-700 hover:bg-slate-700 hover:border-slate-500 transition-all duration-300 font-bold shadow-lg"
            >
              <LogIn size={18} /> Join Club
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-300 hover:to-yellow-500 transition-all duration-300 font-black shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transform hover:-translate-y-0.5"
            >
              <Plus size={20} strokeWidth={3} /> Create Club
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-32">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500 blur-xl opacity-30 animate-pulse rounded-full"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-r-2 border-yellow-500 relative z-10"></div>
            </div>
          </div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800/50 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 bg-slate-800/80 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700/50 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Users className="w-12 h-12 text-slate-500" />
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">No Clubs Yet</h3>
              <p className="text-slate-400 text-lg max-w-md mx-auto mb-8 leading-relaxed">
                You are not a member of any clubs. Create your own club to host private games, or join an existing one using an invite code.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowJoin(true)}
                  className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors"
                >
                  Join a Club
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {clubs.map((membership: any) => (
              <div
                key={membership.club.id}
                onClick={() => router.push(`/clubs/${membership.club.id}`)}
                className="group relative bg-slate-900/60 backdrop-blur-sm rounded-3xl p-1 border border-slate-800/60 hover:border-yellow-500/50 cursor-pointer transition-all duration-300 hover:shadow-[0_10px_40px_-10px_rgba(245,158,11,0.2)] hover:-translate-y-1.5 overflow-hidden"
              >
                {/* Card inner wrapper for gradient border effect */}
                <div className="bg-slate-950 rounded-[23px] h-full p-6 md:p-8 relative overflow-hidden">
                  {/* Hover Glow */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/0 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-yellow-500/10 pointer-events-none"></div>

                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex-1 pr-4">
                      <h3 className="text-2xl font-black text-white group-hover:text-yellow-400 transition-colors line-clamp-1 mb-1 tracking-tight">
                        {membership.club.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-500 font-medium">CODE</span>
                        <span className="px-2 py-0.5 bg-slate-800 rounded text-xs font-mono font-bold text-slate-300 tracking-wider">
                          {membership.club.code}
                        </span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${getRoleBadgeClass(membership.role)} shadow-sm`}>
                      {getRoleIcon(membership.role)}
                      <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase">{membership.role}</span>
                    </div>
                  </div>

                  <div className="mt-auto relative z-10">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800/80 group-hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                          <Coins className="text-black w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Balance</p>
                          <p className="text-lg font-black text-white">
                            {Number(membership.credit_balance).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-yellow-500 group-hover:text-black transition-all transform group-hover:translate-x-1">
                        <ArrowRight size={16} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <ClubCreateModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => setShowCreate(false)}
        />
      )}

      {showJoin && (
        <ClubJoinModal
          onClose={() => setShowJoin(false)}
          onSuccess={() => setShowJoin(false)}
        />
      )}
    </div>
  );
}
