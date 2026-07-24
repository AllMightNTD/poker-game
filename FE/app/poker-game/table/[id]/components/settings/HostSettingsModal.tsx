"use client";

import { Coins, MinusCircle, Play, PlusCircle, Settings, ShieldAlert, Shuffle, Users, X } from "lucide-react";
import React, { useEffect, useState } from "react";
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
    roomStatus,
    togglePause,
    maxBuyin,
    shuffleSeats,
  } = usePokerGame();

  const [activeTab, setActiveTab] = useState<"general" | "players" | "game_settings">("general");
  const [newSb, setNewSb] = useState(50);

  // Dialog state for stack adjustments
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [dialogType, setDialogType] = useState<"add" | "remove" | null>(null);
  const [amountVal, setAmountVal] = useState("");
  const [reasonVal, setReasonVal] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (smallBlind) {
      Promise.resolve().then(() => {
        setNewSb(parseInt(smallBlind.toString()) || 50);
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
    if (confirm("Bạn có chắc chắn muốn kick người chơi này khỏi bàn?")) {
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

  const openAdjustmentDialog = (seat: number, type: "add" | "remove") => {
    setSelectedSeat(seat);
    setDialogType(type);
    setAmountVal("");
    setReasonVal("");
    setErrorMsg("");
  };

  const handleConfirmAdjustment = async () => {
    if (selectedSeat === null || !dialogType) return;

    const amount = parseInt(amountVal);
    if (isNaN(amount) || amount <= 0 || !Number.isInteger(amount)) {
      setErrorMsg("Vui lòng nhập số tiền phỉnh hợp lệ (số nguyên dương)!");
      return;
    }

    const targetPlayer = players.find((p) => p.seatIndex === selectedSeat);
    if (!targetPlayer) return;

    const currentStack = parseInt(targetPlayer.chips || "0");
    const pendingAdd = targetPlayer.pending_add_amount || 0;
    const pendingRemove = targetPlayer.pending_remove_amount || 0;
    const netPending = pendingAdd - pendingRemove;

    if (dialogType === "add") {
      const maxBuyinNum = parseInt(maxBuyin?.toString() || "0");
      const potentialStack = currentStack + netPending + amount;
      if (maxBuyinNum > 0 && potentialStack > maxBuyinNum) {
        setErrorMsg(`Tổng stack sau khi cộng (${potentialStack.toLocaleString()}) vượt quá giới hạn Buy-in tối đa của bàn (${maxBuyinNum.toLocaleString()})!`);
        return;
      }
    } else {
      const potentialStack = currentStack + netPending - amount;
      if (potentialStack < 0) {
        setErrorMsg("Không thể rút nhiều hơn số phỉnh khả dụng của người chơi!");
        return;
      }
    }

    try {
      await modifyPlayerStack(selectedSeat, amount, dialogType === "add" ? "add" : "subtract");
      setSelectedSeat(null);
      setDialogType(null);
      setAmountVal("");
      setReasonVal("");
      setErrorMsg("");
    } catch (e) {
      console.error(e);
      setErrorMsg("Đã xảy ra lỗi trong quá trình điều chỉnh stack.");
    }
  };

  const renderGeneralTab = () => {
    const isWaitingOrEnded = gameStage === "waiting" || gameStage === "ended";
    return (
      <div className="space-y-5">
        {/* Start Game Action */}
        {isWaitingOrEnded && (
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wide">Bắt đầu ván mới</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Yêu cầu tối thiểu 2 người chơi đã ngồi vào ghế và có phỉnh.
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
                Start
              </button>
            </div>
          </div>
        )}

        {/* Blinds configuration */}
        <div className="space-y-3 p-4 bg-slate-950/40 rounded-2xl border border-slate-800/60">
          <div className="flex items-center gap-2 text-slate-200">
            <Coins size={14} className="text-[#F4B942]" />
            <h4 className="text-xs font-black uppercase tracking-wider">Cấu hình Blinds</h4>
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
      </div>
    );
  };

  const renderPlayersTab = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-[#F4B942]" />
            <h4 className="text-xs font-black uppercase tracking-wider">Người chơi đang ngồi ({players.length})</h4>
          </div>
          <button
            onClick={async () => { await shuffleSeats(); }}
            disabled={players.length < 2}
            title={players.length < 2 ? "Cần tối thiểu 2 người chơi để tráo ghế" : "Tráo ghế ngẫu nhiên"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all
              ${
                players.length >= 2
                  ? "bg-[#F4B942]/10 border-[#F4B942]/40 text-[#F4B942] hover:bg-[#F4B942]/20 cursor-pointer"
                  : "bg-slate-900/30 border-slate-800/30 text-slate-600 cursor-not-allowed"
              }`}
          >
            <Shuffle size={10} />
            Shuffle
          </button>
        </div>

        {players.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 bg-slate-950/20 border border-slate-800/40 rounded-2xl">
            Chưa có người chơi nào ngồi vào bàn
          </div>
        ) : (
          <div className="space-y-2.5">
            {players.map((p) => {
              const pendingAdd = p.pending_add_amount || 0;
              const pendingRemove = p.pending_remove_amount || 0;
              const netPending = pendingAdd - pendingRemove;

              // Resolve user status
              const isDisconnected = p.lastAction === "Disconnected" || p.chips === "disconnected";
              const playerStatus = isDisconnected
                ? "Disconnected"
                : p.isSittingOut
                  ? "Away"
                  : "Playing";

              return (
                <div
                  key={p.seatIndex}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/40 hover:border-slate-800/80 transition-all gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className={`w-9 h-9 rounded-xl bg-slate-800 border object-cover
                          ${isDisconnected
                            ? "border-rose-500/50 grayscale"
                            : p.isSittingOut
                              ? "border-amber-500/50 grayscale"
                              : "border-slate-700/60"
                          }`}
                      />
                      <span className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border border-slate-950
                        ${playerStatus === "Playing"
                          ? "bg-emerald-500"
                          : playerStatus === "Away"
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-200 truncate uppercase flex items-center gap-1.5">
                        <span>{p.name}</span>
                        <span className="text-[9px] font-normal text-slate-500 lowercase">
                          (Ghế #{p.seatIndex})
                        </span>
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400">Stack:</span>
                        <span className="text-[10px] text-[#F4B942] font-black">
                          💰 {formatChipsVal(p.chips)}
                        </span>
                        {netPending !== 0 && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400`}>
                            Pending: {netPending > 0 ? "+" : ""}{formatChipsVal(netPending.toString())}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      onClick={() => openAdjustmentDialog(p.seatIndex, "add")}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-[9px] font-black text-slate-300 hover:text-emerald-400 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <PlusCircle size={10} />
                      Add Stack
                    </button>
                    <button
                      onClick={() => openAdjustmentDialog(p.seatIndex, "remove")}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 text-[9px] font-black text-slate-300 hover:text-rose-400 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <MinusCircle size={10} />
                      Remove Stack
                    </button>
                    <button
                      onClick={() => handleForceSitout(p.seatIndex)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900/40 border border-slate-800/40 hover:border-amber-500/30 text-[9px] font-black text-amber-500/80 hover:text-amber-400 transition-all cursor-pointer"
                    >
                      Away
                    </button>
                    <button
                      onClick={() => handleKick(p.seatIndex)}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-950/20 border border-rose-950/40 hover:bg-rose-950/40 text-[9px] font-black text-rose-400 transition-all cursor-pointer"
                    >
                      Kick
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderGameSettingsTab = () => {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl flex flex-col gap-3">
          <div className="flex justify-between items-center gap-4">
            <div>
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-wide">Tạm dừng phòng đấu</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Tạm thời đóng băng tất cả các lượt cược và hành động tại bàn.
              </p>
            </div>
            <button
              onClick={() => togglePause(roomStatus !== 'paused')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shrink-0
                ${roomStatus === 'paused'
                  ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                  : "bg-rose-950/40 border border-rose-900/60 text-rose-300 hover:bg-rose-900/30"
                }`}
            >
              {roomStatus === 'paused' ? "Mở lại phòng" : "Tạm dừng"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const targetPlayerObj = selectedSeat !== null ? players.find((p) => p.seatIndex === selectedSeat) : null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="text-[#F4B942] w-5 h-5 animate-spin-slow" />
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
                Room Settings
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tab Selection */}
          <div className="flex border-b border-slate-800/60 bg-slate-950/15">
            {["general", "players", "game_settings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer
                  ${activeTab === tab
                    ? "border-[#F4B942] text-[#F4B942] bg-slate-900/40"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/10"
                  }`}
              >
                {tab === "general" ? "General" : tab === "players" ? "Players" : "Game Settings"}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh] min-h-[30vh]">
            {activeTab === "general" && renderGeneralTab()}
            {activeTab === "players" && renderPlayersTab()}
            {activeTab === "game_settings" && renderGameSettingsTab()}
          </div>
        </div>
      </div>

      {/* Adjust Stack Modal (Nested Dialog) */}
      {selectedSeat !== null && dialogType !== null && targetPlayerObj && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-1.5 text-slate-200">
                <ShieldAlert size={16} className="text-[#F4B942]" />
                <h4 className="text-xs font-black uppercase tracking-wider">
                  {dialogType === "add" ? "Cộng Chips (Add Stack)" : "Rút Chips (Remove Stack)"}
                </h4>
              </div>
              <button
                onClick={() => { setSelectedSeat(null); setDialogType(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/30 text-slate-400">
                <span>Người chơi:</span>
                <span className="font-bold text-slate-200">{targetPlayerObj.name} (Ghế #{selectedSeat})</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/30 text-slate-400">
                <span>Stack hiện tại:</span>
                <span className="font-black text-[#F4B942]">💰 {formatChipsVal(targetPlayerObj.chips)}</span>
              </div>

              {/* Amount input */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold block">Số lượng phỉnh</label>
                <input
                  type="number"
                  placeholder="Ví dụ: 1000..."
                  value={amountVal}
                  onChange={(e) => setAmountVal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-[#F4B942] rounded-xl px-3.5 py-2 text-slate-200 text-xs focus:outline-none"
                />
              </div>

              {/* Reason input */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold block">Lý do điều chỉnh (Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Khuyến mãi, Phạt..."
                  value={reasonVal}
                  onChange={(e) => setReasonVal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-[#F4B942] rounded-xl px-3.5 py-2 text-slate-200 text-xs focus:outline-none"
                />
              </div>

              {errorMsg && (
                <div className="text-[10px] text-rose-500 font-medium bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
                  ⚠️ {errorMsg}
                </div>
              )}

              {gameStage !== "waiting" && gameStage !== "ended" && (
                <div className="text-[9px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
                  💡 Ván bài đang diễn ra. Thay đổi phỉnh sẽ được xếp lịch (Pending) và tự động kích hoạt ở ván tiếp theo.
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => { setSelectedSeat(null); setDialogType(null); }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmAdjustment}
                className={`flex-1 text-slate-950 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer
                  ${dialogType === "add"
                    ? "bg-emerald-500 hover:bg-emerald-400"
                    : "bg-[#F4B942] hover:bg-[#E0942A]"
                  }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
