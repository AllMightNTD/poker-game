"use client";
import { Link } from "@/i18n/routing";
import { morePages, navItems } from "@/lib/mockData";
import { useTranslations } from "next-intl";
import {
  Award,
  BarChart2,
  Building2,
  Calendar,
  Globe,
  Home,
  Mail,
  MessageCircle,
  Settings,
  Tv,
  User,
  Users,
  X,
  Coins,
} from "lucide-react";
import { cn } from "../../lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Home,
  Award,
  Globe,
  Users,
  User,
  Mail,
  Building2,
  Calendar,
  Tv,
  Settings,
  BarChart2,
  MessageCircle,
  Coins,
};

interface LeftSidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function LeftSidebar({
  activeNav,
  onNavChange,
  mobileOpen,
  onMobileClose,
}: LeftSidebarProps) {
  const t = useTranslations("sidebar");

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100 z-50 flex flex-col pt-16 pb-6 overflow-y-auto transition-transform duration-300",
          "lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0 lg:z-auto lg:pt-4",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Mobile close */}
        <button
          className="absolute top-4 right-4 lg:hidden text-slate-400 hover:text-slate-600"
          onClick={onMobileClose}
        >
          <X size={20} />
        </button>

        {/* New Feeds */}
        <div className="px-4 mb-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {t("newFeeds")}
          </p>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon];
              
              // Map nav id to path
              let path = "/";
              if (item.id === "profile") path = "/profile";
              else if (item.id === "friends") path = "/friends";
              else if (item.id === "newsfeed") path = "/";
              else if (item.id === "poker-game") path = "/poker-game";

              return (
                <Link
                  key={item.id}
                  href={path}
                  onClick={onMobileClose}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    activeNav === item.id || (activeNav === "" && item.id === "newsfeed")
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800",
                  )}
                >
                  <span
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      item.bg,
                    )}
                  >
                    <Icon size={16} className={item.color} />
                  </span>
                  {t(item.id)}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mx-4 my-3 border-t border-slate-100" />

        {/* More Pages */}
        <div className="px-4 mb-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {t("morePages")}
          </p>
          <nav className="space-y-0.5">
            {morePages.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <button
                  key={item.id}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-slate-500" />
                    </span>
                    {t(item.id)}
                  </div>
                  {item.badge && (
                    <span className="bg-orange-400 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[28px] text-center">
                      {item.badge > 999 ? "999+" : item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mx-4 my-3 border-t border-slate-100" />

        {/* Account */}
        <div className="px-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {t("account")}
          </p>
          <nav className="space-y-0.5">
            {[
              { label: "settings", icon: "Settings" },
              { label: "analytics", icon: "BarChart2" },
              { label: "chat", icon: "MessageCircle", badge: 23, href: "/messages" },
            ].map((item) => {
              const Icon = iconMap[item.icon];
              const content = (
                <>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-slate-500" />
                    </span>
                    {t(item.label)}
                  </div>
                  {item.badge && (
                    <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              );

              if (item.href) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all duration-200"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={item.label}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all duration-200"
                >
                  {content}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
