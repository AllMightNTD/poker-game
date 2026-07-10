"use client";

import { useState } from "react";
import { clubsApi } from "@/features/clubs/api/clubs-api";
import { X, Loader2 } from "lucide-react";

export default function ClubJoinModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      await clubsApi.joinClub(code.trim().toUpperCase());
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to join club. Check your code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-sm border border-slate-800 shadow-2xl overflow-hidden relative">
        <div className="flex justify-between items-center p-5 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Join Club</h2>
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
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Invite Code</label>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. PKR7X2"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.2em] font-mono text-amber-500 placeholder:text-slate-700 focus:outline-none focus:border-amber-500 transition uppercase"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading || code.length < 4}
              className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition disabled:opacity-50 flex justify-center items-center"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Join Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
