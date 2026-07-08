import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import React, { useState } from "react";

interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    room_name: string;
    game_type: string;
    small_blind: number;
    big_blind: number;
    max_players: number;
    min_buyin: number;
    max_buyin: number;
  }) => void;
}

export const CreateTableModal: React.FC<CreateTableModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [newTableName, setNewTableName] = useState("");
  const [newGameType, setNewGameType] = useState("Texas Hold'em");
  const [newSmallBlind, setNewSmallBlind] = useState("1000");
  const [newBigBlind, setNewBigBlind] = useState("2000");
  const [newMaxPlayers, setNewMaxPlayers] = useState(9);
  const [newMinBuyin, setNewMinBuyin] = useState("40000");
  const [newMaxBuyin, setNewMaxBuyin] = useState("200000");
  const [isCustomSmallBlind, setIsCustomSmallBlind] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sbVal = parseInt(newSmallBlind);
    if (isNaN(sbVal) || sbVal <= 0) return;

    onSubmit({
      room_name: newTableName,
      game_type: newGameType,
      small_blind: sbVal,
      big_blind: sbVal * 2,
      max_players: newMaxPlayers,
      min_buyin: sbVal * 40,
      max_buyin: sbVal * 200,
    });

    // Reset fields
    setNewTableName("");
    setIsCustomSmallBlind(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-[#0F4438] border border-[#F4B942]/25 rounded-3xl overflow-hidden shadow-2xl relative"
          >
            <div className="flex items-center justify-between p-5 border-b border-[#F4B942]/15">
              <h3 className="font-black text-[#F7EFDD] text-lg flex items-center gap-2">
                <Plus size={20} className="text-[#F4B942]" />
                Tạo Bàn Chơi Mới
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-[#0B3D2E] text-[#F7EFDD]/50 hover:text-[#F7EFDD] transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#F7EFDD]/50 uppercase tracking-wider block">Tên bàn chơi</label>
                <input
                  type="text"
                  required
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="Ví dụ: Vegas Room, Beginner Stakes..."
                  className="w-full bg-[#0B3D2E] border border-[#F4B942]/15 rounded-xl py-2.5 px-4 text-sm text-[#F7EFDD] placeholder-[#F7EFDD]/30 focus:outline-none focus:border-[#F4B942]/60 focus:ring-1 focus:ring-[#F4B942]/60 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#F7EFDD]/50 uppercase tracking-wider block">Small Blind</label>
                  {isCustomSmallBlind ? (
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        required
                        min={1}
                        placeholder="Nhập..."
                        value={newSmallBlind}
                        onChange={(e) => {
                          const sb = e.target.value;
                          setNewSmallBlind(sb);
                          const val = parseInt(sb) || 0;
                          setNewBigBlind((val * 2).toString());
                          setNewMinBuyin((val * 40).toString());
                          setNewMaxBuyin((val * 200).toString());
                        }}
                        className="w-full bg-[#0B3D2E] border border-[#F4B942]/15 rounded-xl py-2.5 px-3 text-sm text-[#F7EFDD] focus:outline-none focus:border-[#F4B942]/60 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomSmallBlind(false);
                          setNewSmallBlind("1000");
                          setNewBigBlind("2000");
                          setNewMinBuyin("40000");
                          setNewMaxBuyin("200000");
                        }}
                        className="px-2.5 rounded-xl bg-[#0B3D2E] hover:bg-[#0B3D2E]/70 text-[#F7EFDD]/70 text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
                      >
                        Mẫu
                      </button>
                    </div>
                  ) : (
                    <select
                      value={newSmallBlind}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "custom") {
                          setIsCustomSmallBlind(true);
                          setNewSmallBlind("");
                          setNewBigBlind("0");
                          setNewMinBuyin("0");
                          setNewMaxBuyin("0");
                        } else {
                          setNewSmallBlind(val);
                          const sbVal = parseInt(val) || 0;
                          setNewBigBlind((sbVal * 2).toString());
                          setNewMinBuyin((sbVal * 40).toString());
                          setNewMaxBuyin((sbVal * 200).toString());
                        }
                      }}
                      className="w-full bg-[#0B3D2E] border border-[#F4B942]/15 rounded-xl py-2.5 px-3 text-sm text-[#F7EFDD] focus:outline-none focus:border-[#F4B942]/60 transition-colors cursor-pointer"
                    >
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="200">200</option>
                      <option value="400">400</option>
                      <option value="600">600</option>
                      <option value="800">800</option>
                      <option value="1000">1,000</option>
                      <option value="custom">Tự nhập (Custom)...</option>
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#F7EFDD]/50 uppercase tracking-wider block">Big Blind</label>
                  <input
                    type="text"
                    disabled
                    value={parseInt(newBigBlind || "0").toLocaleString()}
                    className="w-full bg-[#0B3D2E]/50 border border-[#F4B942]/10 rounded-xl py-2.5 px-4 text-sm text-[#F7EFDD]/40 focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-[#0B3D2E]/60 rounded-xl p-3 border border-[#F4B942]/10">
                <div>
                  <span className="text-[10px] text-[#F7EFDD]/40 block uppercase font-bold tracking-wider">Buy-In Tối Thiểu</span>
                  <span className="text-xs font-bold text-[#F7EFDD]">{parseInt(newMinBuyin || "0").toLocaleString()} Chips</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#F7EFDD]/40 block uppercase font-bold tracking-wider">Buy-In Tối Đa</span>
                  <span className="text-xs font-bold text-[#F7EFDD]">{parseInt(newMaxBuyin || "0").toLocaleString()} Chips</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#F7EFDD]/50 uppercase tracking-wider block">Số người tối đa</label>
                  <select
                    value={newMaxPlayers}
                    onChange={(e) => setNewMaxPlayers(parseInt(e.target.value))}
                    className="w-full bg-[#0B3D2E] border border-[#F4B942]/15 rounded-xl py-2.5 px-3 text-sm text-[#F7EFDD] focus:outline-none focus:border-[#F4B942]/60 transition-colors"
                  >
                    <option value={9}>9 Players (Full Table)</option>
                    <option value={6}>6 Players (Short Handed)</option>
                    <option value={2}>2 Players (Heads Up)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#F7EFDD]/50 uppercase tracking-wider block">Loại game</label>
                  <select
                    value={newGameType}
                    onChange={(e) => setNewGameType(e.target.value)}
                    className="w-full bg-[#0B3D2E] border border-[#F4B942]/15 rounded-xl py-2.5 px-3 text-sm text-[#F7EFDD] focus:outline-none focus:border-[#F4B942]/60 transition-colors"
                  >
                    <option value="Texas Hold'em">Texas Hold&apos;em</option>
                    <option value="Omaha">Omaha</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#0B3D2E] hover:bg-[#0B3D2E]/70 text-[#F7EFDD]/60 hover:text-[#F7EFDD] border border-[#F4B942]/15 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#F4B942] to-[#E0942A] hover:brightness-110 text-[#142019] font-black text-xs uppercase tracking-wider transition-colors shadow-lg active:scale-95"
                >
                  Tạo & Vào Bàn
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
