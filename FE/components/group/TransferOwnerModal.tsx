import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import api from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

interface TransferOwnerModalProps {
  groupId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransferOwnerModal({ groupId, onClose, onSuccess }: TransferOwnerModalProps) {
  const t = useTranslations('group');
  const tCommon = useTranslations('common');
  const [keyword, setKeyword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: members = [] } = useQuery({
    queryKey: ['groupMembersSearch', groupId, keyword],
    queryFn: async () => {
      const res = await api.get(`/api/v1/groups/${groupId}/members?status=ACTIVE`);
      const allMembers = res.data.data || res.data;
      if (!keyword.trim()) return allMembers;
      return allMembers.filter((m: any) => 
        m.user.name?.toLowerCase().includes(keyword.toLowerCase()) || 
        m.user.email?.toLowerCase().includes(keyword.toLowerCase())
      );
    },
  });

  const transferMutation = useMutation({
    mutationFn: async (newOwnerId: string) => {
      await api.post(`/api/v1/groups/${groupId}/transfer-owner`, { newOwnerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      onSuccess();
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || tCommon('error'));
    }
  });

  const handleTransfer = () => {
    if (selectedUserId) {
      transferMutation.mutate(selectedUserId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl relative flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">{t('transferOwner.title')}</h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-hidden flex flex-col">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('transferOwner.description', { name: selectedUserId ? members.find((m: any) => m.user_id === selectedUserId)?.user?.name : '...' }) || 'Bạn cần chuyển quyền Owner cho một thành viên khác trước khi rời nhóm.'}
          </p>

          <div className="relative">
            <input 
              type="text" 
              placeholder={t('members.searchPlaceholder')} 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {members.map((member: any) => (
              <label 
                key={member.user_id} 
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  selectedUserId === member.user_id 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <input 
                  type="radio" 
                  name="newOwner" 
                  value={member.user_id} 
                  checked={selectedUserId === member.user_id}
                  onChange={() => setSelectedUserId(member.user_id)}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                  {member.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{member.user?.name}</div>
                  <div className="text-xs text-gray-500">{member.role === 'OWNER' ? t('members.roleOwner') : member.role === 'ADMIN' ? t('members.roleAdmin') : t('members.roleMember')}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedUserId === member.user_id ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {selectedUserId === member.user_id && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            {t('transferOwner.cancel')}
          </button>
          <button 
            disabled={!selectedUserId || transferMutation.isPending}
            onClick={handleTransfer}
            className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors"
          >
            {transferMutation.isPending ? tCommon('processing') : t('transferOwner.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
