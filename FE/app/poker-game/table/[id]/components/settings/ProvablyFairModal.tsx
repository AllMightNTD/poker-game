"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X, RefreshCw, Clipboard, Check, Eye } from "lucide-react";
import { usePokerGame } from "../hooks/usePokerGame";
import { localShuffleDeck, calculateDeckHash } from "../utils/provablyFairVerify";

const getCardSuitSymbol = (card: string) => {
  const suit = card.slice(-1);
  switch (suit) {
    case 'S': return '♠';
    case 'H': return '♥';
    case 'D': return '♦';
    case 'C': return '♣';
    default: return '';
  }
};

const getCardSuitColor = (card: string) => {
  const suit = card.slice(-1);
  return suit === 'H' || suit === 'D' ? 'text-red-500 border-red-500/20 bg-red-500/5' : 'text-slate-200 border-slate-700 bg-slate-800/20';
};

const getCardValue = (card: string) => {
  const val = card.slice(0, -1);
  if (val === 'T') return '10';
  return val;
};

export const ProvablyFairModal = () => {
  const {
    isProvablyFairOpen,
    setIsProvablyFairOpen,
    provablyFair,
    prevProvablyFair,
    updateClientSeed,
    showToast,
  } = usePokerGame();

  const [activeTab, setActiveTab] = useState<"config" | "verify">("config");

  // Tab 1 state
  const [clientSeedInput, setClientSeedInput] = useState(provablyFair?.client_seed ?? "");

  // Sync clientSeedInput when provablyFair changes (render-time update, avoids useEffect setState)
  const prevSeedRef = useRef(provablyFair?.client_seed);
  if (prevSeedRef.current !== provablyFair?.client_seed) {
    prevSeedRef.current = provablyFair?.client_seed;
    setClientSeedInput(provablyFair?.client_seed ?? "");
  }

  // Tab 2 state (Verification Tool)
  const [verifyServerSeed, setVerifyServerSeed] = useState("");
  const [verifyClientSeed, setVerifyClientSeed] = useState("");
  const [verifyNonce, setVerifyNonce] = useState("1");
  const [verifyExpectedHash, setVerifyExpectedHash] = useState("");
  const [verificationResult, setVerificationResult] = useState<{
    deck: string[];
    hash: string;
  } | null>(null);

  const handleRandomizeSeed = () => {
    const chars = "abcdef0123456789";
    let randSeed = "";
    for (let i = 0; i < 32; i++) {
      randSeed += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setClientSeedInput(randSeed);
  };

  const handleSaveSeed = () => {
    if (!clientSeedInput.trim()) {
      showToast("Seed cannot be empty", "error");
      return;
    }
    updateClientSeed(clientSeedInput.trim());
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard", "success");
  };

  const handleLoadToVerify = () => {
    if (prevProvablyFair) {
      setVerifyServerSeed(prevProvablyFair.server_seed_plain || "");
      setVerifyClientSeed(prevProvablyFair.client_seed || "");
      // Nonce is either in context or fallback to 1
      const lastNonce = (prevProvablyFair as any).nonce !== undefined ? String((prevProvablyFair as any).nonce) : "1";
      setVerifyNonce(lastNonce);
      setActiveTab("verify");
      setVerificationResult(null);
      showToast("Loaded previous hand seed into verifier", "info");
    }
  };

  const handleVerify = async () => {
    if (!verifyServerSeed.trim()) {
      showToast("Please enter Server Seed", "error");
      return;
    }
    if (!verifyClientSeed.trim()) {
      showToast("Please enter Client Seed", "error");
      return;
    }
    const nonceNum = parseInt(verifyNonce);
    if (isNaN(nonceNum) || nonceNum < 1) {
      showToast("Invalid Nonce", "error");
      return;
    }

    try {
      const deck = await localShuffleDeck(
        verifyServerSeed.trim(),
        verifyClientSeed.trim(),
        nonceNum
      );
      const hash = await calculateDeckHash(deck);
      setVerificationResult({ deck, hash });
      showToast("Verification and shuffling successful!", "success");
    } catch (e: any) {
      showToast(`Lỗi xác thực: ${e.message}`, "error");
    }
  };

  if (!isProvablyFairOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsProvablyFairOpen(false)}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl z-10 text-left overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] before:from-emerald-500/5 before:via-transparent before:to-transparent before:pointer-events-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck size={20} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400">
                  Provably Fair System
                                                  </h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">
                  Ensuring absolute fairness and transparency
                                                  </p>
              </div>
            </div>
            <button
              onClick={() => setIsProvablyFairOpen(false)}
              className="w-8 h-8 rounded-lg bg-slate-950/40 hover:bg-slate-850/60 border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-5 p-1 rounded-xl bg-slate-950/40 border border-slate-850">
            <button
              onClick={() => setActiveTab("config")}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
                activeTab === "config"
                  ? "bg-emerald-600 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Seed Configuration
                                      </button>
            <button
              onClick={() => setActiveTab("verify")}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
                activeTab === "verify"
                  ? "bg-emerald-600 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Game Verifier
                                      </button>
          </div>

          {/* Body */}
          <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {activeTab === "config" ? (
              <div className="space-y-4">
                {/* Seed explanation */}
                <div className="p-3.5 rounded-xl bg-slate-950/20 border border-slate-850 text-[11px] leading-relaxed text-slate-400">
                  The system uses cryptography to shuffle cards. Before each hand, the server generates a <strong className="text-slate-200">Server Seed</strong> randomly and only displays the hash <strong className="text-slate-200">SHA-256 Hash</strong> of it to guarantee the deck is not altered. Players can set their own <strong className="text-emerald-400">Client Seed</strong> to participate in the shuffling process.
                                                  </div>

                {/* Client Seed Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 flex items-center justify-between">
                    <span>Your Seed (Client Seed)</span>
                    <span className="text-[9px] text-slate-500">Used for subsequent hands</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={clientSeedInput}
                      onChange={(e) => setClientSeedInput(e.target.value)}
                      className="flex-1 bg-slate-950/60 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none transition-colors"
                      placeholder="Enter any seed..."
                    />
                    <button
                      type="button"
                      onClick={handleRandomizeSeed}
                      className="px-3 rounded-xl bg-slate-850 hover:bg-slate-750 border border-slate-800 flex items-center justify-center text-slate-300 transition-colors"
                      title="Auto-generate seed"
                    >
                      <RefreshCw size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveSeed}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors"
                    >
                      Save
                                                              </button>
                  </div>
                </div>

                {/* Current seeds detail */}
                <div className="space-y-2.5 p-4 rounded-xl bg-slate-950/40 border border-slate-850">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1 h-3 rounded-full bg-emerald-500" />
                    Current Hand
                                                        </h4>
                  
                  <div className="grid grid-cols-3 gap-3 text-[11px]">
                    <div className="col-span-3 space-y-1">
                      <span className="text-slate-500 font-bold">Server Seed Hash (SHA-256)</span>
                      <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-2 rounded-lg border border-slate-850/60 font-mono text-[10px] text-slate-300">
                        <span className="truncate flex-1 select-all">{provablyFair?.server_seed_hash || "Waiting to start..."}</span>
                        {provablyFair?.server_seed_hash && (
                          <button onClick={() => handleCopy(provablyFair.server_seed_hash)} className="text-slate-500 hover:text-slate-300">
                            <Clipboard size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 font-bold">Current Client Seed</span>
                      <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-850/60 font-mono text-slate-300 truncate select-all">
                        {provablyFair?.client_seed || "Default"}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 font-bold">Nonce for this hand</span>
                      <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-850/60 font-mono text-slate-300">
                        {provablyFair?.client_seed ? (provablyFair as any).nonce || "1" : "1"}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 font-bold">Algorithm</span>
                      <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-850/60 font-mono text-slate-400 font-black">
                        ChaCha20
                      </div>
                    </div>
                  </div>
                </div>

                {/* Last hand reveal detail */}
                {prevProvablyFair && prevProvablyFair.server_seed_plain && (
                  <div className="space-y-2.5 p-4 rounded-xl bg-slate-950/20 border border-slate-850">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <span className="w-1 h-3 rounded-full bg-slate-500" />
                        Previous Hand Results
                                                                    </h4>
                      <button
                        onClick={handleLoadToVerify}
                        className="text-[9px] font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                      >
                        <Eye size={10} />
                        Load into verifier
                                                                    </button>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div className="space-y-1">
                        <span className="text-slate-500 font-bold">Server Seed (Raw - Revealed)</span>
                        <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-2 rounded-lg border border-slate-850/60 font-mono text-[10px] text-emerald-400">
                          <span className="truncate flex-1 select-all">{prevProvablyFair.server_seed_plain}</span>
                          <button onClick={() => handleCopy(prevProvablyFair.server_seed_plain!)} className="text-slate-500 hover:text-slate-300">
                            <Clipboard size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-slate-500 font-bold">Client Seed used in previous hand</span>
                          <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-850/60 font-mono text-slate-300 truncate select-all">
                            {prevProvablyFair.client_seed}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-slate-500 font-bold">Previous hand Nonce</span>
                          <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-850/60 font-mono text-slate-300">
                            {(prevProvablyFair as any).nonce || "1"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-950/20 border border-slate-850 text-[11px] leading-relaxed text-slate-400">
                  Re-run the Fisher-Yates shuffle algorithm using ChaCha20 in your browser to cross-check if the generated deck matches the system&apos;s game result.
                                                      </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Server seed input */}
                  <div className="col-span-1 md:col-span-3 space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Server Seed (Raw - Hex)</label>
                    <input
                      type="text"
                      value={verifyServerSeed}
                      onChange={(e) => setVerifyServerSeed(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
                      placeholder="Enter revealed Server Seed..."
                    />
                  </div>

                  {/* Client seed input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Client Seed</label>
                    <input
                      type="text"
                      value={verifyClientSeed}
                      onChange={(e) => setVerifyClientSeed(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
                      placeholder="Enter Client Seed..."
                    />
                  </div>

                  {/* Nonce input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Nonce</label>
                    <input
                      type="number"
                      value={verifyNonce}
                      onChange={(e) => setVerifyNonce(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
                      placeholder="1"
                    />
                  </div>

                  {/* Expected Deck Hash */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Expected Deck Hash (Optional)</label>
                    <input
                      type="text"
                      value={verifyExpectedHash}
                      onChange={(e) => setVerifyExpectedHash(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
                      placeholder="Deck hash from history..."
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleVerify}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emerald-950/20"
                  >
                    Verify & Shuffle Deck
                                                            </button>
                </div>

                {/* Results block */}
                {verificationResult && (
                  <div className="space-y-3.5 p-4 rounded-xl bg-slate-950/40 border border-slate-850">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1 h-3 rounded-full bg-emerald-500" />
                        Shuffle Result
                                                                        </span>
                      {verifyExpectedHash && (
                        verificationResult.hash === verifyExpectedHash.trim() ? (
                          <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase flex items-center gap-1">
                            <Check size={8} /> 100% Match
                                                                                    </span>
                        ) : (
                          <span className="text-red-400 bg-red-950/60 border border-red-500/20 px-2 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase">
                            Mismatch
                                                                                        </span>
                        )
                      )}
                    </h4>

                    {/* Computed Deck Hash */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Deck SHA-256 Hash</span>
                      <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-2 rounded-lg border border-slate-850/60 font-mono text-[9px] text-slate-300">
                        <span className="truncate flex-1 select-all">{verificationResult.hash}</span>
                        <button onClick={() => handleCopy(verificationResult.hash)} className="text-slate-500 hover:text-slate-300">
                          <Clipboard size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Visually Shuffled Cards */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block">List of 52 cards (shuffled from top to bottom)</span>
                      <div className="grid grid-cols-10 sm:grid-cols-13 gap-1 bg-slate-950/50 p-2.5 rounded-xl border border-slate-900 max-h-[160px] overflow-y-auto">
                        {verificationResult.deck.map((card, idx) => (
                          <div
                            key={`${card}-${idx}`}
                            className={`flex flex-col items-center justify-center h-8 rounded border font-mono text-[10px] font-black ${getCardSuitColor(card)}`}
                            title={`Lá bài thứ ${idx + 1}`}
                          >
                            <span>{getCardValue(card)}</span>
                            <span className="text-[11px] leading-none">{getCardSuitSymbol(card)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 mt-6 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsProvablyFairOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/20 hover:bg-slate-950/60 text-slate-400 hover:text-slate-200 font-black text-[10px] uppercase tracking-wider transition-colors text-center"
            >
              Close
                                      </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
