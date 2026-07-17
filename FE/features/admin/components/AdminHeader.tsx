"use client";

import { useCurrentAdmin } from "@/core/providers/admin-provider";
import { Bell, Search } from "lucide-react";
import { FormInput } from "@/components/ui/form";

export const AdminHeader = () => {
  const { currentAdmin: admin } = useCurrentAdmin();

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="w-80">
        <FormInput
          type="text"
          placeholder="Tìm kiếm UID, email, mã giao dịch..."
          leftIcon={<Search size={16} />}
          size="small"
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