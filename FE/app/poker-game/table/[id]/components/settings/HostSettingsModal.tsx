"use client";

import React, { useState, useEffect } from "react";
import { Play, Settings, X, Users, ShieldAlert, Coins } from "lucide-react";
import { usePokerGame } from "../hooks/usePokerGame";

interface HostSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HostSettingsModal: React.FC<HostSettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    players,
    smallBlind,
    modifyBlinds,
    kickPlayer,
    forceSitOut,
    modifyPlayerStack,
    startGame,
    gameStage,
    formatChipsVal,
  } = usePokerGame();

  const [newSb, setNewSb] = useState(50);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [stackChangeVal, setStackChangeVal] = useState("");

  useEffect(() => {
    if (smallBlind) {
      Promise.resolve().then(() => {
        setNewSb(parseInt(smallBlind) || 50);
      });
    }
  }, [smallBlind]);

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
            <Settings className="text-[#F4B942] w-5 h-5 animate-spin-slow" />
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
              Quản Trị Bàn Đấu (Chủ Phòng)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 max-h-[75vh]">
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

          {/* Blinds configuration */}
          <div className="space-y-3 p-4 bg-slate-950/40 rounded-2xl border border-slate-800/60">
            <div className="flex items-center gap-2 text-slate-200">
              <Coins size={14} className="text-[#F4B942]" />
              <h4 className="text-xs font-black uppercase tracking-wider">Cấu hình mức mù (Blinds)</h4>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Small Blind mới</label>
                <input
                  type="number"
                  value={newSb}
                  onChange={(e) => setNewSb(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-[#F4B942] rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Big Blind tự động</label>
                <div className="w-full bg-slate-900/60 border border-slate-800/40 rounded-xl px-3 py-2 text-slate-500 text-xs select-none">
                  {newSb * 2}
                </div>
              </div>
              <button
                onClick={handleUpdateBlinds}
                className="bg-[#F4B942] hover:bg-[#E0942A] text-[#142019] px-4 py-2 h-9 self-end rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cập nhật
              </button>
            </div>
          </div>

          {/* Seated Players List */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-200">
              <Users size={14} className="text-[#F4B942]" />
              <h4 className="text-xs font-black uppercase tracking-wider">Người chơi tại bàn ({players.length})</h4>
            </div>
            {players.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">Chưa có người chơi nào ngồi vào ghế</div>
            ) : (
              <div className="space-y-2.5">
                {players.map((p) => (
                  <div
                    key={p.seatIndex}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/40 hover:border-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-200 truncate uppercase">
                          {p.name} <span className="text-[10px] font-normal text-slate-500 lowercase">(Ghế #{p.seatIndex})</span>
                        </p>
                        <p className="text-[10px] text-amber-500 font-bold mt-0.5">💰 {formatChipsVal(p.chips)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedSeat(p.seatIndex)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-[10px] font-black text-slate-300 transition-all cursor-pointer"
                      >
                        Sửa phỉnh
                      </button>
                      <button
                        onClick={() => handleForceSitout(p.seatIndex)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-500/50 text-[10px] font-black text-rose-400 transition-all cursor-pointer"
                      >
                        Đi vắng
                      </button>
                      <button
                        onClick={() => handleKick(p.seatIndex)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-950/30 border border-rose-950/60 hover:bg-rose-950/50 text-[10px] font-black text-rose-400 transition-all cursor-pointer"
                      >
                        Đuổi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick modify chips */}
          {selectedSeat !== null && (
            <div className="space-y-3 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-200">
                <ShieldAlert size={14} className="text-[#F4B942]" />
                <h4 className="text-xs font-black uppercase tracking-wider">
                  Điều chỉnh phỉnh - Ghế #{selectedSeat}
                </h4>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Nhập số lượng phỉnh..."
                  value={stackChangeVal}
                  onChange={(e) => setStackChangeVal(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-[#F4B942] rounded-xl px-4 py-2 text-slate-200 text-xs focus:outline-none"
                />
                <button
                  onClick={() => handleStackModify("add")}
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Nạp phỉnh
                </button>
                <button
                  onClick={() => handleStackModify("subtract")}
                  className="bg-rose-950 border border-rose-500/60 hover:bg-rose-950/80 text-rose-300 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
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
