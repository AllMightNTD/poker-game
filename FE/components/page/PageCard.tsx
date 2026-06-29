import React from 'react';
import Link from 'next/link';
import { Flag, BadgeCheck } from 'lucide-react';

interface Page {
  id: string;
  name: string;
  category: string;
  followerCount: number;
  isVerified: boolean;
  avatarUrl?: string;
}

export default function PageCard({ page, isManaged = false }: { page: Page, isManaged?: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow flex items-center gap-4">
      <div 
        className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 bg-cover bg-center shrink-0"
        style={{ backgroundImage: page.avatarUrl ? `url(${page.avatarUrl})` : 'none' }}
      >
        {!page.avatarUrl && <Flag size={24} className="m-auto h-full text-gray-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <Link href={`/pages/${page.id}`}>
          <h3 className="font-bold text-gray-900 dark:text-white hover:underline truncate flex items-center gap-1">
            {page.name}
            {page.isVerified && <BadgeCheck size={16} className="text-blue-500" />}
          </h3>
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{page.category}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {page.followerCount.toLocaleString()} followers
        </p>
      </div>
      <div>
        {isManaged ? (
          <Link href={`/pages/${page.id}`} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors">
            Manage
          </Link>
        ) : (
          <button className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors">
            Follow
          </button>
        )}
      </div>
    </div>
  );
}
