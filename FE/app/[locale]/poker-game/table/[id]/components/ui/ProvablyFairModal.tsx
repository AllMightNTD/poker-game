"use client";

import React, { useState } from "react";
import { X, ShieldAlert, Check, Copy } from "lucide-react";
import { usePokerGame } from "../hooks/usePokerGame";

interface ProvablyFairModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProvablyFairModal: React.FC<ProvablyFairModalProps> = ({ isOpen, onClose }) => {
  const { provablyFair, prevProvablyFair } = usePokerGame();
  const [activeTab, setActiveTab] = useState<"current" | "previous">("current");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verifyCodeSnippet = `import hmac
import hashlib

def get_shuffled_deck(server_seed, client_seed):
    # Combined seed via HMAC-SHA512
    combined = hmac.new(
        server_seed.encode('utf-8'),
        client_seed.encode('utf-8'),
        hashlib.sha512
    ).hexdigest()
    
    # Initialize Fisher-Yates with combined seed
    # ...
    print("Combined seed:", combined)
`;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-amber-500 w-5 h-5" />
            <h3 className="text-base font-black text-slate-100 uppercase tracking-wider">
              Xác Minh Tính Công Bằng (Provably Fair)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/20">
          <button
            onClick={() => setActiveTab("current")}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "current"
                ? "border-amber-500 text-amber-400 bg-slate-900/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Ván Hiện Tại (Active Hand)
          </button>
          <button
            onClick={() => setActiveTab("previous")}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "previous"
                ? "border-amber-500 text-amber-400 bg-slate-900/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Xác Minh Ván Trước (Verify Last Hand)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh] text-xs">
          {activeTab === "current" ? (
            <div className="space-y-4">
              <p className="text-slate-400 leading-relaxed">
                Khi ván bài bắt đầu, hệ thống đã mã hóa Server Seed dưới dạng mã băm SHA-256 để đảm bảo tính
                khách quan. Sau khi kết thúc ván, Server Seed gốc sẽ được công bố để bạn đối chiếu.
              </p>
              
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    Server Seed Hash (SHA-256)
                  </label>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-amber-500 break-all select-all flex justify-between items-start gap-2">
                    <span>{provablyFair?.server_seed_hash || "Chưa có ván bài nào bắt đầu"}</span>
                    {provablyFair?.server_seed_hash && (
                      <button
                        onClick={() => handleCopy(provablyFair.server_seed_hash)}
                        className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
                      >
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    Client Seed (Dealer Seat Seed)
                  </label>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-slate-300 break-all">
                    {provablyFair?.client_seed || "Chưa thiết lập"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-400 leading-relaxed">
                Dưới đây là Server Seed gốc và Client Seed của ván bài vừa kết thúc. Bạn có thể sử dụng mã nguồn mẫu
                ở dưới để kiểm chứng lại tính công bằng trong việc xáo bài (Fisher-Yates Shuffle).
              </p>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    Server Seed (Plain text)
                  </label>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-emerald-400 break-all flex justify-between items-start gap-2">
                    <span>{prevProvablyFair?.server_seed_plain || "Chưa có dữ liệu ván trước"}</span>
                    {prevProvablyFair?.server_seed_plain && (
                      <button
                        onClick={() => handleCopy(prevProvablyFair.server_seed_plain || "")}
                        className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
                      >
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    Client Seed
                  </label>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-slate-300 break-all">
                    {prevProvablyFair?.client_seed || "Chưa có dữ liệu ván trước"}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    Đoạn mã python kiểm thử (Fisher-Yates verification)
                  </label>
                  <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-slate-400 overflow-x-auto text-[10px] leading-relaxed">
                    {verifyCodeSnippet}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
