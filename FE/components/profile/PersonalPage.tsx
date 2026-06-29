"use client";
import { useEffect, useState, useCallback } from "react";
import { Eye, Lock, Mail, MoreHorizontal, Loader2, Sparkles } from "lucide-react";
import { useSocket } from "@/components/providers/SocketProvider";
import CreatePost from "../feed/CreatePost";
import PostCard from "../feed/PostCard";
import { FriendActionButton } from "@/features/friends/components/FriendActionButton";
import { FollowButton } from "@/features/friends/components/FollowButton";
import { ProfileMusicPlayer } from "./ProfileMusicPlayer";
import api from "@/lib/axios";
import { useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProfileAboutTab } from "./tabs/ProfileAboutTab";
import { ProfileFriendsTab } from "./tabs/ProfileFriendsTab";
import { ProfilePhotosTab } from "./tabs/ProfilePhotosTab";
import { ProfileVideosTab } from "./tabs/ProfileVideosTab";
import { ProfileGroupsTab } from "./tabs/ProfileGroupsTab";

interface PersonalPageProps {
  user?: any;
  currentUser?: any;
}

const formatTimeAgo = (dateString: string, t: any) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return t("justNow");
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return t("minsAgo", { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t("hoursAgo", { count: hours });
    const days = Math.floor(hours / 24);
    if (days < 30) return t("daysAgo", { count: days });
    
    return date.toLocaleDateString();
  } catch (e) {
    return t("justNow");
  }
};

const getMediaUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
  return `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`;
};

