"use client";

import { Play, Settings, X } from "lucide-react";
import React, { useState } from "react";
import { usePokerGame } from "../hooks/usePokerGame";

interface HostSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HostSettingsModal: React.FC<HostSettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    players,
    smallBlind,
    bigBlind,
    modifyBlinds,
    kickPlayer,
    forceSitOut,
    modifyPlayerStack,
    sitRequests,
    respondSitRequest,
    startGame,
    gameStage,
  } = usePokerGame();

  const [newSb, setNewSb] = useState(parseInt(smallBlind) || 50);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [stackChangeVal, setStackChangeVal] = useState("");

  if (!isOpen) return null;

  const handleUpdateBlinds = async () => {
    try {
      await modifyBlinds(newSb);
    } catch (e) {
      console.error(e);
    }
  };

  const handleKick = async (seat: number) => {
    if (confirm("Bạn có chắc chắn muốn mời người chơi này ra khỏi bàn?")) {
      try {
        await kickPlayer(seat);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleForceSitout = async (seat: number) => {
    try {
      await forceSitOut(seat);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStackModify = async (action: "add" | "subtract") => {
    if (selectedSeat === null) return;
    const amount = parseInt(stackChangeVal);
    if (isNaN(amount) || amount <= 0) {
      alert("Vui lòng nhập lượng phỉnh hợp lệ!");
      return;
    }
    try {
      await modifyPlayerStack(selectedSeat, amount, action);
      setStackChangeVal("");
      setSelectedSeat(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="text-amber-500 w-5 h-5" />
            <h3 className="text-base font-black text-slate-100 uppercase tracking-wider">
              Quản Trị Bàn Đấu (Chủ Phòng)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 max-h-[70vh]">
          {/* Start Game Action */}
          {gameStage === "ended" && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wide">Bắt đầu ván đấu mới</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Yêu cầu tối thiểu 2 người chơi đã ngồi vào ghế và có stack phỉnh.
                  </p>
                </div>
                <button
                  onClick={startGame}
                  disabled={players.length < 2}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors
                    ${players.length >= 2
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                >
                  <Play size={12} fill="currentColor" />
                  Bắt đầu
                </button>
              </div>
            </div>
          )}
          {/* Quick modify chips */}
          {selectedSeat !== null && (
            <div className="space-y-3 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                Điều chỉnh phỉnh - Ghế #{selectedSeat}
              </h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Nhập số lượng phỉnh..."
                  value={stackChangeVal}
                  onChange={(e) => setStackChangeVal(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none"
                />
                <button
                  onClick={() => handleStackModify("add")}
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                >
                  Nạp phỉnh
                </button>
                <button
                  onClick={() => handleStackModify("subtract")}
                  className="bg-rose-950 border border-rose-500/60 hover:bg-rose-950/80 text-rose-300 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                >
                  Trừ phỉnh
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
