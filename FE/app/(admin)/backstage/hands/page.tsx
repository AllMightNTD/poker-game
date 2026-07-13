"use client";

import httpClient from "@/core/api/http-client";
import { Eye, X, ShieldCheck, ShieldAlert, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { localShuffleDeck } from "../../../poker-game/table/[id]/components/utils/provablyFairVerify";

export default function AdminHandsPage() {
  const [hands, setHands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [selectedHandId, setSelectedHandId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    calculatedDeck?: string[];
  } | null>(null);
  const [verifying, setVerifying] = useState(false);

  const fetchHands = async (cursor?: string | null) => {
    try {
      if (cursor) setLoadingMore(true);
      else setLoading(true);

      const res = await httpClient.get("/api/v1/admin/hands", {
        params: cursor ? { cursor } : {}
      });
      if (res.data?.data) {
        setHands(prev => cursor ? [...prev, ...res.data.data] : res.data.data);
        setNextCursor(res.data.meta?.next_cursor || null);
        setHasMore(res.data.meta?.has_more || false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchHands();
    });
  }, []);

  const handleViewDetail = async (id: string) => {
    setSelectedHandId(id);
    setDetailLoading(true);
    setDetail(null);
    setVerificationResult(null);
    try {
      const res = await httpClient.get(`/api/v1/admin/hands/${id}`);
      if (res.data) {
        setDetail(res.data);
      }
    } catch (e) {
      console.error(e);
      alert("Không thể tải chi tiết ván bài");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleVerifyProvablyFair = async (
    serverSeedHex: string,
    clientSeedStr: string,
    nonce: number,
    dbDeckJsonOrStr: any
  ) => {
    setVerifying(true);
    setVerificationResult(null);
    try {
      const calculatedDeck = await localShuffleDeck(serverSeedHex, clientSeedStr, nonce);
      
      let dbDeck: string[] = [];
      if (Array.isArray(dbDeckJsonOrStr)) {
        dbDeck = dbDeckJsonOrStr;
      } else if (typeof dbDeckJsonOrStr === 'string') {
        try {
          if (dbDeckJsonOrStr.startsWith('[')) {
            dbDeck = JSON.parse(dbDeckJsonOrStr);
          } else {
            dbDeck = dbDeckJsonOrStr.split(',').map(c => c.trim()).filter(Boolean);
          }
        } catch {
          dbDeck = dbDeckJsonOrStr.split(',').map(c => c.trim()).filter(Boolean);
        }
      }

      const isMatch = JSON.stringify(calculatedDeck) === JSON.stringify(dbDeck);
      if (isMatch) {
        setVerificationResult({
          success: true,
          message: "Xác thực thành công! Bộ bài tự sinh từ hạt giống khớp 100% với bộ bài lưu trong database.",
          calculatedDeck,
        });
      } else {
        setVerificationResult({
          success: false,
          message: "CẢNH BÁO: Bộ bài tự sinh không khớp với bộ bài lưu trong database! Dữ liệu có thể đã bị can thiệp.",
          calculatedDeck,
        });
      }
    } catch (err: any) {
      setVerificationResult({
        success: false,
        message: `Lỗi trong quá trình tính toán: ${err.message || err}`,
      });
    } finally {
      setVerifying(false);
    }
  };

  // Helper to render card suit colors nicely
  const renderCard = (cardStr: string) => {
    if (!cardStr || cardStr.length < 2) return null;
    const value = cardStr.slice(0, -1);
    const suit = cardStr.slice(-1).toLowerCase();
    
    let suitIcon = "";
    let colorClass = "text-slate-100";
    if (suit === "s") {
      suitIcon = "♠";
      colorClass = "text-indigo-400";
    } else if (suit === "h") {
      suitIcon = "♥";
      colorClass = "text-rose-400";
    } else if (suit === "d") {
      suitIcon = "♦";
      colorClass = "text-cyan-400";
    } else if (suit === "c") {
      suitIcon = "♣";
      colorClass = "text-emerald-400";
    }

    return (
      <span className={`inline-flex items-center justify-center w-7 h-9 bg-slate-950 border border-slate-800 rounded-md text-xs font-bold ${colorClass} shadow-md`}>
        {value}{suitIcon}
      </span>
    );
  };

  const renderCardsList = (cardsStr: string) => {
    if (!cardsStr) return <span className="text-slate-500">-</span>;
    // Format could be "As,Kh,Qd" or JSON array string like '["As","Kh"]'
    let cardsArray: string[] = [];
    try {
      if (cardsStr.startsWith("[")) {
        cardsArray = JSON.parse(cardsStr);
      } else {
        cardsArray = cardsStr.split(",").map(c => c.trim()).filter(Boolean);
      }
    } catch {
      cardsArray = cardsStr.split(",").map(c => c.trim()).filter(Boolean);
    }

    if (cardsArray.length === 0) return <span className="text-slate-500">-</span>;

    return (
      <div className="flex gap-1">
        {cardsArray.map((card, idx) => (
          <span key={idx}>{renderCard(card)}</span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Lịch sử ván bài</h1>
        <p className="text-slate-500 text-sm mt-1">Tra cứu chi tiết từng ván bài đã kết thúc, bài tẩy showdown và timeline cược.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-800/40 border-b border-slate-800 text-xs text-slate-500">
                <th className="p-3 font-medium">Hand ID</th>
                <th className="p-3 font-medium">Tên bàn chơi</th>
                <th className="p-3 font-medium">Tổng Pot</th>
                <th className="p-3 font-medium">Phí Rake thu</th>
                <th className="p-3 font-medium">Community Cards</th>
                <th className="p-3 font-medium">Thời gian</th>
                <th className="p-3 font-medium text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">Đang tải dữ liệu...</td>
                </tr>
              ) : hands.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">Chưa có ván bài nào được lưu.</td>
                </tr>
              ) : (
                hands.map((hand) => (
                  <tr key={hand.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-mono text-slate-400">#{hand.id}</td>
                    <td className="p-3 text-slate-200">{hand.table_name}</td>
                    <td className="p-3 font-medium text-emerald-400">${hand.total_pot}</td>
                    <td className="p-3 text-amber-500">${hand.rake_amount}</td>
                    <td className="p-3">{renderCardsList(hand.community_cards)}</td>
                    <td className="p-3 text-slate-500">
                      {new Date(hand.ended_at).toLocaleString("vi-VN")}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleViewDetail(hand.id)}
                        className="p-1.5 rounded-md text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {hasMore && (
          <div className="p-4 border-t border-slate-800 text-center">
            <button
              onClick={() => fetchHands(nextCursor)}
              disabled={loadingMore}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loadingMore ? "Đang tải..." : "Tải thêm"}
            </button>
          </div>
        )}
      </div>

      {/* Hand Detail Modal */}
      {selectedHandId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Chi tiết ván bài #{selectedHandId}</h2>
                {detail && (
                  <p className="text-xs text-slate-500 mt-0.5">Bàn chơi: {detail.hand.table_name} • Thời gian: {new Date(detail.hand.ended_at).toLocaleString("vi-VN")}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedHandId(null);
                  setVerificationResult(null);
                }}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailLoading ? (
                <div className="text-center py-12 text-slate-500">Đang tải chi tiết ván bài...</div>
              ) : detail ? (
                <>
                  {/* Summary row */}
                  <div className="grid grid-cols-4 gap-4 bg-slate-950 border border-slate-850 p-4 rounded-xl text-center">
                    <div>
                      <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Tổng Pot</span>
                      <span className="text-xl font-bold text-emerald-400 mt-1 block">${detail.hand.total_pot}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Rake thu</span>
                      <span className="text-xl font-bold text-amber-500 mt-1 block">${detail.hand.rake_amount}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Ghế Dealer</span>
                      <span className="text-xl font-semibold text-slate-300 mt-1 block">Seat {detail.hand.dealer_seat}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Board</span>
                      {renderCardsList(detail.hand.community_cards)}
                    </div>
                  </div>

                  {/* Player Hand info */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 mb-3">Người chơi & Showdown</h3>
                    <div className="bg-slate-950/40 border border-slate-800 rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-800/20 border-b border-slate-800 text-xs text-slate-500">
                            <th className="p-3 font-medium">Ghế</th>
                            <th className="p-3 font-medium">Tên người chơi</th>
                            <th className="p-3 font-medium">Bài tẩy</th>
                            <th className="p-3 font-medium">Trước ván</th>
                            <th className="p-3 font-medium">Đã cược</th>
                            <th className="p-3 font-medium">Thắng Pot</th>
                            <th className="p-3 font-medium text-right">Net</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {detail.players.map((p: any) => (
                            <tr key={p.id} className="hover:bg-slate-800/10 transition-colors">
                              <td className="p-3 text-slate-400 font-mono">Seat {p.seat_number}</td>
                              <td className="p-3 font-medium text-slate-200">{p.username}</td>
                              <td className="p-3">{renderCardsList(p.hole_cards)}</td>
                              <td className="p-3 text-slate-400">${p.chips_before}</td>
                              <td className="p-3 text-slate-300">${p.chips_bet}</td>
                              <td className="p-3 text-emerald-400">${p.chips_won}</td>
                              <td className={`p-3 text-right font-medium ${p.net_gain_loss >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                {p.net_gain_loss >= 0 ? "+" : ""}${p.net_gain_loss}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Action Timeline */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 mb-3">Nhật ký Timeline cược</h3>
                    <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
                      {detail.actions.length === 0 ? (
                        <div className="text-slate-500 text-center py-4">Không ghi nhận hành động cược nào.</div>
                      ) : (
                        detail.actions.map((act: any) => {
                          let actionColor = "text-slate-300";
                          if (act.action_type === "fold") actionColor = "text-slate-500";
                          else if (act.action_type === "check") actionColor = "text-slate-400";
                          else if (act.action_type === "raise" || act.action_type === "bet") actionColor = "text-amber-400";
                          else if (act.action_type === "allin") actionColor = "text-rose-400 font-bold";
                          else if (act.action_type === "call") actionColor = "text-emerald-400";

                          return (
                            <div key={act.id} className="flex items-center gap-3 hover:bg-slate-800/10 py-1 px-2 rounded">
                              <span className="text-slate-500 w-24 shrink-0">[{act.stage.toUpperCase()}]</span>
                              <span className="text-slate-400 w-20 shrink-0">Seat {act.seat_number}</span>
                              <span className="text-slate-200 w-32 shrink-0 font-medium">{act.username}</span>
                              <span className={`${actionColor} shrink-0`}>
                                {act.action_type.toUpperCase()} {act.amount > 0 ? `$${act.amount}` : ""}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Provably Fair Verification Section */}
                  <div className="border-t border-slate-800 pt-6">
                    <h3 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
                      <ShieldCheck size={18} className="text-indigo-400" />
                      Xác thực minh bạch (Provably Fair)
                    </h3>
                    
                    {detail.provably_fair ? (
                      <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                          <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-900">
                            <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Server Seed Hash (Công bố trước ván)</span>
                            <span className="text-slate-300 break-all select-all block">{detail.provably_fair.server_seed_hash}</span>
                          </div>
                          <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-900">
                            <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Client Seed (Từ người chơi)</span>
                            <span className="text-slate-300 break-all select-all block">{detail.provably_fair.client_seed || 'N/A'}</span>
                          </div>
                          <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-900">
                            <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Server Seed Plain (Mã thô giải mã)</span>
                            <span className="text-emerald-400 break-all select-all block font-bold">
                              {detail.hand.server_seed || 'Chưa giải mã (Ván bài chưa kết thúc)'}
                            </span>
                          </div>
                          <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-900">
                            <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Nonce & Phiên bản thuật toán</span>
                            <span className="text-slate-300 block">
                              Nonce: {detail.provably_fair.nonce} • Phiên bản: {detail.provably_fair.algorithm_version || 'v1.0'}
                            </span>
                          </div>
                        </div>

                        {detail.hand.server_seed ? (
                          <div className="pt-2">
                            <button
                              onClick={() => handleVerifyProvablyFair(
                                detail.hand.server_seed,
                                detail.provably_fair.client_seed,
                                detail.provably_fair.nonce,
                                detail.hand.shuffled_deck
                              )}
                              disabled={verifying}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                            >
                              {verifying ? (
                                <RefreshCw size={14} className="animate-spin" />
                              ) : (
                                <ShieldCheck size={14} />
                              )}
                              {verifying ? 'Đang xác thực...' : 'Bắt đầu chạy xác thực bộ bài'}
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-amber-500 bg-amber-950/20 border border-amber-900/50 p-3 rounded-lg">
                            Ván bài này chưa được giải phóng hạt giống thô (Chưa kết thúc hoặc chưa showdown). Không thể chạy thuật toán xác thực.
                          </p>
                        )}

                        {/* Verification Result Display */}
                        {verificationResult && (
                          <div className={`p-4 rounded-xl border text-xs space-y-3 ${
                            verificationResult.success 
                              ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-400' 
                              : 'bg-rose-950/20 border-rose-800/60 text-rose-400'
                          }`}>
                            <div className="flex items-center gap-2 font-semibold">
                              {verificationResult.success ? (
                                <ShieldCheck size={16} className="text-emerald-400" />
                              ) : (
                                <ShieldAlert size={16} className="text-rose-400" />
                              )}
                              <span>{verificationResult.message}</span>
                            </div>

                            {verificationResult.calculatedDeck && (
                              <div className="space-y-2">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                                  Bộ bài tự sinh tính toán trên Client (52 lá):
                                </span>
                                <div className="flex flex-wrap gap-1 bg-slate-950/60 p-3 rounded-lg border border-slate-900 max-h-[120px] overflow-y-auto">
                                  {verificationResult.calculatedDeck.map((card, idx) => (
                                    <span key={idx} className="scale-90 transform origin-center">
                                      {renderCard(card)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-xs italic bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                        Không tìm thấy dữ liệu Provably Fair cho ván bài này.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-500">Không có dữ liệu.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
