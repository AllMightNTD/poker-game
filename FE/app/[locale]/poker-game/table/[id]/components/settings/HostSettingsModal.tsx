"use client";

import React, { useState } from "react";
import { X, UserMinus, LogOut, Coins, Settings } from "lucide-react";
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
          {/* Change Blinds */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Thay đổi mức cược mù (Small Blind)
            </h4>
            <div className="flex gap-3">
              <input
                type="number"
                value={newSb}
                onChange={(e) => setNewSb(parseInt(e.target.value) || 0)}
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none"
              />
              <button
                onClick={handleUpdateBlinds}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
              >
                Cập nhật
              </button>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              Lưu ý: Mù lớn (Big Blind) sẽ tự động nhân đôi mức Small Blind đã nhập ({newSb * 2}).
            </p>
          </div>

          {/* Seat List Moderation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Quản lý người chơi trong phòng
            </h4>
            <div className="space-y-2 border border-slate-800/60 rounded-2xl p-2 bg-slate-950/40">
              {players.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-600">Không có người chơi nào khác</div>
              ) : (
                players.map((p) => {
                  if (p.isHero) return null; // Can't moderate self
                  return (
                    <div
                      key={`mod-${p.seatIndex}`}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 hover:bg-slate-950 border border-transparent hover:border-slate-800/40 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-lg" />
                        <div>
                          <p className="text-xs font-black text-slate-200 uppercase">{p.name}</p>
                          <p className="text-[10px] text-amber-500 font-bold">Ghế #{p.seatIndex + 1} • Stack: {parseInt(p.chips).toLocaleString()} chips</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleForceSitout(p.seatIndex)}
                          title="Bắt buộc đi vắng"
                          className="w-7 h-7 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-amber-500 flex items-center justify-center transition-colors"
                        >
                          <LogOut size={13} />
                        </button>
                        <button
                          onClick={() => handleKick(p.seatIndex)}
                          title="Kích khỏi phòng"
                          className="w-7 h-7 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors"
                        >
                          <UserMinus size={13} />
                        </button>
                        <button
                          onClick={() => setSelectedSeat(p.seatIndex)}
                          title="Cộng/Trừ chips"
                          className="w-7 h-7 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-emerald-500 flex items-center justify-center transition-colors"
                        >
                          <Coins size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick modify chips */}
          {selectedSeat !== null && (
            <div className="space-y-3 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                Điều chỉnh phỉnh - Ghế #{selectedSeat + 1}
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
