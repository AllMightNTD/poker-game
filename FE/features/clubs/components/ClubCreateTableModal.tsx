"use client";

import { useState } from "react";
import { useCreateClubTable } from "@/features/clubs/hooks/useClubs";
import { X, Loader2 } from "lucide-react";

export default function ClubCreateTableModal({ 
  clubId, 
  onClose, 
  onSuccess 
}: { 
  clubId: string, 
  onClose: () => void, 
  onSuccess: () => void 
}) {
  const [name, setName] = useState("");
  const [sb, setSb] = useState("500");
  const [maxPlayers, setMaxPlayers] = useState("9");
  const { mutateAsync: createClubTable, isPending: isLoading } = useCreateClubTable();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setError("");
    
    try {
      const smallBlind = parseInt(sb);
      await createClubTable({
        room_name: name,
        small_blind: smallBlind,
        max_players: parseInt(maxPlayers),
        club_id: clubId,
        custom_settings: {
          table_visibility: 'PRIVATE'
        }
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create table");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-slate-800 shadow-2xl overflow-hidden relative">
        <div className="flex justify-between items-center p-5 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Create Club Table</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Table Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. NLH High Stakes"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Small Blind</label>
              <input
                type="number"
                required
                min="10"
                step="10"
                value={sb}
                onChange={(e) => setSb(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition"
              />
              <p className="text-xs text-slate-500 mt-1">Big Blind = {parseInt(sb || '0') * 2}</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Max Players</label>
              <select
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition appearance-none"
              >
                <option value="2">2 (Heads Up)</option>
                <option value="6">6 (6-Max)</option>
                <option value="9">9 (Full Ring)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition disabled:opacity-50 flex justify-center items-center"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Table"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
