'use client';

import React, { useState } from 'react';
import { Search, MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface GroupHeaderProps {
  group: {
    id: string;
    name: string;
    coverUrl?: string;
    avatarUrl?: string;
    memberCount: number;
    privacy: string;
    description?: string;
    currentUserRole?: string;
    isMember?: boolean;
    canViewPosts?: boolean;
  }
  activeTab: string;
  onTabChange: (tab: string) => void;
  onJoinGroup?: () => void;
  onLeaveGroup?: () => void;
  onTransferOwner?: () => void;
  isJoinPending?: boolean;
  currentUserRole?: string;
  isMember?: boolean;
}

export default function GroupHeader({ group, activeTab, onTabChange, onJoinGroup, onLeaveGroup, onTransferOwner, isJoinPending, currentUserRole, isMember }: GroupHeaderProps) {
  const t = useTranslations('group');

  const tabs = [
    { id: 'feed', label: t('detail.tabDiscussion') },
    { id: 'about', label: t('createModal.tabAbout') },
    { id: 'members', label: t('detail.tabMembers') },
    { id: 'pending posts', label: t('detail.tabPending') }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-6xl mx-auto">
        {/* Cover Photo */}
        <div 
          className="h-64 md:h-80 w-full bg-gray-200 dark:bg-gray-700 rounded-b-lg bg-cover bg-center"
          style={{ backgroundImage: group.coverUrl ? `url(${group.coverUrl})` : 'none' }}
        />
        
        <div className="px-4 pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-12 md:-mt-8 mb-4">
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div 
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 bg-cover bg-center shrink-0"
                style={{ backgroundImage: group.avatarUrl ? `url(${group.avatarUrl})` : 'none' }}
              />
              <div className="pb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  {group.name}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {t('header.memberCount', { count: group.memberCount })} • {group.privacy === 'public' ? t('header.publicGroup') : t('header.privateGroup')}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4 md:mt-0 w-full md:w-auto">
              {currentUserRole === 'OWNER' ? (
                <button 
                  onClick={onTransferOwner}
                  className="flex-1 md:flex-none bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 px-6 py-2 rounded-lg font-medium transition-colors border border-red-200 dark:border-red-800"
                >
                  {t('header.leaveGroup')}
                </button>
              ) : isMember ? (
                <button 
                  onClick={onLeaveGroup}
                  className="flex-1 md:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {t('header.leaveGroup')}
                </button>
              ) : currentUserRole === 'PENDING' ? (
                <button 
                  disabled
                  className="flex-1 md:flex-none bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 px-6 py-2 rounded-lg font-medium cursor-not-allowed"
                >
                  {t('header.pending') || 'Pending Approval'}
                </button>
              ) : (
                <button 
                  onClick={onJoinGroup}
                  disabled={isJoinPending}
                  className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {isJoinPending ? t('header.joining', { defaultMessage: 'Joining...' }) : `+ ${t('header.joinGroup')}`}
                </button>
              )}
            </div>
          </div>
          
          <hr className="border-gray-200 dark:border-gray-700 mb-2" />
          
          <div className="flex justify-between items-center">
            <div className="flex overflow-x-auto hide-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id 
                      ? 'border-blue-600 text-blue-600 dark:text-blue-500' 
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="hidden md:flex gap-2">
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Search size={20} />
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
