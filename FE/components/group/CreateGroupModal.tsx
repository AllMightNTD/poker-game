'use client';

import api from '@/lib/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Eye, Globe, Image as ImageIcon, Lock, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface CreateGroupModalProps {
  onClose: () => void;
}

export default function CreateGroupModal({ onClose }: CreateGroupModalProps) {
  const t = useTranslations('group.createModal');
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [coverUrl, setCoverUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Danh sách ảnh bìa mẫu nghệ thuật để người dùng chọn nhanh (UX Sugar)
  const sampleCovers = [
    'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=600&q=80', // Gradient tím
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80', // Gradient xanh
    'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&q=80', // Nghệ thuật mây
  ];

  const createGroupMutation = useMutation({
    mutationFn: async (newGroup: any) => {
      const res = await api.post('/api/v1/groups', newGroup);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      onClose();
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || t('errorMsg'));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createGroupMutation.mutate({
      name,
      description,
      privacy,
      cover_url: coverUrl,
      avatar_url: avatarUrl,
      slug: createSlug(name),
    });
  };

  function createSlug(name: string) {
    const timestamp = Date.now();

    return `${name}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      + `-${timestamp}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto bg-gray-900/60 backdrop-blur-sm animate-fade-in">

      {/* Container của Modal: Tự động co giãn từ Mobile (Full screen) đến Desktop lớn (Max-w-5xl 2 cột) */}
      <div className="relative w-full h-full sm:h-auto sm:max-w-5xl bg-gray-50 dark:bg-gray-900 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300">

        {/* 📋 HEADER CỦA MODAL */}
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Sparkles size={18} />
            </span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('title')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* 📐 TRỌNG TÂM: CHIA LAYOUT 2 CỘT (FORM NHẬP & LIVE PREVIEW) */}
        <form onSubmit={handleSubmit} className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">

          {/* CỘT TRÁI (LG: 7 CỘT) - KHU VỰC ĐIỀN THÔNG TIN FORM */}
          <div className="p-6 lg:col-span-7 space-y-5 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700/50">

            {/* Mục 1: Tên nhóm */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{t('nameLabel')}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                className="w-full bg-gray-50 dark:bg-gray-700/40 focus:bg-white dark:focus:bg-gray-900 border border-transparent focus:border-blue-500/20 rounded-xl py-3 px-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm transition-all"
                placeholder={t('namePlaceholder')}
              />
              <div className="text-right text-[11px] text-gray-400">{name.length}/60</div>
            </div>

            {/* Mục 2: Quyền riêng tư */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{t('privacyLabel')}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option: Công khai */}
                <div
                  onClick={() => setPrivacy('public')}
                  className={`relative p-4 rounded-xl flex items-start gap-3 cursor-pointer transition-all select-none ${privacy === 'public'
                    ? 'bg-blue-50/60 dark:bg-blue-950/20 ring-2 ring-blue-500'
                    : 'bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                >
                  <Globe className={`mt-0.5 shrink-0 ${privacy === 'public' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} size={18} />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{t('privacyPublic')}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{t('privacyPublicDesc')}</p>
                  </div>
                  {privacy === 'public' && <CheckCircle2 size={16} className="absolute top-3 right-3 text-blue-600 dark:text-blue-400" />}
                </div>

                {/* Option: Riêng tư */}
                <div
                  onClick={() => setPrivacy('private')}
                  className={`relative p-4 rounded-xl flex items-start gap-3 cursor-pointer transition-all select-none ${privacy === 'private'
                    ? 'bg-blue-50/60 dark:bg-blue-950/20 ring-2 ring-blue-500'
                    : 'bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                >
                  <Lock className={`mt-0.5 shrink-0 ${privacy === 'private' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} size={18} />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{t('privacyPrivate')}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{t('privacyPrivateDesc')}</p>
                  </div>
                  {privacy === 'private' && <CheckCircle2 size={16} className="absolute top-3 right-3 text-blue-600 dark:text-blue-400" />}
                </div>
              </div>
            </div>

            {/* Mục 3: Ảnh bìa chọn nhanh hoặc dán Link */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{t('coverLabel')}</label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {sampleCovers.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCoverUrl(url)}
                    className={`relative w-20 h-12 rounded-lg overflow-hidden shrink-0 transition-transform active:scale-95 border-2 ${coverUrl === url ? 'border-blue-500 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={url} alt="sample" className="w-full h-full object-cover" />
                  </button>
                ))}
                <div className="relative flex-1 min-w-[140px]">
                  <input
                    type="text"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    className="w-full h-12 bg-gray-50 dark:bg-gray-700/40 rounded-xl pl-8 pr-3 text-xs focus:outline-none focus:bg-white dark:focus:bg-gray-900 border border-transparent focus:border-blue-500/20"
                    placeholder={t('coverPlaceholder')}
                  />
                  <ImageIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Mục 4: Mô tả nhóm */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{t('descLabel')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-gray-50 dark:bg-gray-700/40 focus:bg-white dark:focus:bg-gray-900 border border-transparent focus:border-blue-500/20 rounded-xl py-3 px-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm transition-all resize-none"
                placeholder={t('descPlaceholder')}
              />
            </div>
          </div>

          {/* CỘT PHẢI (LG: 5 CỘT) - KHU VỰC LIVE PREVIEW (ẨN TRÊN DI ĐỘNG ĐỂ TRÁNH RÁC UI) */}
          <div className="hidden lg:flex lg:col-span-5 p-6 bg-gray-50 dark:bg-gray-900/40 flex-col justify-between">
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <Eye size={14} /> {t('previewTitle')}
              </label>

              {/* Thẻ mô phỏng GroupHeader thu nhỏ */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                {/* Cover thu nhỏ */}
                <div className="h-28 bg-gray-200 dark:bg-gray-700 relative">
                  {coverUrl ? (
                    <img src={coverUrl} alt="preview cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-gray-400 text-xs font-medium">{t('noCoverPreview')}</div>
                  )}
                  {/* Avatar đè lên cover */}
                  <div className="absolute left-4 -bottom-5 w-12 h-12 rounded-xl bg-white dark:bg-gray-800 p-0.5 shadow-md">
                    <div className="w-full h-full rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-inner">
                      {name ? name.charAt(0).toUpperCase() : 'N'}
                    </div>
                  </div>
                </div>

                {/* Thông tin text bên dưới */}
                <div className="pt-7 px-4 pb-4 space-y-2">
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-base truncate leading-tight">
                    {name || t('defaultPreviewName')}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                    <span className="flex items-center gap-1">
                      {privacy === 'public' ? <Globe size={12} /> : <Lock size={12} />}
                      {privacy === 'public' ? t('privacyPublic') : t('privacyPrivate')}
                    </span>
                    <span>•</span>
                    <span>{t('memberCountPreview')}</span>
                  </div>
                </div>

                {/* Tab giả mô phỏng */}
                <div className="flex gap-4 px-4 border-t border-gray-50 dark:border-gray-700/30 text-[11px] font-bold text-gray-400 py-2">
                  <span className="text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1">{t('tabFeed')}</span>
                  <span>{t('tabMembers')}</span>
                  <span>{t('tabAbout')}</span>
                </div>
              </div>

              {/* Box mô tả widget giả lập */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-xs space-y-1">
                <h4 className="font-bold text-gray-400">{t('previewDescriptionTitle')}</h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed truncate-3-lines">
                  {description || t('defaultPreviewDesc')}
                </p>
              </div>
            </div>

            {/* Thông báo nhỏ giải thích */}
            <p className="text-[11px] text-gray-400 leading-normal">
              {t('footerNote')}
            </p>
          </div>
        </form>

        {/* 🛠️ FOOTER CỦA MODAL (NÚT BẤM CTA) */}
        <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors cursor-pointer"
          >
            {t('cancelBtn')}
          </button>
          <button
            type="button"
            disabled={!name.trim() || createGroupMutation.isPending}
            onClick={handleSubmit}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-700 dark:disabled:to-gray-700 text-white disabled:text-gray-400 dark:disabled:text-gray-500 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/10 transition-all active:scale-[0.98] cursor-pointer"
          >
            {createGroupMutation.isPending ? t('submitting') : t('submitBtn')}
          </button>
        </div>

      </div>
    </div>
  );
}