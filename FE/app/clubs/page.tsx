"use client";

import { clubsApi } from "@/features/clubs/api/clubs-api";
import ClubCreateModal from "@/features/clubs/components/ClubCreateModal";
import ClubJoinModal from "@/features/clubs/components/ClubJoinModal";
import { Coins, LogIn, Plus, Shield, Star, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClubsPage() {
  const router = useRouter();
  const [clubs, setClubs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const fetchClubs = async () => {
    try {
      setIsLoading(true);
      const data = await clubsApi.getMyClubs();
      setClubs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    fetchClubs();
  }, []);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER": return <Star className="w-4 h-4 text-yellow-500" />;
      case "AGENT": return <Shield className="w-4 h-4 text-blue-500" />;
      default: return <Users className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
              My Clubs
            </h1>
            <p className="text-slate-400 mt-2">Join exclusive communities and play with friends.</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowJoin(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition font-semibold"
            >
              <LogIn size={18} /> Join Club
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black hover:bg-amber-400 transition font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              <Plus size={18} /> Create Club
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-300">No Clubs Yet</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              You are not a member of any clubs. Create your own club to host private games, or join an existing one using an invite code.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((membership) => (
              <div
                key={membership.club.id}
                onClick={() => router.push(`/clubs/${membership.club.id}`)}
                className="group relative bg-slate-900 rounded-2xl p-6 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all hover:transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-amber-500/10"></div>

                <div className="flex justify-between items-start mb-4 relative">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                      {membership.club.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      CODE: {membership.club.code}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-xs font-semibold">
                    {getRoleIcon(membership.role)}
                    <span>{membership.role}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950/50 border border-slate-800">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-semibold text-slate-300">Balance:</span>
                  <span className="text-sm font-bold text-white ml-auto">
                    {Number(membership.credit_balance).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <ClubCreateModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            fetchClubs();
          }}
        />
      )}

      {showJoin && (
        <ClubJoinModal
          onClose={() => setShowJoin(false)}
          onSuccess={() => {
            setShowJoin(false);
            fetchClubs();
          }}
        />
      )}
    </div>
  );
}
