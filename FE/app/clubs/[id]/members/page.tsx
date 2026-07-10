"use client";

import { clubsApi } from "@/features/clubs/api/clubs-api";
import TransferCreditModal from "@/features/clubs/components/TransferCreditModal";
import { ArrowLeft, ArrowRightLeft, Coins, Shield, Star, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClubMembersPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [club, setClub] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showTransfer, setShowTransfer] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [clubData, membersData] = await Promise.all([
        clubsApi.getClubDetail(id),
        clubsApi.getClubMembers(id)
      ]);
      setClub(clubData);
      setMembers(membersData);
    } catch (err) {
      console.error(err);
      router.push(`/clubs/${id}`);
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

  const handleRoleChange = async (userId: string, newRole: 'AGENT' | 'MEMBER') => {
    if (!confirm(`Are you sure you want to change this member's role to ${newRole}?`)) return;
    try {
      await clubsApi.updateRole(id, userId, newRole);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER": return <Star className="w-4 h-4 text-yellow-500" />;
      case "AGENT": return <Shield className="w-4 h-4 text-blue-500" />;
      default: return <Users className="w-4 h-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const isAgentOrOwner = club?.myRole === 'OWNER' || club?.myRole === 'AGENT';
  const isOwner = club?.myRole === 'OWNER';

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.push(`/clubs/${id}`)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={18} /> Back to Club
        </button>

        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Manage Members</h1>
            <p className="text-slate-400 mt-1">{club?.name}</p>
          </div>

          <div className="bg-slate-900 rounded-lg px-4 py-2 border border-slate-800 flex items-center gap-3">
            <Coins className="text-yellow-500" />
            <div>
              <p className="text-xs text-slate-500 font-semibold">Your Balance</p>
              <p className="font-bold text-lg">{Number(club?.myBalance || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950/50 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-400">Member</th>
                  <th className="px-6 py-4 font-semibold text-slate-400">Role</th>
                  <th className="px-6 py-4 font-semibold text-slate-400 text-right">Balance</th>
                  <th className="px-6 py-4 font-semibold text-slate-400 text-right">Rake Generated</th>
                  {isAgentOrOwner && (
                    <th className="px-6 py-4 font-semibold text-slate-400 text-center">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {members.map((member) => (
                  <tr key={member.user_id} className="hover:bg-slate-800/20 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-amber-500">
                          {member.user.user_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-white">{member.user.user_name}</p>
                          <p className="text-xs text-slate-500">ID: {member.user_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 bg-slate-950 w-fit px-3 py-1.5 rounded-lg border border-slate-800">
                        {getRoleIcon(member.role)}
                        <span className="text-sm font-semibold">{member.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-lg">
                      {Number(member.credit_balance).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-amber-500">{Number(member.total_rake_paid).toLocaleString()}</p>
                      <p className="text-xs text-slate-500">{member.total_hands} hands</p>
                    </td>
                    {isAgentOrOwner && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setShowTransfer(true);
                            }}
                            className="p-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black transition tooltip-trigger"
                            title="Transfer Credit"
                          >
                            <ArrowRightLeft size={18} />
                          </button>

                          {isOwner && member.role !== 'OWNER' && (
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.user_id, e.target.value as any)}
                              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-amber-500"
                            >
                              <option value="MEMBER">Make Member</option>
                              <option value="AGENT">Make Agent</option>
                            </select>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showTransfer && selectedMember && (
        <TransferCreditModal
          clubId={id}
          member={selectedMember}
          onClose={() => setShowTransfer(false)}
          onSuccess={() => {
            setShowTransfer(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
