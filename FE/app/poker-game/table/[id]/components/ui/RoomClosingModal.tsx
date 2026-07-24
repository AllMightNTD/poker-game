"use client";

import { Activity, Clock, ShieldAlert } from "lucide-react";
import React from "react";
import { usePokerGame } from "../hooks/usePokerGame";

export const RoomClosingModal: React.FC = () => {
  const { roomClosing } = usePokerGame();

  if (!roomClosing) return null;

  const getReasonInfo = (reason: string) => {
    switch (reason) {
      case "NO_PLAYER_JOIN":
        return {
          title: "Phòng chơi không có người tham gia",
          description:
            "Phòng chơi vừa được khởi tạo nhưng không có người chơi nào tham gia trong 5 phút qua.",
        };
      case "EMPTY_ROOM":
        return {
          title: "Phòng chơi đang trống",
          description:
            "Tất cả người chơi đã rời khỏi bàn. Phòng sẽ tự động giải phóng tài nguyên.",
        };
      case "IDLE_TIMEOUT":
        return {
          title: "Bàn chơi tạm dừng quá lâu",
          description:
            "Không có ván bài nào được thực hiện trong 20 phút qua.",
        };
      case "ALL_SIT_OUT":
        return {
          title: "Tất cả người chơi tạm vắng",
          description:
            "Tất cả người chơi trên bàn đang ở trạng thái Sit Out quá 2 phút.",
        };
      case "OWNER_TIMEOUT":
        return {
          title: "Chủ phòng ngắt kết nối",
          description:
            "Chủ phòng đã ngắt kết nối quá 5 phút. Hệ thống đang tìm người làm Host mới hoặc đóng phòng.",
        };
      case "ROOM_EXPIRED":
        return {
          title: "Phòng chơi hết hạn tồn tại",
          description:
            "Bàn chơi đã hoạt động liên tục quá 24 giờ theo chính sách hệ thống.",
        };
      default:
        return {
          title: "Thông báo đóng phòng",
          description: "Bàn chơi sẽ tự động đóng do không có hoạt động.",
        };
    }
  };

  const info = getReasonInfo(roomClosing.reason);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce-in max-w-md w-[92%] sm:w-full">
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-rose-500/40 p-5 shadow-[0_0_40px_rgba(244,63,94,0.3)] text-white">
        {/* Top subtle glow bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 animate-pulse" />

        <div className="flex items-start space-x-4">
          {/* Animated Warning Icon Badge */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center border-2 border-slate-900">
              {roomClosing.remainSeconds}s
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-base text-rose-200 truncate">
                {info.title}
              </h4>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <Clock className="w-3 h-3 mr-1 inline" />
                {roomClosing.remainSeconds}s
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {info.description}
            </p>

            <div className="mt-3 flex items-center text-[11px] text-amber-400 font-medium bg-amber-500/10 rounded-lg px-2.5 py-1.5 border border-amber-500/20">
              <Activity className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 animate-spin" style={{ animationDuration: "3s" }} />
              <span>
                Thực hiện hành động, chat hoặc quay lại bàn để hủy đếm ngược.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
