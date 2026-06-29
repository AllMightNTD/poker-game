'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Flag } from 'lucide-react';
import CreatePageModal from '@/components/page/CreatePageModal';
import PageCard from '@/components/page/PageCard';

export default function PagesDiscoveryPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Mock data
  const suggestedPages = [
    { id: '1', name: 'Tech Innovations', category: 'Technology', followerCount: 125000, isVerified: true, avatarUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=200&q=80' },
    { id: '2', name: 'Gourmet Kitchen', category: 'Food & Beverage', followerCount: 45000, isVerified: false, avatarUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=200&q=80' },
  ];

  const myPages = [
    { id: '3', name: 'My Personal Blog', category: 'Creator', followerCount: 120, isVerified: false, avatarUrl: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=200&q=80' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Flag size={28} className="text-blue-500" /> Pages
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Discover and connect with businesses and creators</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Create Page
        </button>
      </div>

      <div className="mb-8 relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search pages..."
        />
      </div>

      {myPages.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pages You Manage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPages.map(page => (
              <PageCard key={page.id} page={page} isManaged={true} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Suggested for You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestedPages.map(page => (
            <PageCard key={page.id} page={page} />
          ))}
        </div>
      </div>

      {isCreateModalOpen && <CreatePageModal onClose={() => setIsCreateModalOpen(false)} />}
    </div>
  );
}
