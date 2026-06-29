"use client";

import MessagesPopup from "@/components/chat/MessagesPopup";
import { useSocket } from "@/components/providers/SocketProvider";
import { useDebounce } from "@/hooks/useDebounce";
import { useDeleteSearchHistory, useSaveSearchHistory, useSearchHistory, useSearchUsers } from "@/hooks/useSearch";
import { usePathname, useRouter } from "@/i18n/routing";
import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Clock,
  Home,
  Mail,
  Menu,
  MessageCircle,
  Search,
  Settings,
  User,
  Video,
  X,
  Zap,
  Repeat,
  Flag
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { NotificationCenter } from "./NotificationCenter";

interface NavbarProps {
  onMenuToggle: () => void;
  onSeeAllClick: () => void;
  onSettingsClick: () => void;
  isNotificationsActive: boolean;
  currentUser?: any;
}

export default function Navbar({
  onMenuToggle,
  onSeeAllClick,
  onSettingsClick,
  isNotificationsActive,
  currentUser: currentUserProp,
}: NavbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchHistory } = useSearchHistory();
  const { data: searchResults, isFetching: isSearching } = useSearchUsers(debouncedSearch);
  const deleteHistoryMutation = useDeleteSearchHistory();
  const saveHistoryMutation = useSaveSearchHistory();

  const handleSearchSubmit = (keyword: string) => {
    if (keyword.trim()) {
      saveHistoryMutation.mutate(keyword);
      // We can also route to a global search page if it exists
      // router.push(`/search?q=${encodeURIComponent(keyword)}`);
    }
  };

  const handleUserClick = (user: any) => {
    saveHistoryMutation.mutate(user.name); // Save their name as search history
    setSearchFocused(false);
    setSearchValue("");
    window.location.href = `/${locale}/profile/${user.id}`;
  };

  const [activeTab, setActiveTab] = useState("home");
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  const [localUser, setLocalUser] = useState<any>(null);
  const [totalUnread, setTotalUnread] = useState(0);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Actor Switcher
  const [isActorDropdownOpen, setIsActorDropdownOpen] = useState(false);
  const actorRef = useRef<HTMLDivElement>(null);
  const [activeActor, setActiveActor] = useState({ type: 'user', id: 'me', name: 'User' });
  
  // Mock pages for actor switching
  const myPages = [
    { id: '3', name: 'My Personal Blog', avatarUrl: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=200&q=80' }
  ];

  console.log('unreadNotifCount', unreadNotifCount);

  const { socket } = useSocket();
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { data: fetchedUser } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const res = await api.get("/api/v1/user/me");
      return res.data?.metadata || res.data;
    },
    enabled: !currentUserProp,
    retry: false
  });

  const resolvedUser = currentUserProp || fetchedUser;

  const { data: initialChatData } = useQuery({
    queryKey: ['navbar', 'chat_unread', resolvedUser?.id],
    queryFn: async () => {
      const res = await api.get("/api/v1/chat/conversations", {
        params: { page: 1, limit: 100 }
      });
      const list = res.data?.data || [];
      return list.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);
    },
    enabled: !!resolvedUser?.id
  });

  const { data: initialNotifData } = useQuery({
    queryKey: ['navbar', 'notifications', resolvedUser?.id],
    queryFn: async () => {
      const [listRes, countRes] = await Promise.all([
        api.get("/api/v1/notifications", { params: { page: 1, size: 20 } }),
        api.get("/api/v1/notifications/unread-count")
      ]);
      return {
        list: listRes.data?.data || [],
        unreadCount: countRes.data?.count || 0
      };
    },
    enabled: !!resolvedUser?.id
  });

  useEffect(() => {
    if (initialChatData !== undefined) {
      setTotalUnread(initialChatData);
    }
  }, [initialChatData]);

  useEffect(() => {
    if (initialNotifData) {
      setNotifications(initialNotifData.list);
      setUnreadNotifCount(initialNotifData.unreadCount);
    }
  }, [initialNotifData]);

  // Socket listener for new messages & seen events to update unread badge in Navbar
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: any) => {
      if (msg.sender_id !== resolvedUser?.id) {
        setTotalUnread((prev) => prev + 1);
      }
    };

    const handleMessageSeen = () => {
      // Fetch latest unread count when message is seen
      api.get("/api/v1/chat/conversations", {
        params: { page: 1, limit: 100 }
      }).then((res) => {
        const list = res.data?.data || [];
        const unread = list.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);
        setTotalUnread(unread);
        queryClient.invalidateQueries({ queryKey: ['navbar', 'chat_unread'] });
      }).catch((err) => console.error(err));
    };

    const handleNewNotification = (notification: any) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 20));
      setUnreadNotifCount((prev) => prev + 1);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageSeen", handleMessageSeen);
    socket.on("NEW_NOTIFICATION", handleNewNotification);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageSeen", handleMessageSeen);
      socket.off("NEW_NOTIFICATION", handleNewNotification);
    };
  }, [socket, resolvedUser?.id]);

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/api/v1/notifications/${id}/read`);
    },
    onSuccess: (_, id) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnreadNotifCount(prev => Math.max(0, prev - 1));
    },
    onError: (err) => console.error(err)
  });

  const handleMarkAsRead = (id: string) => {
    console.log('id', id);
    markAsReadMutation.mutate(id);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setIsMessagesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleSearchClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleSearchClickOutside);
    return () => document.removeEventListener("mousedown", handleSearchClickOutside);
  }, []);

  useEffect(() => {
    function handleLangClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleLangClickOutside);
    return () => document.removeEventListener("mousedown", handleLangClickOutside);
  }, []);

  useEffect(() => {
    function handleActorClickOutside(event: MouseEvent) {
      if (actorRef.current && !actorRef.current.contains(event.target as Node)) {
        setIsActorDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleActorClickOutside);
    return () => document.removeEventListener("mousedown", handleActorClickOutside);
  }, []);

  const changeLanguage = (newLocale: string) => {
    setIsLangOpen(false);
    localStorage.setItem("know_block_locale", newLocale);
    router.replace(pathname, { locale: newLocale });
  };

  const tabs = [
    { id: "home", icon: Home },
    { id: "zap", icon: Zap },
    { id: "video", icon: Video },
    { id: "profile", icon: User },
    { id: "mail", icon: Mail },
  ];

  const handleHomePage = () => {
    window.location.href = "/";
  };

  const displayAvatar = resolvedUser?.profile?.avatar_url || resolvedUser?.avatar || "/avatar-default.png";
  const displayFullName = resolvedUser?.profile?.full_name || resolvedUser?.email || "User";

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-100 z-30 flex items-center px-4 gap-3 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          className="lg:hidden text-slate-500 mr-1"
          onClick={onMenuToggle}
        >
          <Menu size={20} />
        </button>
        <div onClick={handleHomePage} className="flex items-center gap-1.5 cursor-pointer">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-white fill-white" />
          </div>
          <span className="font-extrabold text-slate-800 text-lg hidden sm:block">
            Sociala.
          </span>
        </div>
      </div>

      {/* Search */}
      <div
        ref={searchRef}
        className={cn(
          "flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 transition-all duration-200 flex-1 max-w-xs relative z-50",
          searchFocused ? "bg-white border border-blue-200 shadow-sm" : "",
        )}
      >
        <Search size={15} className="text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearchSubmit(searchValue);
            }
          }}
          placeholder={t("common.search")}
          className="bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none w-full"
          onFocus={() => setSearchFocused(true)}
        />
        {searchValue && (
          <button onClick={() => setSearchValue("")} className="text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}

        {/* Search Dropdown */}
        {searchFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden min-h-[100px] max-h-[400px] overflow-y-auto">
            {!debouncedSearch ? (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Gần đây
                </div>
                {searchHistory && searchHistory.length > 0 ? (
                  searchHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer group">
                      <div className="flex items-center gap-3 flex-1" onClick={() => setSearchValue(item.keyword)}>
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <Clock size={14} className="text-slate-400" />
                        </div>
                        <span className="text-sm text-slate-700 font-medium">{item.keyword}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteHistoryMutation.mutate(item.id); }}
                        className="text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-sm text-slate-500">Chưa có lịch sử tìm kiếm</div>
                )}
              </div>
            ) : (
              <div className="p-2">
                {isSearching ? (
                  <div className="px-3 py-4 text-center text-sm text-slate-500">Đang tìm kiếm...</div>
                ) : searchResults && searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer"
                      onClick={() => handleUserClick(user)}
                    >
                      <img src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-slate-100" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{user.name}</span>
                        <span className="text-xs text-slate-500">@{user.username}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-sm text-slate-500">Không tìm thấy kết quả</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Center Tabs */}
      <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
        {tabs.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer",
              activeTab === id
                ? "bg-blue-50 text-blue-500"
                : "text-slate-400 hover:bg-slate-50 hover:text-slate-600",
            )}
          >
            <Icon size={20} />
          </button>
        ))}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
        <div
          className="relative"
          ref={notificationsRef}
          onMouseEnter={() => setIsNotificationsOpen(true)}
          onMouseLeave={() => setIsNotificationsOpen(false)}
        >
          <button
            className={cn(
              "relative w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer",
              pathname === "/notifications"
                ? "bg-blue-50 text-blue-500"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            )}
          >
            <Bell size={18} className="cursor-pointer" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>

          {isNotificationsOpen && (
            <NotificationCenter
              notifications={notifications}
              unreadCount={unreadNotifCount}
              onClose={() => setIsNotificationsOpen(false)}
              onSeeAllClick={() => {
                setIsNotificationsOpen(false);
                router.push("/notifications");
              }}
              onMarkAsRead={handleMarkAsRead}
            />
          )}
        </div>

        {/* Messages Dropdown Popup Trigger */}
        <div className="relative" ref={messagesRef}>
          <button
            onClick={() => setIsMessagesOpen(!isMessagesOpen)}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-all relative cursor-pointer",
              isMessagesOpen ? "bg-blue-50 text-blue-500" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            )}
          >
            <MessageCircle size={18} />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                {totalUnread > 9 ? "9+" : totalUnread}
              </span>
            )}
          </button>

          {isMessagesOpen && (
            <MessagesPopup
              onClose={() => setIsMessagesOpen(false)}
              currentUser={resolvedUser}
            />
          )}
        </div>

        {/* Language Switcher */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="w-9 h-9 cursor-pointer rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all cursor-pointer font-bold uppercase text-xs"
          >
            {locale}
          </button>
          {isLangOpen && (
            <div className="absolute cursor-pointer top-12 right-0 w-32 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50">
              <button
                onClick={() => changeLanguage('vi')}
                className={cn("w-full cursor-pointer text-left px-4 py-2 text-sm hover:bg-slate-50", locale === 'vi' ? 'text-blue-500 font-bold' : 'text-slate-600')}
              >
                Tiếng Việt
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={cn("w-full cursor-pointer text-left px-4 py-2 text-sm hover:bg-slate-50", locale === 'en' ? 'text-blue-500 font-bold' : 'text-slate-600')}
              >
                English
              </button>
              <button
                onClick={() => changeLanguage('ja')}
                className={cn("w-full cursor-pointer text-left px-4 py-2 text-sm hover:bg-slate-50", locale === 'ja' ? 'text-blue-500 font-bold' : 'text-slate-600')}
              >
                日本語
              </button>
            </div>
          )}
        </div>

        {/* Actor Switcher */}
        <div className="relative hidden sm:block" ref={actorRef}>
          <button
            onClick={() => setIsActorDropdownOpen(!isActorDropdownOpen)}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer",
              isActorDropdownOpen ? "bg-blue-50 text-blue-500" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            )}
            title="Switch Actor"
          >
            <Repeat size={18} />
          </button>
          
          {isActorDropdownOpen && (
            <div className="absolute top-12 right-0 w-64 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50 p-2">
              <div className="text-xs font-bold text-slate-400 uppercase px-2 py-2">Tương tác dưới tư cách</div>
              
              <div 
                onClick={() => { setActiveActor({ type: 'user', id: resolvedUser?.id, name: displayFullName }); setIsActorDropdownOpen(false); }}
                className={cn("flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-50", activeActor.type === 'user' && "bg-blue-50")}
              >
                <img src={displayAvatar} className="w-8 h-8 rounded-full object-cover" />
                <span className="text-sm font-semibold text-slate-800">{displayFullName} (Cá nhân)</span>
              </div>
              
              <div className="h-px bg-slate-100 my-2"></div>
              <div className="text-xs font-bold text-slate-400 uppercase px-2 pb-2">Fanpage của bạn</div>
              
              {myPages.map(page => (
                <div 
                  key={page.id}
                  onClick={() => { setActiveActor({ type: 'page', id: page.id, name: page.name }); setIsActorDropdownOpen(false); }}
                  className={cn("flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-50", activeActor.id === page.id && "bg-blue-50")}
                >
                  <img src={page.avatarUrl} className="w-8 h-8 rounded-full object-cover" />
                  <span className="text-sm font-semibold text-slate-800">{page.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>


        <button
          onClick={onSettingsClick}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all cursor-pointer"
        >
          <Settings size={18} />
        </button>
        <img
          src={displayAvatar}
          alt={displayFullName}
          className="w-8 h-8 rounded-full object-cover cursor-pointer ring-2 ring-blue-100 hover:ring-blue-300 transition-all"
        />
      </div>
    </header>
  );
}
