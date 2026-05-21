// src/app/(main)/layout.tsx
"use client";
import CreatePost from "@/components/feed/CreatePost";
import FriendRequests from "@/components/feed/FriendRequest";
import Notifications from "@/components/feed/Notification";
import PostCard from "@/components/feed/PostCard";
import Stories from "@/components/feed/Stories";
import Account from "@/components/layout/Account";
import LeftSidebar from "@/components/layout/LeftSidebar";
import Navbar from "@/components/layout/NavBar";
import RightSidebar from "@/components/layout/RightSidebar";
import SettingsModal from "@/components/layout/SettingsModal";
import PersonalPage from "@/components/profile/PersonalPage";
import MiniChatContainer from "@/components/chat/MiniChatContainer";
import { MiniChatProvider } from "@/components/chat/MiniChatContext";
import api from "@/lib/axios";
import { posts } from "@/lib/mockData";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { useSocket } from "@/components/providers/SocketProvider";

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

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { socket } = useSocket();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [postsList, setPostsList] = useState<any[]>([]);

  const [activeNav, setActiveNav] = useState("newsfeed");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState("feed"); // "feed", "notifications", "account", "profile"
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<any>(null);

  // Lắng nghe bài viết mới và reaction mới qua socket phát sóng
  useEffect(() => {
    if (!socket) return;

    const handleNewPost = (newPost: any) => {
      console.log("[MainLayout] Realtime post received:", newPost);
      const formatted = mapBackendPostToFrontend(newPost);
      setPostsList((prev) => {
        // Chống trùng lặp (double render) đối với bài đăng của chính mình
        if (prev.some((p) => p.id === formatted.id)) return prev;
        return [formatted, ...prev];
      });
    };

    const handlePostReaction = (payload: any) => {
      console.log("[MainLayout] Realtime reaction received:", payload);
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
      console.log("[MainLayout] Realtime post updated received:", updatedPost);
      const formatted = mapBackendPostToFrontend(updatedPost);
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

    socket.on("newPost", handleNewPost);
    socket.on("postReaction", handlePostReaction);
    socket.on("postUpdated", handlePostUpdated);

    return () => {
      socket.off("newPost", handleNewPost);
      socket.off("postReaction", handlePostReaction);
      socket.off("postUpdated", handlePostUpdated);
    };
  }, [socket]);

  const fetchFeedPosts = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/post');
      const backendPosts = res.data?.metadata || res.data || [];
      const formattedBackendPosts = backendPosts.map(mapBackendPostToFrontend);
      
      // Kết hợp posts động từ backend (ở trên cùng) và posts tĩnh làm fallback
      setPostsList([...formattedBackendPosts, ...posts]);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      // Nếu API lỗi, dùng mock posts hoàn toàn
      setPostsList(posts);
    }
  }, []);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        // Gọi getMe endpoint
        const res = await api.get('/api/v1/user/me');
        setCurrentUser(res.data?.metadata || res.data);
        
        // Fetch posts sau khi login thành công
        await fetchFeedPosts();
      } catch (error) {
        Cookies.remove('accessToken');
        router.push('/login');
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchMe();
  }, [router, fetchFeedPosts]);

  const handleBellClick = () => {
    setActiveView(activeView === "notifications" ? "feed" : "notifications");
  };

  const handleNavChange = (id: string) => {
    setActiveNav(id);
    if (id === "profile") {
      setProfileUser(null); // default to current user if clicked from sidebar
      setActiveView("profile");
    } else {
      setActiveView("feed");
    }
  };

  const handleProfileClick = (user: any) => {
    setProfileUser(user);
    setActiveView("profile");
  };

  console.log("activeView", activeView);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-500 font-medium">Đang tải dữ liệu người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <MiniChatProvider>
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar
        onMenuToggle={() => setMobileMenuOpen(true)}
        onBellClick={handleBellClick}
        onSettingsClick={() => setIsSettingsOpen(true)}
        isNotificationsActive={activeView === "notifications"}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onViewChange={setActiveView}
      />

      <div className="flex pt-14 max-w-[1400px] mx-auto">
        {/* Left Sidebar */}
        <LeftSidebar
          activeNav={activeNav}
          onNavChange={handleNavChange}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        {/* Main content */}
        <main className="flex-1 flex gap-4 px-3 md:px-4 py-4 min-w-0">
          {activeView === "profile" ? (
            <div className="flex-1 min-w-0 mx-auto xl:mx-0 space-y-4">
              <PersonalPage user={profileUser || currentUser} currentUser={currentUser} />
            </div>
          ) : (
            <>
              {/* Feed column */}
              <div className="flex-1 min-w-0 max-w-2xl mx-auto xl:mx-0 space-y-4">
                {activeView === "notifications" ? (
                  <Notifications />
                ) : activeView === "account" ? (
                  <Account onBack={() => setActiveView("feed")} />
                ) : (
                  <>
                    {/* Stories */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                      <Stories />
                    </div>

                    {/* Create Post */}
                    <CreatePost currentUser={currentUser} onPostCreated={fetchFeedPosts} />

                    {/* Posts */}
                    {postsList.map((post) => (
                      <PostCard key={post.id} post={post} currentUser={currentUser} onProfileClick={() => handleProfileClick(post.user)} />
                    ))}

                    {/* Load more */}
                    <div className="flex justify-center py-4">
                      <button className="text-sm text-slate-400 hover:text-blue-500 font-medium transition-colors flex items-center gap-2 group">
                        <span className="w-4 h-0.5 bg-slate-200 group-hover:bg-blue-200 transition-colors rounded-full" />
                        Load more posts
                        <span className="w-4 h-0.5 bg-slate-200 group-hover:bg-blue-200 transition-colors rounded-full" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Friend Requests (center-right) */}
              {activeView == "feed" && (
                <aside className="hidden lg:block w-72 flex-shrink-0">
                  <div className="sticky top-20">
                    <FriendRequests />
                  </div>
                </aside>
              )}
            </>
          )}
        </main>

        {/* Right Sidebar */}
        <RightSidebar currentUser={currentUser} />
      </div>

      {/* Mini Chat Popups - fixed bottom right */}
      <MiniChatContainer currentUser={currentUser} />
    </div>
    </MiniChatProvider>
  );
}
