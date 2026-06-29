import React from 'react';
import Link from 'next/link';
import { Users, Globe, Lock, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Group {
  id: string;
  name: string;
  memberCount: number;
  privacy: string;
  coverUrl?: string;
  userStatus?: 'ACTIVE' | 'PENDING';
}

export default function GroupCard({ group }: { group: Group }) {
  const t = useTranslations('group');
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div 
        className="h-32 bg-gray-200 dark:bg-gray-700 bg-cover bg-center"
        style={{ backgroundImage: group.coverUrl ? `url(${group.coverUrl})` : 'none' }}
      />
      <div className="p-5">
        <Link href={`/groups/${group.id}`}>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white hover:underline mb-1 truncate">
            {group.name}
          </h3>
        </Link>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-3 mb-4">
          <span className="flex items-center gap-1">
            <Users size={14} />
            {t('header.memberCount', { count: group.memberCount })}
          </span>
          <span className="flex items-center gap-1">
            {group.privacy === 'public' ? <Globe size={14} /> : <Lock size={14} />}
            <span className="capitalize">{group.privacy === 'public' ? t('header.publicGroup') : t('header.privateGroup')}</span>
          </span>
        </div>
        {group.userStatus === 'ACTIVE' && (
          <div className="mb-4 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded w-max inline-flex items-center gap-1">
            <Shield size={12} /> {t('header.joined') || 'Đã tham gia'}
          </div>
        )}
        {group.userStatus === 'PENDING' && (
          <div className="mb-4 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded w-max inline-flex items-center gap-1">
            <Lock size={12} /> {t('header.pending') || 'Đang chờ duyệt'}
          </div>
        )}
        <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors">
          {t('header.joinGroup')}
        </button>
      </div>
    </div>
  );
}
