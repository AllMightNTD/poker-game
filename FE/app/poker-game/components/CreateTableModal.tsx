import { FormButton } from "@/components/ui/form";
import { RHFCheckbox, RHFInput, RHFSelect } from "@/components/ui/form/RhfFields";
import { AnimatePresence, motion } from "framer-motion";
import {
  Coins,
  Crown,
  MessageSquare,
  ShieldCheck,
  Smile,
  Sparkles,
  Users,
  X
} from "lucide-react";
import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

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

const PRESET_BLINDS = ["50", "100", "200", "500"];

export const CreateTableModal: React.FC<CreateTableModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { control, handleSubmit, setValue, reset } = useForm({
    defaultValues: {
      newTableName: "",
      newGameType: "NLH",
      newSmallBlind: "1000",
      newMaxPlayers: "6",
      visibility: "PUBLIC",
      password: "",
      turnTime: "15",
      timeBank: "30",
      maxSpectators: "10",
      allowChat: true,
      allowEmotes: true,
    }
  });

  const [isCustomSmallBlind, setIsCustomSmallBlind] = useState(false);

  const newSmallBlind = useWatch({ control, name: "newSmallBlind" });
  const visibility = useWatch({ control, name: "visibility" });
  const maxPlayers = useWatch({ control, name: "newMaxPlayers" });

  const sbVal = parseInt(newSmallBlind) || 0;
  const newBigBlind = sbVal * 2;
  const newMinBuyin = sbVal * 40;
  const newMaxBuyin = sbVal * 200;

  const onSubmitForm = (data: any) => {
    const sb = parseInt(data.newSmallBlind);
    if (isNaN(sb) || sb <= 0) return;

    onSubmit({
      room_name: data.newTableName,
      game_type: data.newGameType,
      small_blind: sb,
      max_players: parseInt(data.newMaxPlayers),
      min_buy_in: sb * 40,
      max_buy_in: sb * 200,
      turn_time_limit: parseInt(data.turnTime),
      time_bank: parseInt(data.timeBank),
      custom_settings: {
        table_visibility: data.visibility,
        password: data.visibility === "PRIVATE" ? data.password : undefined,
        max_spectators: parseInt(data.maxSpectators),
        allow_chat: data.allowChat,
        allow_emotes: data.allowEmotes,
      },
    });

    reset();
    setIsCustomSmallBlind(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="w-full max-w-2xl bg-gradient-to-b from-[#131c27] via-[#0d141e] to-[#070b10] border border-[#d4af37]/30 rounded-2xl md:rounded-3xl shadow-[0_0_50px_rgba(212,175,55,0.15)] overflow-hidden relative my-auto flex flex-col max-h-[90vh]"
          >
            {/* Top Accent Line */}
            <div className="h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent w-full" />

            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-white/[0.03]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#f3e5ab]/5 border border-[#d4af37]/40 text-[#d4af37]">
                  <Crown size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base sm:text-xl uppercase tracking-wider flex items-center gap-2">
                    Create High Stakes Table
                  </h3>
                  <p className="text-xs text-white/50 hidden sm:block">Set your blinds, customize stakes & rules</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all duration-200 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit(onSubmitForm)} className="p-4 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">

              {/* SECTION 1: General Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-widest border-b border-white/10 pb-2">
                  <Sparkles size={14} /> Basic Information
                </div>

                <RHFInput
                  control={control}
                  name="newTableName"
                  label="Table Name"
                  required
                  placeholder="e.g. VIP High Rollers, Beginner's Haven..."
                  size="small"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 gap-4">
                  <RHFSelect
                    control={control}
                    name="newGameType"
                    label="Game Mode"
                    options={[
                      { value: "NLH", label: "♠️ No-Limit Texas Hold'em" },
                      { value: "PLO", label: "♣️ Pot-Limit Omaha" },
                    ]}
                    size="small"
                  />

                  {/* Custom Max Players Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                      <Users size={12} className="text-[#d4af37]" /> Max Players
                    </label>
                    <div className="grid grid-cols-5 gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/10">
                      {["2", "6", "8", "9", "10"].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setValue("newMaxPlayers", num)}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all ${maxPlayers === num
                            ? "bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black shadow-lg shadow-[#d4af37]/20"
                            : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                          {num} {num === "2" ? "HU" : "P"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Stakes & Limits (Interactive Chip Selector) */}
              <div className="space-y-4 bg-gradient-to-b from-white/[0.03] to-transparent p-4 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-widest">
                    <Coins size={14} /> Stakes & Buy-In
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomSmallBlind(!isCustomSmallBlind);
                      if (!isCustomSmallBlind) setValue("newSmallBlind", "");
                    }}
                    className="text-xs text-[#00F0FF] hover:underline font-medium"
                  >
                    {isCustomSmallBlind ? "Choose Presets" : "Custom SB..."}
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                    Small Blind (SB)
                  </label>

                  {isCustomSmallBlind ? (
                    <RHFInput
                      control={control}
                      name="newSmallBlind"
                      type="number"
                      required
                      min={1}
                      placeholder="Enter custom SB amount..."
                      size="small"
                    />
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {PRESET_BLINDS.map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setValue("newSmallBlind", val)}
                          className={`py-2 px-1 rounded-xl font-bold text-xs border transition-all flex flex-col items-center justify-center gap-0.5 ${newSmallBlind === val
                            ? "bg-gradient-to-b from-[#d4af37]/30 to-[#d4af37]/10 border-[#d4af37] text-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                            : "bg-black/30 border-white/10 text-white/70 hover:border-white/30 hover:text-white"
                            }`}
                        >
                          <span className="text-[9px] opacity-60">SB</span>
                          <span>{parseInt(val).toLocaleString()}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dynamic Calculated Table Card */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-black/60 rounded-xl p-3 border border-white/10 text-center">
                  <div className="border-r border-white/10 pr-1">
                    <span className="text-[9px] sm:text-[10px] text-white/50 uppercase font-bold block">Big Blind</span>
                    <span className="text-xs sm:text-sm font-extrabold text-white">
                      {newBigBlind.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-r border-white/10 px-1">
                    <span className="text-[9px] sm:text-[10px] text-white/50 uppercase font-bold block">Min Buy-In</span>
                    <span className="text-xs sm:text-sm font-extrabold text-[#00F0FF]">
                      {newMinBuyin.toLocaleString()}
                    </span>
                  </div>
                  <div className="pl-1">
                    <span className="text-[9px] sm:text-[10px] text-white/50 uppercase font-bold block">Max Buy-In</span>
                    <span className="text-xs sm:text-sm font-extrabold text-[#d4af37]">
                      {newMaxBuyin.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Gameplay & Privacy Rules */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-widest border-b border-white/10 pb-2">
                  <ShieldCheck size={14} /> Table Rules & Security
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <RHFSelect
                    control={control}
                    name="visibility"
                    label="Access Control"
                    options={[
                      { value: "PUBLIC", label: "🌐 Public (Anyone can join)" },
                      { value: "PRIVATE", label: "🔒 Private (Password protected)" },
                    ]}
                    size="small"
                  />

                  {visibility === "PRIVATE" && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <RHFInput
                        control={control}
                        name="password"
                        label="Password"
                        type="password"
                        required
                        placeholder="Set table key..."
                        size="small"
                      />
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <RHFSelect
                    control={control}
                    name="turnTime"
                    label="Turn Time"
                    options={[
                      { value: "10", label: "⚡ 10s (Turbo)" },
                      { value: "15", label: "⏱️ 15s (Normal)" },
                      { value: "20", label: "⏳ 20s (Slow)" },
                      { value: "30", label: "🐢 30s (Deep)" },
                    ]}
                    size="small"
                  />

                  <RHFSelect
                    control={control}
                    name="timeBank"
                    label="Time Bank"
                    options={[
                      { value: "10", label: "10 seconds" },
                      { value: "30", label: "30 seconds" },
                      { value: "60", label: "60 seconds" },
                    ]}
                    size="small"
                  />

                  <RHFSelect
                    control={control}
                    name="maxSpectators"
                    label="Spectators"
                    options={[
                      { value: "0", label: "Unlimited" },
                      { value: "5", label: "Max 5" },
                      { value: "10", label: "Max 10" },
                    ]}
                    size="small"
                  />
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-6 pt-2 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-white/60" />
                    <RHFCheckbox control={control} name="allowChat" label="Allow Chat" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Smile size={16} className="text-white/60" />
                    <RHFCheckbox control={control} name="allowEmotes" label="Allow Interactive Emotes" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/10 sticky bottom-0 bg-[#070b10]/90 backdrop-blur-md">
                <FormButton
                  onClick={onClose}
                  variant="outlined"
                  color="primary"
                  fullWidth
                  size="large"
                  className="!rounded-xl !border-white/20 !text-white/70 hover:!bg-white/10"
                >
                  Cancel
                </FormButton>
                <FormButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  className="!rounded-xl !bg-gradient-to-r !from-[#d4af37] !to-[#aa7c11] !text-black !font-black !shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:!brightness-110"
                >
                  🚀 Launch Table
                </FormButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};