'use client';

import CreatePost from '@/components/feed/CreatePost';
import GroupHeader from '@/components/group/GroupHeader';
import GroupMembersList from '@/components/group/GroupMembersList';
import GroupPendingPosts from '@/components/group/GroupPendingPosts';
import TransferOwnerModal from '@/components/group/TransferOwnerModal';
import { useCurrentUser } from "@/core/providers/user-provider";
import api from '@/lib/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Hash, Image, MessageSquare, Plus, ShieldAlert, Smile, Sparkles, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

// component con hiển thị từng bài viết sau khi đăng
function GroupPostCard({ post }: { post: any }) {
  const t = useTranslations('group');
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/50 transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 font-bold flex items-center justify-center text-gray-600 dark:text-gray-300">
          {post.author_name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{post.author_name || t('members.roleMember')}</h4>
          <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
    </div>
  );
}

export default function GroupDetailPage() {
  const t = useTranslations('group');
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState('feed');
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const { currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // 1. Fetch dữ liệu thông tin Group
  const { data: groupData, isLoading: isGroupLoading } = useQuery({
    queryKey: ['group', id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/groups/${id}`);
      return res.data;
    }
  });

  // 2. Fetch danh sách bài viết công khai của Group (Xử lý logic hiển thị danh sách bài đăng)
  const { data: postsData, isLoading: isPostsLoading } = useQuery({
    queryKey: ['groupPosts', id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/groups/${id}/posts`);
      return res.data.data || []; // API trả về { data: [...], meta: {...} }
    },
    enabled: !!id,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/api/v1/groups/${id}/join`);
      return res.data;
    },
    onSuccess: () => {
      showToast('success', 'Yêu cầu tham gia nhóm đã được gửi thành công!');
      queryClient.invalidateQueries({ queryKey: ['group', id] });
      queryClient.invalidateQueries({ queryKey: ['groupMembers', id] });
      queryClient.invalidateQueries({ queryKey: ['groupPosts', id] });
    },
    onError: (err: any) => {
      showToast('error', err.response?.data?.message || 'Không thể tham gia nhóm lúc này. Vui lòng thử lại.');
    }
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/api/v1/groups/${id}/leave`);
      return res.data;
    },
    onSuccess: () => {
      showToast('success', 'Bạn đã rời nhóm thành công.');
      queryClient.invalidateQueries({ queryKey: ['group', id] });
      queryClient.invalidateQueries({ queryKey: ['groupMembers', id] });
      queryClient.invalidateQueries({ queryKey: ['groupPosts', id] });
      // Nếu rời private group, chuyển tab về about vì feed sẽ không còn xem được
      if (groupData?.privacy === 'PRIVATE') {
        setActiveTab('about');
      }
    },
    onError: (err: any) => {
      showToast('error', err.response?.data?.message || 'Lỗi khi rời nhóm.');
    }
  });

  const handleLeaveGroup = () => {
    if (confirm('Bạn có chắc chắn muốn rời khỏi nhóm này không?')) {
      leaveMutation.mutate();
    }
  };

  // UX: Skeleton Loading mượt mà, đồng bộ cấu trúc layout thực tế
  if (isGroupLoading || isPostsLoading) {
    return (
      <div className="w-full bg-gray-50 dark:bg-gray-950 min-h-screen animate-pulse">
        <div className="w-full h-48 sm:h-64 md:h-80 bg-gray-200 dark:bg-gray-800" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          </div>
          <div className="h-44 bg-gray-200 dark:bg-gray-800 rounded-2xl hidden lg:block" />
        </div>
      </div>
    );
  }

  // UX: Màn hình báo lỗi tinh tế khi không tìm thấy Group
  if (!groupData) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-gray-950">
        <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-2xl mb-4 shadow-sm border border-red-100 dark:border-red-900/20">
          <ShieldAlert size={40} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('detail.notFound')}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-sm leading-relaxed">
          Đường dẫn có thể đã bị hỏng, quyền truy cập bị hạn chế hoặc cộng đồng này đã ngừng hoạt động.
        </p>
      </div>
    );
  }

  const group = {
    id: groupData.id,
    name: groupData.name,
    coverUrl: groupData.cover_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    avatarUrl: groupData.avatar_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=200&q=80',
    memberCount: groupData.member_count,
    privacy: groupData.privacy === 'PUBLIC' ? 'public' : 'private',
    description: groupData.description,
    currentUserRole: groupData.currentUserRole,
    isMember: groupData.isMember,
    canViewPosts: groupData.canViewPosts
  };

  const hasPosts = postsData && postsData.length > 0;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen w-full relative transition-colors duration-300 selection:bg-blue-500 selection:text-white">

      {/* 🔔 TOAST NOTIFICATION SYSTEM */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-xl border text-sm font-medium animate-in slide-in-from-bottom-5 duration-300 text-white max-w-md backdrop-blur-md ${toastMessage.type === 'success' ? 'bg-emerald-600/95 border-emerald-500' : 'bg-red-600/95 border-red-500'
          }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertTriangle size={18} className="shrink-0" />}
          <span className="flex-1">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="p-0.5 hover:bg-white/20 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {/* CREATE POST MODAL */}
      {isCreatePostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl relative border border-gray-100 dark:border-gray-800 transform transition-all duration-300 max-h-[90vh] sm:max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                <Plus size={20} className="text-blue-500" /> {t('createPostModal.title') || 'Tạo bài viết trong nhóm'}
              </h3>
              <button
                onClick={() => setIsCreatePostModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <CreatePost
                currentUser={currentUser}
                groupId={id}
                onPostCreated={() => {
                  setIsCreatePostModalOpen(false);
                  // Refresh lại cả danh sách bài chờ duyệt lẫn bài viết chính thức
                  queryClient.invalidateQueries({ queryKey: ['groupPendingPosts', id] });
                  queryClient.invalidateQueries({ queryKey: ['groupPosts', id] });
                  showToast('success', 'Bài viết đã được gửi thành công!');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TRANSFER OWNER MODAL */}
      {isTransferModalOpen && (
        <TransferOwnerModal
          groupId={id as string}
          onClose={() => setIsTransferModalOpen(false)}
          onSuccess={() => {
            setIsTransferModalOpen(false);
            showToast('success', 'Đã chuyển quyền quản trị thành công.');
            // Leave group immediately after transfer if desired, but user might just want to transfer.
            // If they click "Transfer & Leave", backend already removed them from the group.
            if (group?.privacy === 'Riêng tư') {
              setActiveTab('about');
            }
          }}
        />
      )}

      {/* 🔲 HEADER COMPONENT */}
      <div className="w-full bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800/80">
        <GroupHeader
          group={group}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onJoinGroup={() => joinMutation.mutate()}
          onLeaveGroup={handleLeaveGroup}
          onTransferOwner={() => setIsTransferModalOpen(true)}
          isJoinPending={joinMutation.isPending || leaveMutation.isPending}
          currentUserRole={group.currentUserRole}
          isMember={group.isMember}
        />
      </div>

      {/* 📐 BODY LAYOUT */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* CỘT TRÁI (MAIN CONTENT) */}
          <div className="lg:col-span-2 space-y-5">
            {activeTab === 'feed' && (
              <>
                {!group.canViewPosts ? (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 sm:p-12 shadow-sm border border-gray-100 dark:border-gray-800/60 flex flex-col items-center justify-center text-center">
                    <ShieldAlert size={48} className="text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('detail.privateGroup') || 'Nhóm riêng tư'}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{t('detail.privateContent')}</p>
                  </div>
                ) : (
                  <>
                    {/* ✍️ Ô ĐĂNG BÀI NHANH (MÔ PHỎNG MXH CAO CẤP) - Chỉ hiện khi là Member */}
                    {group.isMember && (
                      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800/60 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div className="absolute -inset-0.5 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full blur opacity-40" />
                            <div className="relative w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 font-bold text-sm">
                              {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                          </div>

                          <button
                            className="flex-1 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-left rounded-xl py-2.5 px-4 text-gray-500 dark:text-gray-400 text-sm transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                            onClick={() => setIsCreatePostModalOpen(true)}
                          >
                            {t('feed.createPostPlaceholder') || `${group.name} ơi, hôm nay bạn muốn chia sẻ điều gì?`}
                          </button>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
                          <button onClick={() => setIsCreatePostModalOpen(true)} className="flex items-center justify-center gap-2 flex-1 py-2 px-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-semibold text-xs sm:text-sm transition-colors group">
                            <Image size={18} className="transition-transform group-hover:scale-110" />
                            <span>Ảnh/Video</span>
                          </button>

                          <button onClick={() => setIsCreatePostModalOpen(true)} className="flex items-center justify-center gap-2 flex-1 py-2 px-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-semibold text-xs sm:text-sm transition-colors group">
                            <Hash size={18} className="transition-transform group-hover:scale-110" />
                            <span>Chủ đề</span>
                          </button>

                          <button onClick={() => setIsCreatePostModalOpen(true)} className="flex items-center justify-center gap-2 flex-1 py-2 px-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-500 dark:text-amber-400 font-semibold text-xs sm:text-sm transition-colors group">
                            <Smile size={18} className="transition-transform group-hover:scale-110" />
                            <span>Cảm xúc</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 🎨 ĐIỀU KIỆN HIỂN THỊ: EMPTY STATE HOẶC DANH SÁCH BÀI VIẾT */}
                    {!hasPosts ? (
                      /* TRẠNG THÁI CHƯA CÓ BÀI ĐĂNG */
                      <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl p-8 sm:p-12 shadow-sm border border-gray-100 dark:border-gray-800/60 flex flex-col items-center justify-center text-center min-h-[350px] group">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative w-20 h-20 bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800/60 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-105 shadow-sm border border-blue-100/50 dark:border-gray-700">
                          <MessageSquare size={36} strokeWidth={1.5} />
                          <span className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full ring-4 ring-white dark:ring-gray-900 animate-pulse" />
                        </div>

                        <div className="relative z-10 space-y-2 max-w-sm">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                            {t('emptyFeedTitle') || 'Cộng đồng đang đợi bài viết đầu tiên'}
                          </h4>
                          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
                            {t('emptyFeedDesc') || (
                              <>Hãy là người thắp lửa cho <span className="text-blue-600 dark:text-blue-400 font-semibold">{group.name}</span>. Chia sẻ kiến thức hoặc đặt câu hỏi ngay lúc này!</>
                            )}
                          </p>
                        </div>

                        {/* NÚT KÊU GỌI CTA ĐƯỢC TỐI ƯU CỰC ĐẸP */}
                        {group.isMember && (
                          <button
                            onClick={() => setIsCreatePostModalOpen(true)}
                            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
                          >
                            <Sparkles size={16} />
                            <span>✨ {t('writePostBtn') || 'Viết bài ngay'}</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      /* DANH SÁCH BÀI VIẾT KHI ĐÃ CÓ DỮ LIỆU */
                      <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between px-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{t('latestPosts') || 'Bài viết mới nhất'}</h3>
                        </div>
                        {postsData.map((post: any) => (
                          <GroupPostCard key={post.id} post={post} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* CÁC TAB KHÁC */}
            {activeTab === 'members' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800/60">
                <GroupMembersList groupId={id} />
              </div>
            )}
            {activeTab === 'pending posts' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800/60">
                <GroupPendingPosts />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}