"use client";

import React from "react";
import { Coins, X, Check } from "lucide-react";
import { usePokerGame } from "../hooks/usePokerGame";
import { useCurrentUser } from "@/core/providers/user-provider";

export const SitRequestModal: React.FC = () => {
  const { sitRequests, respondSitRequest, ownerId } = usePokerGame();
  const { currentUser } = useCurrentUser();

  const isOwner = currentUser?.id === ownerId;

  // Only show if the user is the host and there are pending requests
  if (!isOwner || !sitRequests || sitRequests.length === 0) return null;

  // Render the first request in the queue to avoid clutter
  const req = sitRequests[0];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-amber-500/50 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800/60 flex items-center gap-2 bg-slate-950/50">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Coins className="text-amber-500 w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
              Yêu cầu tham gia bàn
            </h3>
            <p className="text-[10px] font-bold text-amber-500 uppercase">
              {sitRequests.length - 1 > 0 ? `+${sitRequests.length - 1} yêu cầu khác đang chờ` : "Chờ bạn phê duyệt"}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center border-2 border-slate-700 overflow-hidden shadow-xl">
              {req.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={req.avatar} alt={req.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-slate-500">
                  {req.username ? req.username.slice(0, 2).toUpperCase() : "U"}
                </span>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-950 border-2 border-slate-800 rounded-lg flex items-center justify-center text-xs font-black text-slate-300">
              #{req.seat_number}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-black text-white uppercase tracking-wide">
              {req.username || "Player"}
            </h4>
            <p className="text-sm text-slate-400 mt-1">
              Muốn mang <span className="text-emerald-400 font-black">{parseInt(String(req.amount ?? req.buy_in_amount ?? 0)).toLocaleString()}</span> chips vào bàn
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-950/40 border-t border-slate-800/60 flex gap-3">
          <button
            onClick={() => respondSitRequest(req.request_id ?? req.id ?? "", false)}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            <X size={16} />
            Từ chối
          </button>
          <button
            onClick={() => respondSitRequest(req.request_id ?? req.id ?? "", true)}
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
          >
            <Check size={16} strokeWidth={3} />
            Phê duyệt
          </button>
        </div>
      </div>
    </div>
  );
};
