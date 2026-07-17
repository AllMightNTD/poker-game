import { AnimatePresence, motion } from "framer-motion";
import { Plus, Shield, X } from "lucide-react";
import React, { useState } from "react";
import { FormInput, FormSelect, FormCheckbox, FormButton } from "@/components/ui/form";

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
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-white/5 text-[#F7EFDD]/50 hover:text-[#F7EFDD] transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar">
              {/* Tên bàn */}
              <FormInput
                label="Tên bàn chơi"
                required
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                placeholder="Ví dụ: Vegas Room, Beginner Stakes..."
                size="small"
              />

              {/* Game Type & Max Players */}
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="Loại game"
                  value={newGameType}
                  onChange={(e) => setNewGameType(e.target.value)}
                  options={[
                    { value: "NLH", label: "Texas Hold'em" },
                    { value: "PLO", label: "Omaha" },
                  ]}
                  size="small"
                />

                <FormSelect
                  label="Số người tối đa"
                  value={newMaxPlayers.toString()}
                  onChange={(e) => setNewMaxPlayers(parseInt(e.target.value))}
                  options={[
                    { value: "9", label: "9 Players (Full Table)" },
                    { value: "6", label: "6 Players (Short Handed)" },
                    { value: "2", label: "2 Players (Heads Up)" },
                  ]}
                  size="small"
                />
              </div>

              {/* Blinds */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  {isCustomSmallBlind ? (
                    <div className="flex gap-1.5 items-start">
                      <FormInput
                        label="Small Blind"
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
                        size="small"
                      />
                      <FormButton
                        onClick={() => {
                          setIsCustomSmallBlind(false);
                          setNewSmallBlind("1000");
                          setNewBigBlind("2000");
                          setNewMinBuyin("40000");
                          setNewMaxBuyin("200000");
                        }}
                        variant="outlined"
                        color="primary"
                        size="medium"
                        sx={{ minWidth: 0, px: 2, height: 40, mt: 0.5 }}
                      >
                        Mẫu
                      </FormButton>
                    </div>
                  ) : (
                    <FormSelect
                      label="Small Blind"
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
                      options={[
                        { value: "50", label: "50" },
                        { value: "100", label: "100" },
                        { value: "200", label: "200" },
                        { value: "400", label: "400" },
                        { value: "600", label: "600" },
                        { value: "800", label: "800" },
                        { value: "1000", label: "1,000" },
                        { value: "2000", label: "2,000" },
                        { value: "5000", label: "5,000" },
                        { value: "custom", label: "Tự nhập (Custom)..." },
                      ]}
                      size="small"
                    />
                  )}
                </div>

                <FormInput
                  label="Big Blind"
                  disabled
                  value={parseInt(newBigBlind || "0").toLocaleString()}
                  size="small"
                />
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
                  <FormSelect
                    label="Trạng thái phòng"
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    options={[
                      { value: "PUBLIC", label: "Công khai (Public)" },
                      { value: "PRIVATE", label: "Riêng tư (Private)" },
                    ]}
                    size="small"
                  />

                  {visibility === "PRIVATE" && (
                    <FormInput
                      label="Mật khẩu bàn"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      size="small"
                    />
                  )}
                </div>

                {/* Turn Time & Time Bank */}
                <div className="grid grid-cols-2 gap-4">
                  <FormSelect
                    label="Thời gian lượt (Turn)"
                    value={turnTime.toString()}
                    onChange={(e) => setTurnTime(parseInt(e.target.value))}
                    options={[
                      { value: "10", label: "10 giây (Nhanh)" },
                      { value: "15", label: "15 giây (Tiêu chuẩn)" },
                      { value: "20", label: "20 giây" },
                      { value: "30", label: "30 giây (Thong thả)" },
                    ]}
                    size="small"
                  />

                  <FormSelect
                    label="Time Bank dự trữ"
                    value={timeBank.toString()}
                    onChange={(e) => setTimeBank(parseInt(e.target.value))}
                    options={[
                      { value: "10", label: "10 giây" },
                      { value: "30", label: "30 giây (Mặc định)" },
                      { value: "60", label: "60 giây (Nhiều)" },
                    ]}
                    size="small"
                  />
                </div>

                {/* Max spectators & toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <FormSelect
                    label="Người xem tối đa (Spectators)"
                    value={maxSpectators.toString()}
                    onChange={(e) => setMaxSpectators(parseInt(e.target.value))}
                    options={[
                      { value: "0", label: "Không giới hạn" },
                      { value: "5", label: "Tối đa 6 người" },
                      { value: "10", label: "Tối đa 9 người" },
                    ]}
                    size="small"
                  />

                  <div className="flex gap-4 pt-2">
                    <FormCheckbox
                      label="Cho phép Chat"
                      checked={allowChat}
                      onChange={(e) => setAllowChat(e.target.checked)}
                    />
                    <FormCheckbox
                      label="Cho phép Thả Emote"
                      checked={allowEmotes}
                      onChange={(e) => setAllowEmotes(e.target.checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/5">
                <FormButton
                  onClick={onClose}
                  variant="outlined"
                  color="primary"
                  fullWidth
                  size="large"
                >
                  Hủy Bỏ
                </FormButton>
                <FormButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                >
                  Tạo & Vào Bàn
                </FormButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
