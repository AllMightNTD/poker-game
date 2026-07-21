"use client";

import { useClubDetail, useRemoveMember, useUpdateRole } from "@/features/clubs/hooks/useClubs";
import TransferCreditModal from "@/features/clubs/components/TransferCreditModal";
import { ArrowLeft, ArrowRightLeft, Coins, Shield, Star, Trash2, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ClubMembersPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const { data: detailData, isLoading } = useClubDetail(id);
  const { mutateAsync: updateRole } = useUpdateRole();
  const { mutateAsync: removeMember } = useRemoveMember();

  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showTransfer, setShowTransfer] = useState(false);

  const club = detailData ? {
    ...detailData.club,
    myRole: detailData.my_membership?.role,
    myBalance: detailData.my_membership?.credit_balance,
    members: detailData.members || []
  } : null;

  const members = detailData?.members || [];

  const handleRoleChange = async (userId: string, newRole: 'AGENT' | 'MEMBER') => {
    if (!confirm(`Are you sure you want to change this member's role to ${newRole}?`)) return;
    try {
      await updateRole({ clubId: id, userId, role: newRole });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleKickMember = async (userId: string, userName: string) => {
    if (!confirm(`Xóa người chơi ${userName} khỏi club vĩnh viễn? Họ sẽ bị kích ra khỏi bàn nếu đang chơi.`)) return;
    try {
      await removeMember({ clubId: id, userId });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to kick member');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER": return <Star className="w-4 h-4 text-yellow-500" />;
      case "AGENT": return <Shield className="w-4 h-4 text-blue-400" />;
      default: return <Users className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "OWNER": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "AGENT": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default: return "bg-slate-800 text-slate-300 border-slate-700";
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

  const isAgentOrOwner = club?.myRole === 'OWNER' || club?.myRole === 'AGENT';
  const isOwner = club?.myRole === 'OWNER';

  return (
    <div className="min-h-screen bg-[#020817] text-white p-4 md:p-10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <button
          onClick={() => router.push(`/clubs/${id}`)}
          className="group flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors duration-300"
        >
          <div className="p-2 rounded-full bg-slate-900 border border-slate-800 group-hover:bg-slate-800 group-hover:border-slate-600 transition-all">
            <ArrowLeft size={16} />
          </div>
          <span className="font-medium text-sm tracking-wide">Back to Club</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold tracking-wider text-slate-300 mb-3">
              <Users size={14} className="text-yellow-500" />
              MEMBER MANAGEMENT
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Manage Members
            </h1>
            <p className="text-slate-400 mt-2 text-lg">{club?.name}</p>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-2xl group-hover:bg-yellow-500/30 transition-all duration-500"></div>
            <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <Coins className="text-black" size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Your Balance</p>
                <p className="font-black text-2xl bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  {Number(club?.myBalance || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800/60 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-5 font-semibold text-slate-400 text-sm tracking-wide">Member</th>
                  <th className="px-6 py-5 font-semibold text-slate-400 text-sm tracking-wide">Role</th>
                  <th className="px-6 py-5 font-semibold text-slate-400 text-sm tracking-wide text-right">Balance</th>
                  <th className="px-6 py-5 font-semibold text-slate-400 text-sm tracking-wide text-right">Rake Generated</th>
                  {isAgentOrOwner && (
                    <th className="px-6 py-5 font-semibold text-slate-400 text-sm tracking-wide text-center">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {members.map((member: any) => (
                  <tr key={member.user_id} className="hover:bg-slate-800/40 transition-colors duration-300 group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-xl text-yellow-500 border border-slate-700 shadow-inner group-hover:border-yellow-500/30 group-hover:bg-slate-800/80 transition-all">
                            {member.user.user_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          {member.role === 'OWNER' && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-lg">
                              <Star size={8} className="text-black" fill="currentColor" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg">{member.user.user_name}</p>
                          <p className="text-xs text-slate-500 font-mono">ID: {member.user_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`flex items-center gap-2 w-fit px-3 py-1.5 rounded-lg border ${getRoleBadgeClass(member.role)}`}>
                        {getRoleIcon(member.role)}
                        <span className="text-xs font-bold tracking-wider uppercase">{member.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-mono font-black text-lg text-slate-200">
                      {Number(member.credit_balance).toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="font-black text-yellow-500">{Number(member.total_rake_paid).toLocaleString()}</p>
                      <p className="text-xs text-slate-500 font-medium">{member.total_hands} hands</p>
                    </td>
                    {isAgentOrOwner && (
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setShowTransfer(true);
                            }}
                            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-yellow-500 hover:bg-yellow-500 hover:text-black hover:border-yellow-500 transition-all tooltip-trigger shadow-sm"
                            title="Transfer Credit"
                          >
                            <ArrowRightLeft size={18} />
                          </button>

                          {isOwner && member.role !== 'OWNER' && (
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.user_id, e.target.value as any)}
                              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-white font-medium cursor-pointer"
                            >
                              <option value="MEMBER">MEMBER</option>
                              <option value="AGENT">AGENT</option>
                            </select>
                          )}

                          {isOwner && member.role !== 'OWNER' && (
                            <button
                              onClick={() => handleKickMember(member.user_id, member.user.user_name)}
                              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all tooltip-trigger shadow-sm ml-1"
                              title="Kick Member"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {members.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 border border-slate-700 mb-4">
                        <Users className="text-slate-500" size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-300">No Members Found</h3>
                      <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm">
                        Share your invite code to get players into your club.
                      </p>
                    </td>
                  </tr>
                )}
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
          onSuccess={() => setShowTransfer(false)}
        />
      )}
    </div>
  );
}
