'use client';

import CreateGroupModal from '@/components/group/CreateGroupModal';
import GroupCard from '@/components/group/GroupCard';
import api from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { Compass, Info, Plus, Search, Sparkles, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function GroupsDiscoveryPage() {
  const t = useTranslations('group');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'joined'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // UX: Thêm Debounce giảm thiểu spam request API khi user gõ phím
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: groups, isLoading, isFetching } = useQuery({
    queryKey: ['groups', activeTab, debouncedSearch],
    queryFn: async () => {
      if (debouncedSearch) {
        const res = await api.get(`/api/v1/groups/search?q=${encodeURIComponent(debouncedSearch)}`);
        return res.data;
      }
      if (activeTab === 'joined') {
        const res = await api.get('/api/v1/groups/search');
        return res.data.filter((g: any) =>
          ['ACTIVE', 'PENDING', 'ADMIN', 'MODERATOR'].includes(g.user_status)
        );
      }
      const res = await api.get('/api/v1/groups/suggestions');
      return res.data;
    }
  });

  const filteredGroups = groups || [];

  return (
    // Tối ưu Padding theo từng nấc màn hình để tiết kiệm không gian trên Mobile
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 md:space-y-8 min-h-screen transition-all duration-300">

      {/* 🚀 BANNER HERO: Responsive đa góc nhìn */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 sm:p-8 md:p-12 text-white shadow-xl shadow-indigo-500/10 dark:shadow-none">
        {/* Đèn nền trang trí (Blobs) - Tự ẩn trên Mobile tránh lag màn hình */}
        <div className="hidden sm:block absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="hidden md:block absolute right-1/4 top-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md text-[11px] sm:text-xs font-semibold tracking-wide uppercase rounded-full text-white/90">
              <Sparkles size={12} className="animate-pulse text-yellow-300" /> Cộng đồng xu hướng
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              {t('page.explore')}
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm md:text-base font-normal opacity-90 leading-relaxed">
              Tìm kiếm những người có chung đam mê, kết nối và chia sẻ kiến thức ngay hôm nay cùng hàng ngàn thành viên khác.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 w-full lg:w-auto bg-white hover:bg-opacity-95 text-blue-600 active:scale-[0.98] px-5 py-3.5 sm:py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200 text-sm whitespace-nowrap self-start lg:self-auto"
          >
            <Plus size={18} className="stroke-[3]" />
            {t('page.createBtn')}
          </button>
        </div>
      </div>

      {/* 🔍 TOOLBAR: Tổ chức lại cấu trúc linh hoạt theo Flex/Grid */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800 pb-5">

        {/* Tabs Bộ lọc: Hỗ trợ Touch-swipe kéo ngang mượt mà trên Mobile */}
        <div className="flex items-center gap-1 bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${activeTab === 'all' && !searchQuery
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <Compass size={16} />
            {t('page.explore')}
          </button>
          <button
            onClick={() => setActiveTab('joined')}
            className={`flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${activeTab === 'joined' && !searchQuery
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <Users size={16} />
            {t('page.yourGroups')}
          </button>
        </div>

        {/* Thanh tìm kiếm thông minh có trạng thái Loading nhỏ bên trong */}
        <div className="relative w-full sm:max-w-xs md:max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className={`h-4 w-4 ${isFetching ? 'text-blue-500 animate-spin' : 'text-gray-400'}`} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-500/20 focus:bg-white dark:focus:bg-gray-900 rounded-xl leading-5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm transition-all duration-200"
            placeholder={t('page.searchPlaceholder')}
          />
          {/* UX: Nút xóa nhanh từ khóa (Clear Button) */}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 👥 GRID DANH SÁCH NHÓM: Phân cấp lưới chuẩn từ Mobile -> UltraWide */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {searchQuery ? 'Kết quả tìm kiếm' : activeTab === 'joined' ? 'Nhóm đã tham gia' : 'Gợi ý dành cho bạn'}
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          </h2>
          {!isLoading && (
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md">
              {filteredGroups.length} nhóm
            </span>
          )}
        </div>

        {isLoading ? (
          /* SKELETON GRID: Đồng bộ kích cỡ thẻ hoàn hảo */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="border border-gray-100 dark:border-gray-800/80 rounded-2xl p-5 space-y-4 animate-pulse bg-white dark:bg-gray-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                </div>
                <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg pt-4" />
              </div>
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          /* EMPTY STATE: Thiết kế minh họa tinh tế, không đơn điệu */
          <div className="text-center py-16 sm:py-24 bg-gray-50/50 dark:bg-gray-800/10 rounded-2xl px-4 max-w-md mx-auto">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Info size={20} />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Không tìm thấy kết quả</h3>
          </div>
        ) : (
          /* GRID THỰC TẾ: Tối ưu 1 cột (Mobile), 2 cột (Tablet), 3 cột (Desktop), 4 cột (Màn hình lớn) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredGroups.map((group: any) => (
              <div key={group.id} className="hover:-translate-y-1 hover:shadow-md rounded-2xl transition-all duration-300">
                <GroupCard
                  group={{
                    ...group,
                    privacy: group.privacy === 'PUBLIC' ? 'Public' : 'Private',
                    memberCount: group.member_count,
                    userStatus: group.user_status
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL TẠO NHÓM */}
      {isCreateModalOpen && (
        <CreateGroupModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </div>
  );
}