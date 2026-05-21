"use client";
import { contacts, currentUser } from "@/lib/mockData";
import { useMiniChat } from "@/components/chat/MiniChatContext";
import {
  Bell,
  Home,
  Mail,
  Menu,
  MessageCircle,
  Search,
  Settings,
  User,
  Video,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

interface NavbarProps {
  onMenuToggle: () => void;
  onBellClick: () => void;
  onSettingsClick: () => void;
  isNotificationsActive: boolean;
}

export default function Navbar({
  onMenuToggle,
  onBellClick,
  onSettingsClick,
  isNotificationsActive,
}: NavbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const { openPopup } = useMiniChat();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setIsMessagesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <div onClick={handleHomePage} className="flex items-center gap-1.5">
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
        className={cn(
          "flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 transition-all duration-200 flex-1 max-w-xs",
          searchFocused ? "bg-white border border-blue-200 shadow-sm" : "",
        )}
      >
        <Search size={15} className="text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Start typing to search..."
          className="bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none w-full"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </div>

      {/* Center Tabs */}
      <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
        {tabs.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
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
        <button
          onClick={onBellClick}
          className={cn(
            "relative w-9 h-9 rounded-xl flex items-center justify-center transition-all",
            isNotificationsActive
              ? "bg-blue-50 text-blue-500"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          )}
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="relative" ref={messagesRef}>
          <button
            onClick={() => setIsMessagesOpen(!isMessagesOpen)}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
              isMessagesOpen ? "bg-blue-50 text-blue-500" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            )}
          >
            <MessageCircle size={18} />
          </button>

          {isMessagesOpen && (
            <div className="fixed sm:absolute top-[60px] sm:top-12 left-4 right-4 sm:left-auto sm:-right-2 sm:w-[320px] bg-white border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.12)] rounded-2xl z-50 flex flex-col overflow-hidden max-h-[85vh] sm:max-h-auto">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Messages</h3>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => {
                      openPopup({
                        id: contact.id,
                        name: contact.name,
                        avatar: contact.avatar,
                        status: contact.online ? "online" : "offline",
                      });
                      setIsMessagesOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                  >
                    <div className="relative shrink-0">
                      <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full object-cover" />
                      {contact.online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="text-sm font-bold text-slate-800 truncate">{contact.name}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">{contact.time || "12:30 PM"}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {contact.unread ? <span className="font-semibold text-slate-800">New message...</span> : "Tap to open chat..."}
                      </p>
                    </div>
                    {contact.unread && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0"></span>
                    )}
                  </button>
                ))}
              </div>
              <div className="p-3 border-t border-slate-100 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                <span className="text-xs font-bold text-blue-500">
                  See all in Messenger
                </span>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onSettingsClick}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
        >
          <Settings size={18} />
        </button>
        <img
          src={currentUser.avatar}
          alt="Me"
          className="w-8 h-8 rounded-full object-cover cursor-pointer ring-2 ring-blue-100 hover:ring-blue-300 transition-all"
        />
      </div>
    </header>
  );
}
