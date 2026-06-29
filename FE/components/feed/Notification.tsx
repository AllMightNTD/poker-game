"use client";
import React, { useEffect, useState } from "react";
import { MoreHorizontal, Search, Settings, MailOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Notifications() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const [listRes, countRes] = await Promise.all([
        api.get("/api/v1/notifications", { params: { page: 1, size: 50 } }),
        api.get("/api/v1/notifications/unread-count")
      ]);
      return {
        list: listRes.data?.data || [],
        unreadCount: countRes.data?.count || 0
      };
    }
  });

  const notifications: any[] = data?.list || [];
  const unreadCount: number = data?.unreadCount || 0;

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.put("/api/v1/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.setQueryData(['notifications'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          list: old.list.map((n: any) => ({ ...n, read_at: new Date().toISOString() })),
          unreadCount: 0
        };
      });
    },
    onError: (err) => console.error(err)
  });

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Notification</h1>
          {unreadCount > 0 && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">{unreadCount}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
            <Search size={18} />
          </button>
          <button 
            onClick={handleMarkAllRead} 
            disabled={markAllReadMutation.isPending || unreadCount === 0}
            className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors disabled:opacity-50" 
            title="Mark all as read"
          >
            <MailOpen size={18} />
          </button>
          <button className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Không có thông báo nào</div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={cn(
                "p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer group",
                !item.read_at ? "bg-blue-50/30" : ""
              )}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={item.actor?.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.actor?.email}`}
                  alt={item.actor?.profile?.full_name || "User"}
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm text-slate-600 leading-snug">
                  <span className="font-bold text-slate-900 mr-1.5">{item.actor?.profile?.full_name || item.actor?.email || 'Người dùng'}</span>
                  {item.payload?.message || 'đã tương tác với bạn'}
                </p>
                <p className="text-xs font-semibold text-slate-400 mt-1.5">{formatTime(item.created_at)}</p>
              </div>

              {/* More Action */}
              <button className="text-slate-300 hover:text-slate-600 pt-1">
                <MoreHorizontal size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
