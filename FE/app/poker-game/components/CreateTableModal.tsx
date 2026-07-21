import { FormButton } from "@/components/ui/form";
import { RHFCheckbox, RHFInput, RHFSelect } from "@/components/ui/form/RhfFields";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Shield, X } from "lucide-react";
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
      newMaxPlayers: "9",
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

  const sbVal = parseInt(newSmallBlind) || 0;
  const newBigBlind = (sbVal * 2).toString();
  const newMinBuyin = (sbVal * 40).toString();
  const newMaxBuyin = (sbVal * 200).toString();

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
                Create New Table
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-white/5 text-[#F7EFDD]/50 hover:text-[#F7EFDD] transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar">
              {/* Tên bàn */}
              <RHFInput
                control={control}
                name="newTableName"
                label="Table Name"
                required
                placeholder="Example: Vegas Room, Beginner Stakes..."
                size="small"
              />

              {/* Game Type & Max Players */}
              <div className="grid grid-cols-2 gap-4">
                <RHFSelect
                  control={control}
                  name="newGameType"
                  label="Game Type"
                  options={[
                    { value: "NLH", label: "Texas Hold'em" },
                    { value: "PLO", label: "Omaha" },
                  ]}
                  size="small"
                />

                <RHFSelect
                  control={control}
                  name="newMaxPlayers"
                  label="Max Players"
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
                      <RHFInput
                        control={control}
                        name="newSmallBlind"
                        label="Small Blind"
                        type="number"
                        required
                        min={1}
                        placeholder="Enter..."
                        size="small"
                      />
                      <FormButton
                        type="button"
                        onClick={() => {
                          setIsCustomSmallBlind(false);
                          setValue("newSmallBlind", "1000");
                        }}
                        variant="outlined"
                        color="primary"
                        size="medium"
                        sx={{ minWidth: 0, px: 2, height: 40, mt: 0.5 }}
                      >
                        Templates
                      </FormButton>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <RHFSelect
                        control={control}
                        name="newSmallBlind"
                        label="Small Blind"
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
                        ]}
                        size="small"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomSmallBlind(true);
                          setValue("newSmallBlind", "");
                        }}
                        className="text-xs text-[#F4B942] hover:underline text-left mt-1"
                      >
                        Custom...
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-xs font-semibold text-[#F7EFDD]/70">Big Blind</label>
                  <input
                    disabled
                    value={parseInt(newBigBlind || "0").toLocaleString()}
                    className="h-9 px-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white/50"
                  />
                </div>
              </div>

              {/* Buyins display */}
              <div className="grid grid-cols-2 gap-4 bg-[#08121a]/60 rounded-xl p-3 border border-white/5">
                <div>
                  <span className="text-[10px] text-[#F7EFDD]/40 block uppercase font-bold tracking-wider">Min Buy-In</span>
                  <span className="text-xs font-bold text-[#F4B942]">{parseInt(newMinBuyin || "0").toLocaleString()} Chips</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#F7EFDD]/40 block uppercase font-bold tracking-wider">Max Buy-In</span>
                  <span className="text-xs font-bold text-[#F4B942]">{parseInt(newMaxBuyin || "0").toLocaleString()} Chips</span>
                </div>
              </div>

              {/* Advanced config: Visibility (Public/Private) */}
              <div className="border-t border-white/5 pt-4 space-y-4">
                <h4 className="text-xs font-black text-[#F4B942] uppercase tracking-wider flex items-center gap-1.5">
                  <Shield size={14} /> Advanced Settings (Cash Game)
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <RHFSelect
                    control={control}
                    name="visibility"
                    label="Table Status"
                    options={[
                      { value: "PUBLIC", label: "Public" },
                      { value: "PRIVATE", label: "Private" },
                    ]}
                    size="small"
                  />

                  {visibility === "PRIVATE" && (
                    <RHFInput
                      control={control}
                      name="password"
                      label="Table Password"
                      type="password"
                      required
                      placeholder="Enter password..."
                      size="small"
                    />
                  )}
                </div>

                {/* Turn Time & Time Bank */}
                <div className="grid grid-cols-2 gap-4">
                  <RHFSelect
                    control={control}
                    name="turnTime"
                    label="Turn Time"
                    options={[
                      { value: "10", label: "10 seconds (Fast)" },
                      { value: "15", label: "15 seconds (Standard)" },
                      { value: "20", label: "20 seconds" },
                      { value: "30", label: "30 seconds (Relaxed)" },
                    ]}
                    size="small"
                  />

                  <RHFSelect
                    control={control}
                    name="timeBank"
                    label="Time Bank Reserve"
                    options={[
                      { value: "10", label: "10 seconds" },
                      { value: "30", label: "30 seconds (Default)" },
                      { value: "60", label: "60 seconds (Extended)" },
                    ]}
                    size="small"
                  />
                </div>

                {/* Max spectators & toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <RHFSelect
                    control={control}
                    name="maxSpectators"
                    label="Max Spectators"
                    options={[
                      { value: "0", label: "Unlimited" },
                      { value: "5", label: "Max 6 players" },
                      { value: "10", label: "Max 9 players" },
                    ]}
                    size="small"
                  />

                  <div className="flex gap-4 pt-2">
                    <RHFCheckbox
                      control={control}
                      name="allowChat"
                      label="Allow Chat"
                    />
                    <RHFCheckbox
                      control={control}
                      name="allowEmotes"
                      label="Allow Emotes"
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
                  Cancel
                </FormButton>
                <FormButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                >
                  Create & Join Table
                </FormButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
