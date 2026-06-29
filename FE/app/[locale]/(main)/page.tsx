"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CreatePost from "@/components/feed/CreatePost";
import PostCard from "@/components/feed/PostCard";
import Stories from "@/components/feed/Stories";
import FriendRequests from "@/components/feed/FriendRequest";
import { FriendSuggestionsList } from "@/features/friends/components/FriendSuggestionsList";
import { useSocket } from "@/components/providers/SocketProvider";
import { useCurrentUser } from "@/core/providers/user-provider";
import api from "@/lib/axios";

const formatTimeAgo = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Vừa xong";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;

    return date.toLocaleDateString('vi-VN');
  } catch (e) {
    return "Vừa xong";
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

const mapBackendPostToFrontend = (bPost: any) => {
  const userProfile = bPost.user?.profile;
  const displayName = userProfile?.full_name || bPost.user?.email || "Người dùng ẩn danh";
  const avatarUrl = userProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`;

  return {
    id: bPost.id,
    user_id: bPost.user_id,
    audience: bPost.audience,
    user: {
      id: bPost.user?.id,
      name: displayName,
      avatar: avatarUrl,
    },
    time: formatTimeAgo(bPost.created_at),
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

export default function FeedPage() {
  const { currentUser } = useCurrentUser();
  const { socket } = useSocket();
  const [postsList, setPostsList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const LIMIT = 10;

  useEffect(() => {
    if (!socket) return;

    const handleNewPost = (newPost: any) => {
      const formatted = mapBackendPostToFrontend(newPost);
      setPostsList((prev) => {
        if (prev.some((p) => p.id === formatted.id)) return prev;
        return [formatted, ...prev];
      });
    };

    const handlePostReaction = (payload: any) => {
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
      const formatted = mapBackendPostToFrontend(updatedPost);
      setPostsList((prev) =>
        prev.map((post) => {
          if (post.id === formatted.id) {
            return {
              ...formatted,
              userReaction: post.userReaction,
            };
          }
          return post;
        })
      );
    };

    const handleCommentCreated = (comment: any) => {
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
  }, [socket]);

  const fetchFeedPosts = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/post', { params: { page: 1, limit: LIMIT } });
      const raw = res.data?.data || res.data?.metadata || res.data || [];
      const total = res.data?.meta?.total ?? raw.length;

      setPostsList(raw.map(mapBackendPostToFrontend));
      setPage(1);
      setHasMore(raw.length < total);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  }, []);

  const fetchMorePosts = useCallback(async () => {
    if (isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    try {
      const nextPage = page + 1;
      const res = await api.get('/api/v1/post', { params: { page: nextPage, limit: LIMIT } });
      const raw = res.data?.data || res.data?.metadata || res.data || [];
      const total = res.data?.meta?.total ?? 0;

      setPostsList((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newPosts = raw
          .map(mapBackendPostToFrontend)
          .filter((p: any) => !existingIds.has(p.id));
        return [...prev, ...newPosts];
      });
      setPage(nextPage);
      setHasMore(postsList.length + raw.length < total);
    } catch (error) {
      console.error("Failed to fetch more posts:", error);
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, hasMore, page, postsList.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchMorePosts();
      },
      { threshold: 0.1 }
    );
    const el = loaderRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [fetchMorePosts]);

  useEffect(() => {
    fetchFeedPosts();
  }, [fetchFeedPosts]);

  return (
    <>
      {/* Feed column */}
      <div className="flex-1 min-w-0 max-w-2xl mx-auto xl:mx-0 space-y-4">
        {/* Stories */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <Stories currentUser={currentUser} />
        </div>

        {/* Create Post */}
        <CreatePost currentUser={currentUser} onPostCreated={fetchFeedPosts} />

        {/* Posts */}
        {postsList.length > 0 ? (
          postsList.map((post) => (
            <PostCard key={post.id} post={post} currentUser={currentUser} onProfileClick={() => {}} />
          ))
        ) : (
          !isFetchingMore && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center mt-4">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👋</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Chào mừng bạn đến với mạng xã hội!</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Bảng tin của bạn đang trống. Hãy kết bạn hoặc đăng bài viết đầu tiên để bắt đầu trải nghiệm nhé.
              </p>
              <div className="mt-8 text-left">
                <FriendSuggestionsList />
              </div>
            </div>
          )
        )}

        {/* Infinite scroll loader */}
        <div ref={loaderRef} className="flex justify-center py-6">
          {isFetchingMore && (
            <div className="flex items-center gap-2 text-slate-400">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm font-medium">Đang tải thêm bài viết...</span>
            </div>
          )}
          {!hasMore && postsList.length > 0 && (
            <p className="text-sm text-slate-400 font-medium">Bạn đã xem hết bài viết 🎉</p>
          )}
        </div>
      </div>

      {/* Friend Requests (center-right) */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-20">
          <FriendRequests onSeeAll={() => {}} />
        </div>
      </aside>
    </>
  );
}
