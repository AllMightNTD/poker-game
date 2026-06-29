"use client";
import { useLogout } from "@/hooks/useLogout";
import { cn } from "@/lib/utils";
import {
  Bell,
  ChevronRight,
  CreditCard,
  Hash,
  HelpCircle,
  Lock,
  LogOut,
  MapPin,
  User
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewChange?: (view: string) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onViewChange,
}: SettingsModalProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { logout, isLoggingOut } = useLogout();
  const t = useTranslations("settings");
  const router = useRouter();

  if (!isOpen) return null;

  const sections = [
    {
      title: t("general"),
      items: [
        { id: "accountInfo", label: t("accountInfo"), icon: User, color: "bg-blue-500" },
        { id: "savedAddress", label: t("savedAddress"), icon: MapPin, color: "bg-orange-400" },
        { id: "socialAccount", label: t("socialAccount"), icon: Hash, color: "bg-orange-600" },
      ],
    },
    {
      title: t("account"),
      items: [
        { id: "myCards", label: t("myCards"), icon: CreditCard, color: "bg-pink-500" },
        { id: "password", label: t("password"), icon: Lock, color: "bg-blue-800" },
      ],
    },
    {
      title: t("other"),
      items: [
        { id: "notification", label: t("notification"), icon: Bell, color: "bg-orange-300" },
        { id: "help", label: t("help"), icon: HelpCircle, color: "bg-blue-600" },
        { id: "logout", label: t("logout"), icon: LogOut, color: "bg-red-500" },
      ],
    },
  ];
  const handleItemClick = (id: string) => {
    if (id === "logout") {
      logout();
      return;
    }
    if (id === "accountInfo") {
      onClose();
      router.push("/account");
    }
  };

  return (
    <>
      {/* Invisible backdrop for click-away (only when confirm dialog is NOT open) */}
      {!showLogoutConfirm && (
        <div className="fixed inset-0 z-40" onClick={onClose} />
      )}

      {/* Fixed Dropdown Content */}
      <div className="fixed cursor-pointer top-20 right-6 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="p-4">
          <h2 className="text-xl font-bold text-slate-800 mb-4 px-2">
            {t("title")}
          </h2>

          <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            {sections.map((section) => (
              <div key={section.title} className="cursor-pointer">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 px-2">
                  {section.title}
                </h3>
                <div className="space-y-0.5 cursor-pointer">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={cn(
                        "w-full cursor-pointer flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-all group",
                        item.id === "logout" && "hover:bg-red-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm",
                            item.color,
                          )}
                        >
                          <item.icon size={16} />
                        </div>
                        <span
                          className={cn(
                            "text-sm font-semibold transition-colors",
                            item.id === "logout"
                              ? "text-red-500 group-hover:text-red-600"
                              : "text-slate-600 group-hover:text-slate-900"
                          )}
                        >
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight
                        size={14}
                        className={cn(
                          "transition-colors",
                          item.id === "logout"
                            ? "text-red-200 group-hover:text-red-400"
                            : "text-slate-300 group-hover:text-slate-500"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
