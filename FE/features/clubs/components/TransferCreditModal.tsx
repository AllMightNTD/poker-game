"use client";

import { useState } from "react";
import { clubsApi } from "@/features/clubs/api/clubs-api";
import { X, Loader2, ArrowRight } from "lucide-react";

export default function TransferCreditModal({ 
  clubId, 
  member,
  onClose, 
  onSuccess 
}: { 
  clubId: string, 
  member: any,
  onClose: () => void, 
  onSuccess: () => void 
}) {
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<'send' | 'receive'>('send');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      const finalAmount = direction === 'send' ? amount : `-${amount}`;
      await clubsApi.transferCredit(clubId, member.user_id, finalAmount);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to transfer credit");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-slate-800 shadow-2xl overflow-hidden relative">
        <div className="flex justify-between items-center p-5 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Transfer Credit</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-center flex-1">
              <p className="text-sm text-slate-500 font-semibold mb-1">Target</p>
              <p className="font-bold text-white">{member.user.user_name}</p>
            </div>
            <div className="px-4 text-amber-500">
              <ArrowRight size={24} className={direction === 'receive' ? 'rotate-180' : ''} />
            </div>
            <div className="text-center flex-1">
              <p className="text-sm text-slate-500 font-semibold mb-1">Action</p>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as any)}
                className="bg-transparent font-bold text-amber-500 outline-none cursor-pointer"
              >
                <option value="send">Send to Member</option>
                <option value="receive">Take from Member</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Amount</label>
            <div className="relative">
              <input
                type="number"
                required
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-2xl font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-amber-500 transition"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-amber-500">$</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {direction === 'send' 
                ? 'This will deduct from your balance and add to the member.' 
                : 'This will deduct from the member and add to your balance.'}
            </p>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !amount || Number(amount) <= 0}
              className="flex-1 py-3 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition disabled:opacity-50 flex justify-center items-center"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Transfer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
