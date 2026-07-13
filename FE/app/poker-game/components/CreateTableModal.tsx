import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Plus, Shield, Timer, Users, X } from "lucide-react";
import React, { useState } from "react";

interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    room_name: string;
    game_type: string;
    small_blind: number;
    max_players: number;
    min_buy_in: number;
    max_buy_in: number;
    turn_time_limit: number;
    time_bank: number;
    custom_settings: {
      table_visibility: string;
      password?: string;
      max_spectators: number;
      allow_chat: boolean;
      allow_emotes: boolean;
    };
  }) => void;
}

export const CreateTableModal: React.FC<CreateTableModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [newTableName, setNewTableName] = useState("");
  const [newGameType, setNewGameType] = useState("NLH");
  const [newSmallBlind, setNewSmallBlind] = useState("1000");
  const [newBigBlind, setNewBigBlind] = useState("2000");
  const [newMaxPlayers, setNewMaxPlayers] = useState(9);
  const [newMinBuyin, setNewMinBuyin] = useState("40000");
  const [newMaxBuyin, setNewMaxBuyin] = useState("200000");
  const [isCustomSmallBlind, setIsCustomSmallBlind] = useState(false);

  // Advanced settings
  const [visibility, setVisibility] = useState("PUBLIC");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [turnTime, setTurnTime] = useState(15);
  const [timeBank, setTimeBank] = useState(30);
  const [maxSpectators, setMaxSpectators] = useState(10);
  const [allowChat, setAllowChat] = useState(true);
  const [allowEmotes, setAllowEmotes] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sbVal = parseInt(newSmallBlind);
    if (isNaN(sbVal) || sbVal <= 0) return;

    onSubmit({
      room_name: newTableName,
      game_type: newGameType,
      small_blind: sbVal,
      max_players: newMaxPlayers,
      min_buy_in: sbVal * 40,
      max_buy_in: sbVal * 200,
      turn_time_limit: turnTime,
      time_bank: timeBank,
      custom_settings: {
        table_visibility: visibility,
        password: visibility === "PRIVATE" ? password : undefined,
        max_spectators: maxSpectators,
        allow_chat: allowChat,
        allow_emotes: allowEmotes,
      },
    });

    // Reset fields
    setNewTableName("");
    setPassword("");
    setVisibility("PUBLIC");
    setIsCustomSmallBlind(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-[#0b141d]/98 border border-[#F4B942]/20 rounded-3xl overflow-hidden shadow-2xl relative my-8"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h3 className="font-black text-[#F7EFDD] text-lg flex items-center gap-2">
                <Plus size={20} className="text-[#F4B942]" />
                Tạo Bàn Chơi Mới
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-white/5 text-[#F7EFDD]/50 hover:text-[#F7EFDD] transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar">
              {/* Tên bàn */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#F7EFDD]/50 uppercase tracking-wider block">Tên bàn chơi</label>
                <input
                  type="text"
                  required
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="Ví dụ: Vegas Room, Beginner Stakes..."
                  className="w-full bg-[#08121a] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-[#F7EFDD] placeholder-[#F7EFDD]/30 focus:outline-none focus:border-[#F4B942]/60 focus:ring-1 focus:ring-[#F4B942]/60 transition-colors"
                />
              </div>

              {/* Game Type & Max Players */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#F7EFDD]/50 uppercase tracking-wider block">Loại game</label>
                  <div className="relative">
                    <select
                      value={newGameType}
                      onChange={(e) => setNewGameType(e.target.value)}
                      className="w-full bg-[#08121a] border border-white/10 rounded-xl py-2.5 pl-3 pr-8 text-sm text-[#F7EFDD] focus:outline-none focus:border-[#F4B942]/60 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="NLH">Texas Hold&apos;em</option>
                      <option value="PLO">Omaha</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#F7EFDD]/40 text-[10px]">▼</div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#F7EFDD]/50 uppercase tracking-wider block">Số người tối đa</label>
                  <div className="relative">
                    <select
                      value={newMaxPlayers}
                      onChange={(e) => setNewMaxPlayers(parseInt(e.target.value))}
                      className="w-full bg-[#08121a] border border-white/10 rounded-xl py-2.5 pl-3 pr-8 text-sm text-[#F7EFDD] focus:outline-none focus:border-[#F4B942]/60 transition-colors appearance-none cursor-pointer"
                    >
                      <option value={9}>9 Players (Full Table)</option>
                      <option value={6}>6 Players (Short Handed)</option>
                      <option value={2}>2 Players (Heads Up)</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#F7EFDD]/40 text-[10px]">▼</div>
                  </div>
                </div>
              </div>

              {/* Blinds */}
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
                        className="w-full bg-[#08121a] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-[#F7EFDD] focus:outline-none focus:border-[#F4B942]/60 transition-colors"
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
                        className="px-2.5 rounded-xl bg-[#08121a] hover:bg-[#0c1b26] text-[#F7EFDD]/70 text-xs font-bold border border-white/5 transition-all whitespace-nowrap cursor-pointer"
                      >
                        Mẫu
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
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
                        className="w-full bg-[#08121a] border border-white/10 rounded-xl py-2.5 pl-3 pr-8 text-sm text-[#F7EFDD] focus:outline-none focus:border-[#F4B942]/60 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="200">200</option>
                        <option value="400">400</option>
                        <option value="600">600</option>
                        <option value="800">800</option>
                        <option value="1000">1,000</option>
                        <option value="2000">2,000</option>
                        <option value="5000">5,000</option>
                        <option value="custom">Tự nhập (Custom)...</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#F7EFDD]/40 text-[10px]">▼</div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#F7EFDD]/50 uppercase tracking-wider block">Big Blind</label>
                  <input
                    type="text"
                    disabled
                    value={parseInt(newBigBlind || "0").toLocaleString()}
                    className="w-full bg-[#08121a]/50 border border-white/5 rounded-xl py-2.5 px-4 text-sm text-[#F7EFDD]/40 focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Buyins display */}
              <div className="grid grid-cols-2 gap-4 bg-[#08121a]/60 rounded-xl p-3 border border-white/5">
                <div>
                  <span className="text-[10px] text-[#F7EFDD]/40 block uppercase font-bold tracking-wider">Buy-In Tối Thiểu</span>
                  <span className="text-xs font-bold text-[#F4B942]">{parseInt(newMinBuyin || "0").toLocaleString()} Chips</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#F7EFDD]/40 block uppercase font-bold tracking-wider">Buy-In Tối Đa</span>
                  <span className="text-xs font-bold text-[#F4B942]">{parseInt(newMaxBuyin || "0").toLocaleString()} Chips</span>
                </div>
              </div>

              {/* Advanced config: Visibility (Public/Private) */}
              <div className="border-t border-white/5 pt-4 space-y-4">
                <h4 className="text-xs font-black text-[#F4B942] uppercase tracking-wider flex items-center gap-1.5">
                  <Shield size={14} /> Cấu hình nâng cao (Bàn CG)
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#F7EFDD]/50 uppercase tracking-wider block">Trạng thái phòng</label>
                    <div className="relative">
                      <select
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value)}
                        className="w-full bg-[#08121a] border border-white/10 rounded-xl py-2.5 pl-3 pr-8 text-sm text-[#F7EFDD] focus:outline-none focus:border-[#F4B942]/60 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="PUBLIC">Công khai (Public)</option>
                        <option value="PRIVATE">Riêng tư (Private)</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#F7EFDD]/40 text-[10px]">▼</div>
                    </div>
                  </div>

                  {visibility === "PRIVATE" && (
                    <div className="space-y-1.5 relative">
                      <label className="text-xs font-bold text-[#F7EFDD]/50 uppercase tracking-wider block">Mật khẩu bàn</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Nhập mật khẩu..."
                          className="w-full bg-[#08121a] border border-white/10 rounded-xl py-2.5 pl-3 pr-10 text-sm text-[#F7EFDD] placeholder-[#F7EFDD]/30 focus:outline-none focus:border-[#F4B942]/60"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F7EFDD]/50 hover:text-white"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Turn Time & Time Bank */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#F7EFDD]/50 uppercase tracking-wider block flex items-center gap-1">
                      <Timer size={12} /> Thời gian lượt (Turn)
                    </label>
                    <div className="relative">
                      <select
                        value={turnTime}
                        onChange={(e) => setTurnTime(parseInt(e.target.value))}
                        className="w-full bg-[#08121a] border border-white/10 rounded-xl py-2.5 pl-3 pr-8 text-sm text-[#F7EFDD] focus:outline-none focus:border-[#F4B942]/60 appearance-none cursor-pointer"
                      >
                        <option value={10}>10 giây (Nhanh)</option>
                        <option value={15}>15 giây (Tiêu chuẩn)</option>
                        <option value={20}>20 giây</option>
                        <option value={30}>30 giây (Thong thả)</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#F7EFDD]/40 text-[10px]">▼</div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#F7EFDD]/50 uppercase tracking-wider block">Time Bank dự trữ</label>
                    <div className="relative">
                      <select
                        value={timeBank}
                        onChange={(e) => setTimeBank(parseInt(e.target.value))}
                        className="w-full bg-[#08121a] border border-white/10 rounded-xl py-2.5 pl-3 pr-8 text-sm text-[#F7EFDD] focus:outline-none focus:border-[#F4B942]/60 appearance-none cursor-pointer"
                      >
                        <option value={10}>10 giây</option>
                        <option value={30}>30 giây (Mặc định)</option>
                        <option value={60}>60 giây (Nhiều)</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#F7EFDD]/40 text-[10px]">▼</div>
                    </div>
                  </div>
                </div>

                {/* Max spectators & toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#F7EFDD]/50 uppercase tracking-wider block flex items-center gap-1">
                      <Users size={12} /> Người xem tối đa (Spectators)
                    </label>
                    <div className="relative">
                      <select
                        value={maxSpectators}
                        onChange={(e) => setMaxSpectators(parseInt(e.target.value))}
                        className="w-full bg-[#08121a] border border-white/10 rounded-xl py-2.5 pl-3 pr-8 text-sm text-[#F7EFDD] focus:outline-none focus:border-[#F4B942]/60 appearance-none cursor-pointer"
                      >
                        <option value={0}>Không giới hạn</option>
                        <option value={5}>Tối đa 6 người</option>
                        <option value={10}>Tối đa 9 người</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#F7EFDD]/40 text-[10px]">▼</div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 md:pt-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#F7EFDD]/80 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={allowChat}
                        onChange={(e) => setAllowChat(e.target.checked)}
                        className="w-4 h-4 rounded border-white/10 bg-[#08121a] text-[#F4B942] focus:ring-0 focus:ring-offset-0 accent-[#F4B942]"
                      />
                      Cho phép Chat
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-[#F7EFDD]/80 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={allowEmotes}
                        onChange={(e) => setAllowEmotes(e.target.checked)}
                        className="w-4 h-4 rounded border-white/10 bg-[#08121a] text-[#F4B942] focus:ring-0 focus:ring-offset-0 accent-[#F4B942]"
                      />
                      Cho phép Thả Emote
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#08121a] hover:bg-[#0c1b26] text-[#F7EFDD]/60 hover:text-white border border-white/10 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#F4B942] to-[#E0942A] hover:brightness-110 text-[#142019] font-black text-xs uppercase tracking-wider transition-colors shadow-lg active:scale-95 cursor-pointer"
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
