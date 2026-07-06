"use client";

import { Gamepad2, LayoutDashboard, LogOut, Settings, ShieldAlert, Users, WalletCards } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const SIDEBAR_ITEMS = [
  { name: "Tổng quan", href: "/backstage/dashboard", icon: LayoutDashboard },
  { name: "Người dùng & Bảo mật", href: "/backstage/users", icon: Users },
  { name: "Tài chính & Giao dịch", href: "/backstage/finance", icon: WalletCards },
  { name: "Bàn Poker", href: "/backstage/tables", icon: Gamepad2 },
  { name: "Nhật ký hệ thống", href: "/backstage/audit", icon: ShieldAlert },
  { name: "Cài đặt hệ thống", href: "/backstage/settings", icon: Settings },
];

export const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_info");
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/backstage/login");
  };

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0 z-50">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
            <Gamepad2 size={18} className="text-slate-300" />
          </div>
          <div>
            <h1 className="text-slate-100 font-semibold text-sm leading-none">Quản trị</h1>
            <p className="text-slate-500 text-xs mt-0.5">Backstage</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive
                  ? "bg-slate-800 text-slate-100 font-medium"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
              >
                <Icon size={18} className={isActive ? "text-slate-100" : "text-slate-500"} />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors"
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};