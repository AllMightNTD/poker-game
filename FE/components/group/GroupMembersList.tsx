import React from 'react';
import { UserCheck, UserMinus, Shield } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useTranslations } from 'next-intl';

export default function GroupMembersList({ groupId }: { groupId: string }) {
  const t = useTranslations('group');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();

  const { data: membersData, isLoading } = useQuery({
    queryKey: ['groupMembers', groupId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/groups/${groupId}/members`);
      return res.data;
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.post(`/api/v1/groups/${groupId}/members/${userId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] });
    }
  });

  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/api/v1/groups/${groupId}/members/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] });
    }
  });

  if (isLoading) return <div className="py-4 text-center">{tCommon('loading')}</div>;

  const allMembers = membersData || [];
  const members = allMembers.filter((m: any) => m.status === 'ACTIVE');
  const pendingRequests = allMembers.filter((m: any) => m.status === 'PENDING');

  return (
    <div className="space-y-6">
      {pendingRequests.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Pending Requests ({pendingRequests.length})</h3>
          <div className="space-y-4">
            {pendingRequests.map((req: any) => (
              <div key={req.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 bg-cover" style={{ backgroundImage: `url(${req.user?.profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'})` }} />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{req.user?.profile?.full_name || req.user?.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Requested to join</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => approveMutation.mutate(req.user_id)}
                    disabled={approveMutation.isPending}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
                  >
                    {t('pendingPosts.approve')}
                  </button>
                  <button 
                    onClick={() => removeMutation.mutate(req.user_id)}
                    disabled={removeMutation.isPending}
                    className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:opacity-50 text-gray-800 dark:text-white rounded-lg text-sm font-medium"
                  >
                    {t('pendingPosts.reject')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('members.title')} ({members.length})</h3>
        <div className="space-y-4">
          {members.map((member: any) => (
            <div key={member.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 bg-cover" style={{ backgroundImage: `url(${member.user?.profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'})` }} />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                    {member.user?.profile?.full_name || member.user?.email}
                    {member.role === 'ADMIN' && <Shield size={14} className="text-blue-500" />}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {member.role === 'OWNER' ? t('members.roleOwner') : member.role === 'ADMIN' ? t('members.roleAdmin') : t('members.roleMember')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    if(window.confirm('Are you sure?')) {
                      removeMutation.mutate(member.user_id);
                    }
                  }}
                  title={t('members.actionKick')}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <UserMinus size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