const mapBackendPostToFrontend = (bPost: any, t: any) => {
  const userProfile = bPost.user?.profile;
  const displayName = userProfile?.full_name || bPost.user?.email || t("anonymous");
  const avatarUrl = userProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`;
  
  return {
    id: bPost.id,
    user_id: bPost.user_id,
    audience: bPost.audience,
    user: {
      name: displayName,
      avatar: avatarUrl,
      id: bPost.user?.id || bPost.user_id,
    },
    time: formatTimeAgo(bPost.created_at, t),
    content: bPost.content || "",
    images: bPost.media?.map((m: any) => getMediaUrl(m.file_url)) || [],
    rawMedia: bPost.media || [],
    likes: bPost.reaction_count || 0,
    comments: bPost.comment_count || 0,
    shares: bPost.share_count || 0,
    feeling: bPost.feeling,
    post_background: bPost.post_background,
    reactionStats: bPost.reactionStats || {},
    userReaction: bPost.userReaction || null,
  };
};

export default function PersonalPage({ user, currentUser }: PersonalPageProps) {
  const t = useTranslations("profile");
  const queryClient = useQueryClient();
  const [postsList, setPostsList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const displayUser = user || currentUser || {
    name: "Mohannad Zitoun",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mohannad&backgroundColor=ffdfbf"
  };

  const displayName = displayUser.name || displayUser.profile?.full_name || displayUser.email || t("member");
  const avatarUrl = displayUser.avatar || displayUser.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`;
  const { socket } = useSocket();
  const userId = displayUser.id || displayUser.user_id || currentUser?.id;

  // Lắng nghe bài viết mới và reaction mới qua socket phát sóng
  useEffect(() => {
    if (!socket || !userId) return;

    const handleNewPost = (newPost: any) => {
      // Chỉ chèn bài viết nếu tác giả của bài viết trùng với chủ sở hữu trang cá nhân này
      if (newPost.user_id !== userId) return;

      console.log("[PersonalPage] Realtime post received for profile:", newPost);
      const formatted = mapBackendPostToFrontend(newPost, t);
      setPostsList((prev) => {
        // Chống trùng lặp (double render)
        if (prev.some((p) => p.id === formatted.id)) return prev;
        return [formatted, ...prev];
      });
    };

    const handlePostReaction = (payload: any) => {
      console.log("[PersonalPage] Realtime reaction received for profile:", payload);
      setPostsList((prev) =>
        prev.map((post) => {
          if (post.id === payload.postId) {
            return {
              ...post,
              likes: payload.reactionCount,
              reactionStats: payload.stats,
            };
          }
          return post;
        })
      );
    };

    const handlePostUpdated = (updatedPost: any) => {
      console.log("[PersonalPage] Realtime post updated received for profile:", updatedPost);
      const formatted = mapBackendPostToFrontend(updatedPost, t);
      setPostsList((prev) =>
        prev.map((post) => {
          if (post.id === formatted.id) {
            return {
              ...formatted,
              userReaction: post.userReaction, // giữ nguyên user reaction hiện tại của mình
            };
          }
          return post;
        })
      );
    };

    const handleCommentCreated = (comment: any) => {
      console.log("[PersonalPage] Realtime comment created received:", comment);
      if (comment.postId) {
        setPostsList((prev) =>
          prev.map((post) => {
            if (post.id === comment.postId) {
              return {
                ...post,
                comments: (post.comments || 0) + 1,
              };
            }
            return post;
          })
        );
      }
    };

    const handleCommentDeleted = (payload: any) => {
      console.log("[PersonalPage] Realtime comment deleted received:", payload);
      if (payload.postId) {
        setPostsList((prev) =>
          prev.map((post) => {
            if (post.id === payload.postId) {
              return {
                ...post,
                comments: Math.max(0, (post.comments || 0) - 1),
              };
            }
            return post;
          })
        );
      }
    };

    socket.on("newPost", handleNewPost);
    socket.on("postReaction", handlePostReaction);
    socket.on("postUpdated", handlePostUpdated);
    socket.on("commentCreated", handleCommentCreated);
    socket.on("commentDeleted", handleCommentDeleted);

    return () => {
      socket.off("newPost", handleNewPost);
      socket.off("postReaction", handlePostReaction);
      socket.off("postUpdated", handlePostUpdated);
      socket.off("commentCreated", handleCommentCreated);
      socket.off("commentDeleted", handleCommentDeleted);
    };
  }, [socket, userId]);

  const profileTabs = [
    t("tabPosts"),
    t("tabAbout"),
    t("tabFriends"),
    t("tabPhotos"),
    t("tabVideos"),
    t("tabGroups"),
    t("tabEvents"),
  ];

  const { data: initialPosts, isLoading, error, refetch: fetchProfilePosts } = useQuery({
    queryKey: ['profilePosts', userId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/post/profile/${userId}?page=1&limit=20`);
      // API now returns { data, meta }
      const backendPosts = res.data?.data || res.data?.metadata || res.data || [];
      const postsArray = Array.isArray(backendPosts) ? backendPosts : [];
      return postsArray.map((p: any) => mapBackendPostToFrontend(p, t));
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (initialPosts) {
      setPostsList(initialPosts);
    }
  }, [initialPosts]);

  const isOwnProfile = userId === currentUser?.id;

  const updateMusicMutation = useMutation({
    mutationFn: async (musicId: string) => {
      await api.post("/api/v1/profile", { profile_music_id: musicId });
      return musicId;
    },
    onSuccess: (musicId) => {
      if (displayUser.profile) {
        displayUser.profile.profile_music_id = musicId;
      } else if (currentUser?.profile) {
        currentUser.profile.profile_music_id = musicId;
      }
      fetchProfilePosts();
    },
    onError: (err) => {
      console.error("Failed to update profile music", err);
    }
  });

  const handleUpdateProfileMusic = async (musicId: string) => {
    updateMusicMutation.mutate(musicId);
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto space-y-4 pb-12">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-300 relative">
        <ProfileMusicPlayer 
          musicId={displayUser?.profile?.profile_music_id || currentUser?.profile?.profile_music_id} 
          isOwnProfile={isOwnProfile}
          onUpdateMusic={handleUpdateProfileMusic}
        />
        
        {/* Cover Photo */}
        <div className="h-48 md:h-64 bg-slate-100 relative">
          <img
            src="https://images.unsplash.com/photo-1508766917616-d22f3f1eea14?auto=format&fit=crop&q=80&w=1200&h=400"
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Info Section */}
        <div className="px-6 pb-2 pt-14 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          {/* Avatar (positioned over cover) */}
          <div className="absolute -top-12 left-6 rounded-full border-4 border-white overflow-hidden w-24 h-24 bg-white shadow-md">
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover bg-slate-100"
            />
          </div>

          <div className="mt-2 sm:mt-0 sm:ml-28">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-1.5">
              {displayName}
              {isOwnProfile && <Sparkles size={16} className="text-yellow-500 fill-yellow-400" />}
            </h1>
            <p className="text-sm text-slate-500">
              {displayUser.email || `${displayName.toLowerCase().replace(/\s+/g, "")}@gmail.com`}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm font-medium text-slate-600">
              <span><strong className="text-slate-800">{displayUser.stats?.total_posts || 0}</strong> bài viết</span>
              <span><strong className="text-slate-800">{displayUser.stats?.total_friends || 0}</strong> bạn bè</span>
              <span><strong className="text-slate-800">{displayUser.stats?.total_followers || 0}</strong> người theo dõi</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isOwnProfile && (
              <>
                <FriendActionButton targetUserId={userId} currentUserId={currentUser?.id} />
                <FollowButton targetUserId={userId} currentUserId={currentUser?.id} />
              </>
            )}
            <button className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">
              <Mail size={18} />
            </button>
            <button className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 mt-4 flex items-center gap-6 border-t border-slate-100 overflow-x-auto scrollbar-hide">
          {profileTabs.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              className={`py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${idx === activeTab
                ? "border-slate-800 text-slate-800"
                : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content grid */}
      {activeTab === 0 && (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Column - Information */}
          <div className="w-full lg:w-[320px] shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">{t("aboutTitle")}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  {t("bioDesc")}
                </p>
              </div>

              <div className="space-y-5 pt-5 border-t border-slate-100">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-slate-400 mt-0.5" strokeWidth={2.5} />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t("privacy")}</p>
                    <p className="text-xs text-slate-400 font-medium">{t("privacyDesc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-slate-400 mt-0.5" strokeWidth={2.5} />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t("visibility")}</p>
                    <p className="text-xs text-slate-400 font-medium">{t("visibilityDesc")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Posts Feed */}
          <div className="w-full flex-1 min-w-0 space-y-4">
            {isOwnProfile && (
              <CreatePost currentUser={currentUser} onPostCreated={fetchProfilePosts} />
            )}

            {isLoading ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col items-center justify-center min-h-[200px]">
                <Loader2 size={24} className="animate-spin text-blue-500 mb-2" />
                <p className="text-slate-400 text-xs font-semibold">{t("loadingPosts")}</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                <p className="text-red-500 text-sm font-semibold">{t("loadError")}</p>
              </div>
            ) : postsList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center space-y-3">
                <span className="text-4xl">📝</span>
                <h3 className="text-sm font-bold text-slate-700">{t("noPosts")}</h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  {t("noPostsDesc")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {postsList.map((post) => (
                  <PostCard key={post.id} post={post} currentUser={currentUser} onProfileClick={() => {}} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 1 && <ProfileAboutTab user={displayUser} isOwnProfile={isOwnProfile} />}
      {activeTab === 2 && <ProfileFriendsTab user={displayUser} isOwnProfile={isOwnProfile} />}
      {activeTab === 3 && <ProfilePhotosTab user={displayUser} isOwnProfile={isOwnProfile} />}
      {activeTab === 4 && <ProfileVideosTab user={displayUser} isOwnProfile={isOwnProfile} />}
      {activeTab === 5 && <ProfileGroupsTab user={displayUser} isOwnProfile={isOwnProfile} />}
      {activeTab === 6 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center space-y-3">
          <span className="text-4xl">🎉</span>
          <h3 className="text-sm font-bold text-slate-700">Sự kiện (Đang phát triển)</h3>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Tính năng này đang được phát triển, vui lòng quay lại sau!
          </p>
        </div>
      )}
    </div>
  );
}
