'use client';

import React, { useState } from 'react';
import { X, Globe, Lock, Flag } from 'lucide-react';

export default function CreatePageModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API
    console.log('Creating page:', { name, category });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Flag size={20} className="text-blue-500" /> Create Page
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="E.g., My Awesome Business"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>Select a category</option>
              <option value="Creator">Creator / Public Figure</option>
              <option value="Business">Local Business</option>
              <option value="Brand">Brand or Product</option>
              <option value="Community">Community</option>
            </select>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            By creating a Page, you agree to our Pages Terms.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || !category} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium">
              Create Page
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
