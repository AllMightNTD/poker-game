'use client';

import React from 'react';
import PageHeader from '@/components/page/PageHeader';
import { useParams } from 'next/navigation';
import { Info, MapPin, Link as LinkIcon } from 'lucide-react';

export default function PageDetailPage() {
  const params = useParams();
  const id = params.id as string;

  // Mock data
  const page = {
    id,
    name: 'Tech Innovations',
    category: 'Technology Company',
    coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=200&q=80',
    followerCount: 125000,
    isVerified: true,
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <PageHeader page={page} />
      
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          {/* About Widget */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">About</h3>
            <div className="space-y-4">
              <div className="flex gap-3 text-gray-600 dark:text-gray-300 text-sm">
                <Info size={18} className="shrink-0" />
                <p>We build the future of software and hardware. Join us on our journey to innovate the world.</p>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 text-sm">
                <MapPin size={18} />
                <p>Silicon Valley, CA</p>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 text-sm">
                <LinkIcon size={18} />
                <a href="#" className="text-blue-500 hover:underline">techinnovations.com</a>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Create Post Input */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0"></div>
              <input 
                className="w-full bg-gray-100 dark:bg-gray-700 rounded-full px-4 text-gray-900 dark:text-white focus:outline-none"
                placeholder="Write something on this page..."
              />
            </div>
          </div>
          
          {/* Mock Feed */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-64 flex items-center justify-center text-gray-500">
            Page Timeline Content (Coming Soon)
          </div>
        </div>
      </div>
    </div>
  );
}
