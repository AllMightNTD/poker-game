'use client';

import React, { useState } from 'react';
import { Search, MoreHorizontal, BadgeCheck, Check } from 'lucide-react';

interface PageHeaderProps {
  page: {
    id: string;
    name: string;
    category: string;
    coverUrl?: string;
    avatarUrl?: string;
    followerCount: number;
    isVerified: boolean;
  }
}

export default function PageHeader({ page }: PageHeaderProps) {
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const tabs = ['Posts', 'About', 'Mentions', 'Reviews'];

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-6xl mx-auto">
        {/* Cover Photo */}
        <div 
          className="h-64 md:h-80 w-full bg-gray-200 dark:bg-gray-700 rounded-b-lg bg-cover bg-center"
          style={{ backgroundImage: page.coverUrl ? `url(${page.coverUrl})` : 'none' }}
        />
        
        <div className="px-4 pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-12 md:-mt-8 mb-4">
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div 
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 bg-cover bg-center shrink-0"
                style={{ backgroundImage: page.avatarUrl ? `url(${page.avatarUrl})` : 'none' }}
              />
              <div className="pb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight flex items-center gap-2">
                  {page.name}
                  {page.isVerified && <BadgeCheck className="text-blue-500 mt-1" size={24} />}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {page.followerCount.toLocaleString()} followers • {page.category}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4 md:mt-0 w-full md:w-auto">
              <button 
                onClick={() => setIsFollowing(!isFollowing)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                  isFollowing 
                    ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isFollowing ? <><Check size={18} /> Following</> : '+ Follow'}
              </button>
            </div>
          </div>
          
          <hr className="border-gray-200 dark:border-gray-700 mb-2" />
          
          <div className="flex justify-between items-center">
            <div className="flex overflow-x-auto hide-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.toLowerCase() 
                      ? 'border-blue-600 text-blue-600 dark:text-blue-500' 
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg'
                  }`}
                >
                  {tab}
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
