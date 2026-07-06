"use client";

import { Bell, Search } from "lucide-react";
import { useEffect, useState } from "react";

export const AdminHeader = () => {
  const [admin, setAdmin] = useState<{ user_name: string; role: string } | null>(null);

  useEffect(() => {
    const info = localStorage.getItem("admin_info");
    if (info) {
      try {
        setAdmin(JSON.parse(info));
      } catch (e) { }
    }
  }, []);

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="relative w-80">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Tìm kiếm UID, email, mã giao dịch..."
          className="w-full bg-slate-800/60 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-slate-500 transition-colors"
        />
      </div>

      <div className="flex items-center gap-5">
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        <div className="h-6 w-px bg-slate-800" />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-slate-100">{admin?.user_name || "Admin"}</div>
            <div className="text-xs text-slate-500">{admin?.role || "System"}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <span className="text-slate-200 font-medium text-xs">
              {admin?.user_name?.[0]?.toUpperCase() || "A"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};