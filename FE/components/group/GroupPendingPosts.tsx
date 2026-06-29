import React from 'react';
import { Check, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function GroupPendingPosts() {
  const t = useTranslations('group');
  const pendingPosts = [
    {
      id: '101',
      author: { name: 'Bob Johnson', avatar: 'https://i.pravatar.cc/150?u=4' },
      content: 'Hey everyone, I just joined! Looking forward to learning with you all. Does anyone know a good tutorial for React Query?',
      submittedAt: '5 mins ago'
    }
  ];

  if (pendingPosts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
          <Check size={24} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('pendingPosts.title')}</h3>
        <p className="text-gray-500 dark:text-gray-400">{t('pendingPosts.empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingPosts.map(post => (
        <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 bg-cover" style={{ backgroundImage: `url(${post.author.avatar})` }} />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{post.author.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Submitted {post.submittedAt}</p>
              </div>
            </div>
          </div>
          
          <p className="text-gray-800 dark:text-gray-200 mb-6">{post.content}</p>
          
          <div className="flex gap-3 border-t border-gray-100 dark:border-gray-700 pt-4">
            <button className="flex-1 flex justify-center items-center gap-2 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-lg font-medium transition-colors">
              <Check size={18} /> {t('pendingPosts.approve')}
            </button>
            <button className="flex-1 flex justify-center items-center gap-2 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg font-medium transition-colors">
              <X size={18} /> {t('pendingPosts.reject')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
