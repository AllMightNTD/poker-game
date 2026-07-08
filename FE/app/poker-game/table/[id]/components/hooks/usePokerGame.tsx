"use client";
import * as SocketTypes from "../socket-types";

import { httpClient } from "@/core/api/http-client";
import { useSocket } from "@/core/providers/SocketProvider";
import { useCurrentUser } from "@/core/providers/user-provider";
import { useParams, useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Card, CardDeckStyleTheme, ChatMessage, Player, TableBackgroundTheme } from "../types";

interface ProvablyFairData {
  server_seed_hash: string;
  server_seed_plain?: string;
  client_seed: string;
}

interface PokerGameContextProps {
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (v: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (v: boolean) => void;
  showChat: boolean;
  setShowChat: (v: boolean) => void;
  showHistory: boolean;
  setShowHistory: (v: boolean) => void;
  tableBackground: TableBackgroundTheme;
  setTableBackground: (v: TableBackgroundTheme) => void;
  cardDeckStyle: CardDeckStyleTheme;
  setCardDeckStyle: (v: CardDeckStyleTheme) => void;
  dealerVoiceVol: number;
  setDealerVoiceVol: (v: number) => void;
  soundEffectsVol: number;
  setSoundEffectsVol: (v: number) => void;
  muteAllVoice: boolean;
  setMuteAllVoice: (v: boolean) => void;
  draftTableBg: TableBackgroundTheme;
  setDraftTableBg: (v: TableBackgroundTheme) => void;
  draftDeckStyle: CardDeckStyleTheme;
  setDraftDeckStyle: (v: CardDeckStyleTheme) => void;
  draftDealerVoiceVol: number;
  setDraftDealerVoiceVol: (v: number) => void;
  draftSoundEffectsVol: number;
  setDraftSoundEffectsVol: (v: number) => void;
  draftMuteAllVoice: boolean;
  setDraftMuteAllVoice: (v: boolean) => void;
  tableName: string;
  setTableName: (v: string) => void;
  smallBlind: string;
  setSmallBlind: (v: string) => void;
  bigBlind: string;
  setBigBlind: (v: string) => void;
  pot: string;
  setPot: React.Dispatch<React.SetStateAction<string>>;
  minRaise: number;
  setMinRaise: (v: number) => void;
  maxRaise: number;
  setMaxRaise: (v: number) => void;
  raiseAmount: number;
  setRaiseAmount: (v: number) => void;
  waitingMessage: { text: string, starting: boolean } | null;
  gameStage: "preflop" | "flop" | "turn" | "river" | "showdown" | "ended" | "waiting";
  setGameStage: React.Dispatch<React.SetStateAction<"preflop" | "flop" | "turn" | "river" | "showdown" | "ended" | "waiting">>;
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  chatInput: string;
  setChatInput: (v: string) => void;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  sendChatMessage: (e: React.FormEvent) => void;
  handHistory: string[];
  setHandHistory: React.Dispatch<React.SetStateAction<string[]>>;
  toastMsg: { text: string; type: "success" | "error" | "info" | "warning" } | null;
  showToast: (text: any, type?: "success" | "error" | "info" | "warning") => void;
  handleUserAction: (action: string, amount?: number) => void;
  requestExtraTime: () => void;
  communityCards: Card[];
  setCommunityCards: React.Dispatch<React.SetStateAction<Card[]>>;
  isBombPot: boolean;
  ritBoard2Cards: Card[];
  isRitVotingActive: boolean;
  ritVoters: string[];
  ritVotesYesCount: number;
  ritVotesNoCount: number;
  voteRit: (agree: boolean) => void;
  muckOption: boolean;
  setMuckOption: (v: boolean) => void;
  rabbitCards: Card[] | null;
  triggerRabbitHunt: () => void;
  tableId: string;
  tableRef: React.RefObject<HTMLDivElement | null>;
  tableScale: number;
  getFeltStyles: (theme: TableBackgroundTheme) => { gradient: string; line: string };
  formatChipsVal: (val: string) => string;
  maxTimerVal: number;
  timerVal: number;
  ownerId: string;
  currentTurnSeat: number;
  dealerSeat: number;
  smallBlindSeat: number;
  bigBlindSeat: number;
  provablyFair: ProvablyFairData | null;
  prevProvablyFair: ProvablyFairData | null;
  isConnecting: boolean;
  currentHighestBet: number;
  minBuyin: number;
  maxBuyin: number;
  maxPlayers: number;
  loadMoreChats: () => void;
  hasMoreChats: boolean;
  isLoadingHistory: boolean;

  // Host Mod Actions
  roomStatus: string;
  setRoomStatus: (val: string) => void;
  togglePause: (paused: boolean) => Promise<void>;
  modifyBlinds: (sb: number) => Promise<void>;
  kickPlayer: (seatIndex: number) => Promise<void>;
  forceSitOut: (seatIndex: number) => Promise<void>;
  modifyPlayerStack: (seatIndex: number, amount: number, action: "add" | "subtract") => Promise<void>;
  fetchStats: () => Promise<unknown>;

  // Sit Down Requests & Start game
  sitRequests: SocketTypes.SitRequest[];
  submitSitRequest: (seatNumber: number, amount: number, customName?: string) => void;
  respondSitRequest: (requestId: string, approve: boolean) => void;
  startGame: () => void;
  updateClientSeed: (clientSeed: string) => void;
  leaveTable: () => Promise<void>;
}

const PokerGameContext = createContext<PokerGameContextProps | undefined>(undefined);

export const PokerGameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const params = useParams();
  const { currentUser } = useCurrentUser();
  const { socket, isConnected } = useSocket();
  const tableId = params?.id as string;
  const router = useRouter();

  // Sound and HUD settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Responsive Table Scaling State and Ref
  const tableRef = useRef<HTMLDivElement>(null);
  const [tableScale, setTableScale] = useState(1);

  // Customization States
  const [tableBackground, setTableBackground] = useState<TableBackgroundTheme>("classic_green");
  const [cardDeckStyle, setCardDeckStyle] = useState<CardDeckStyleTheme>("classic");
  const [dealerVoiceVol, setDealerVoiceVol] = useState(80);
  const [soundEffectsVol, setSoundEffectsVol] = useState(100);
  const [muteAllVoice, setMuteAllVoice] = useState(false);

  // Temporary draft states
  const [draftTableBg, setDraftTableBg] = useState<TableBackgroundTheme>("classic_green");
  const [draftDeckStyle, setDraftDeckStyle] = useState<CardDeckStyleTheme>("classic");
  const [draftDealerVoiceVol, setDraftDealerVoiceVol] = useState(80);
  const [draftSoundEffectsVol, setDraftSoundEffectsVol] = useState(100);
  const [draftMuteAllVoice, setDraftMuteAllVoice] = useState(false);

  // Table State
  const [tableName, setTableName] = useState("Bàn Poker");
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [smallBlind, setSmallBlind] = useState("50");
  const [bigBlind, setBigBlind] = useState("100");
  const [pot, setPot] = useState("0");
  const [minRaise, setMinRaise] = useState(200);
  const [maxRaise, setMaxRaise] = useState(1000);
  const [raiseAmount, setRaiseAmount] = useState(0);
  const [waitingMessage, setWaitingMessage] = useState<{ text: string, starting: boolean } | null>(null);
  const [gameStage, setGameStage] = useState<"preflop" | "flop" | "turn" | "river" | "showdown" | "ended" | "waiting">("waiting");
  const [players, setPlayers] = useState<Player[]>([]);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [isBombPot, setIsBombPot] = useState(false);
  const [ritBoard2Cards, setRitBoard2Cards] = useState<Card[]>([]);
  const [isRitVotingActive, setIsRitVotingActive] = useState(false);
  const [ritVoters, setRitVoters] = useState<string[]>([]);
  const [ritVotesYesCount, setRitVotesYesCount] = useState(0);
  const [ritVotesNoCount, setRitVotesNoCount] = useState(0);
  const [muckOption, _setMuckOption] = useState(false);
  const [rabbitCards, setRabbitCards] = useState<Card[] | null>(null);

  const voteRit = (agree: boolean) => {
    if (!socket) return;
    socket.emit("table:rit-vote", { room_id: tableId, agree });
    setIsRitVotingActive(false);
  };

  const setMuckOption = (v: boolean) => {
    _setMuckOption(v);
    if (socket) {
      socket.emit("table:set-muck", { room_id: tableId, muck: v });
    }
  };

  const triggerRabbitHunt = () => {
    if (!socket) return;
    socket.emit("table:rabbit-hunt", { room_id: tableId });
  };
  const [ownerId, setOwnerId] = useState("");
  const [currentTurnSeat, setCurrentTurnSeat] = useState(0);
  const [dealerSeat, setDealerSeat] = useState(1);
  const [smallBlindSeat, setSmallBlindSeat] = useState(0);
  const [bigBlindSeat, setBigBlindSeat] = useState(0);
  const [roomStatus, setRoomStatus] = useState("waiting");

  // Provably Fair States
  const [provablyFair, setProvablyFair] = useState<ProvablyFairData | null>(null);
  const [prevProvablyFair, setPrevProvablyFair] = useState<ProvablyFairData | null>(null);

  // Hand history log
  const [handHistory, setHandHistory] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [hasMoreChats, setHasMoreChats] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Disconnect & network status
  const [isConnecting, setIsConnecting] = useState(false);

  // Timers
  const maxTimerVal = 30;
  const [timerVal, setTimerVal] = useState(0);

  // Toast State
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" | "info" | "warning" } | null>(null);

  // Sit Down Requests State
  const [sitRequests, setSitRequests] = useState<SocketTypes.SitRequest[]>([]);
  const [minBuyin, setMinBuyin] = useState(0);
  const [maxBuyin, setMaxBuyin] = useState(0);

  // Refs to prevent infinite resubscription loop in socket useEffect
  const currentUserRef = useRef(currentUser);
  const playersRef = useRef(players);
  const ownerIdRef = useRef(ownerId);
  const potRef = useRef(pot);
  const currentTurnSeatRef = useRef(currentTurnSeat);

  useEffect(() => {
    currentUserRef.current = currentUser;
    if (currentUser) {
      // FIX: re-evaluate isHero khi currentUser load xong
      // Không xóa cards của opponent (giữ nguyên), chỉ cập nhật isHero flag
      Promise.resolve().then(() => {
        setPlayers((prev) =>
          prev.map((p) => {
            const isHero = String(p.id) === String(currentUser.id);
            return {
              ...p,
              isHero,
              // Hero: giữ bài hiện có (hoặc [] nếu chưa có); Opponent: giữ nguyên bài
              cards: isHero ? (p.cards?.length ? p.cards : []) : p.cards,
            };
          })
        );
      });
    }
  }, [currentUser]);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    ownerIdRef.current = ownerId;
  }, [ownerId]);

  useEffect(() => {
    potRef.current = pot;
  }, [pot]);

  useEffect(() => {
    currentTurnSeatRef.current = currentTurnSeat;
  }, [currentTurnSeat]);

  const showToast = (text: any, type: "success" | "error" | "info" | "warning" = "success") => {
    let formattedText = "Đã xảy ra lỗi không xác định.";
    if (typeof text === "string") {
      formattedText = text;
    } else if (Array.isArray(text)) {
      formattedText = text
        .map((err: any) => {
          if (typeof err === "object" && err !== null) {
            return err.error || err.message || JSON.stringify(err);
          }
          return String(err);
        })
        .join(", ");
    } else if (typeof text === "object" && text !== null) {
      formattedText = text.error || text.message || JSON.stringify(text);
    }
    setToastMsg({ text: formattedText, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Helper for dynamic felt styles
  const getFeltStyles = (theme: TableBackgroundTheme) => {
    switch (theme) {
      case "royal_blue":
        return {
          gradient: "bg-[radial-gradient(ellipse_at_center,_#1e3a8a_0%,_#172554_80%,_#020617_100%)]",
          line: "border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        };
      case "ruby_red":
        return {
          gradient: "bg-[radial-gradient(ellipse_at_center,_#9f1239_0%,_#4c0519_80%,_#000000_100%)]",
          line: "border-rose-400/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
        };
      case "shadow_black":
        return {
          gradient: "bg-[radial-gradient(ellipse_at_center,_#334155_0%,_#0f172a_80%,_#000000_100%)]",
          line: "border-slate-400/30 shadow-[0_0_15px_rgba(148,163,184,0.3)]"
        };
      case "classic_green":
      default:
        return {
          gradient: "bg-[radial-gradient(ellipse_at_center,_#047857_0%,_#064e3b_80%,_#022c22_100%)]",
          line: "border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        };
    }
  };

  // Parse card string from BE into card object
  const parseCard = (cardStr: string): Card => {
    if (!cardStr || cardStr.length < 2) return { suit: "S", rank: "A" };
    const suitChar = cardStr.slice(-1).toUpperCase();
    const rankStr = cardStr.slice(0, -1).toUpperCase();
    return { suit: suitChar as Card["suit"], rank: rankStr };
  };

  // Play Sound Effects
  const playActionSound = (actionType: string) => {
    if (!soundEnabled) return;
    try {
      let soundPath = "";
      switch (actionType) {
        case "fold":
          soundPath = "/sounds/fold.mp3";
          break;
        case "check":
          soundPath = "/sounds/check.mp3";
          break;
        case "call":
          soundPath = "/sounds/call.mp3";
          break;
        case "raise":
        case "bet":
          soundPath = "/sounds/raise.mp3";
          break;
        case "allin":
          soundPath = "/sounds/allin.mp3";
          break;
        default:
          return;
      }
      const audio = new Audio(soundPath);
      audio.volume = soundEffectsVol / 100;
      audio.play().catch(() => { });
    } catch (e) {
      console.warn("Sound play failed", e);
    }
  };

  // Local turn countdown timer
  useEffect(() => {
    if (timerVal <= 0) return;
    const interval = setInterval(() => {
      setTimerVal((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerVal]);

  // Responsive scaling
  useEffect(() => {
    const handleResize = () => {
      if (!tableRef.current) return;
      const parentWidth = tableRef.current.parentElement?.clientWidth || window.innerWidth;
      const targetWidth = 1000; // base virtual width
      const scale = Math.min(1, parentWidth / targetWidth);
      setTableScale(scale);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [showChat]);

  // Listen to WebSocket Events
  useEffect(() => {
    if (!socket || !tableId || !isConnected) return;

    // Join room
    socket.emit("table:subscribe", { room_id: tableId });
    // Fetch initial chat history
    socket.emit("table:get-chat-history", { room_id: tableId, offset: 0, limit: 20 });

    socket.on("error", (data: Record<string, unknown>) => {
      showToast((data.message as string) || "Đã xảy ra lỗi không xác định.", "error");
    });

    socket.on("table:state", (data: SocketTypes.TableStatePayload) => {
      setTableName(data.room_name || "Bàn Poker");
      setMaxPlayers(data.max_players || 6);
      setGameStage(data.game_stage);
      if (data.game_stage !== 'waiting') {
        setWaitingMessage(null);
      }
      setPot(data.total_pot.toString());
      setCommunityCards(data.community_cards ? data.community_cards.map(parseCard) : []);
      setDealerSeat(data.dealer_seat);
      setSmallBlindSeat(data.small_blind_seat);
      setBigBlindSeat(data.big_blind_seat);
      setCurrentTurnSeat(data.current_turn_seat);
      setTimerVal(data.remaining_time ?? 0);
      setOwnerId(data.owner_id || "");
      setRoomStatus(data.status || "waiting");
      setMinBuyin(data.min_buyin || 0);
      setMaxBuyin(data.max_buyin || 0);
      setSmallBlind(data.small_blind ? data.small_blind.toString() : "50");
      setBigBlind(data.big_blind ? data.big_blind.toString() : "100");

      setIsBombPot(!!data.is_bomb_pot);
      if (data.rit_board2_cards) {
        if (typeof data.rit_board2_cards === 'string') {
          const arr = (data.rit_board2_cards as string).split(',').filter(c => c.trim() !== '');
          setRitBoard2Cards(arr.map(parseCard));
        } else if (Array.isArray(data.rit_board2_cards)) {
          setRitBoard2Cards(data.rit_board2_cards.map(parseCard));
        }
      } else {
        setRitBoard2Cards([]);
      }

      // Sync players list
      if (data.seats) {
        const heroId = currentUserRef.current?.id;
        setPlayers((prev) => {
          return data.seats.map((s) => {
            // FIX: so sánh trực tiếp bằng seat id, không phụ thuộc ref timing
            const isHero = !!heroId && String(s.id) === String(heroId);
            const existingPlayer = prev.find((p) => p.seatIndex === s.seatIndex);

            // FIX: Hero luôn giữ lại bài hiện tại nếu có (không reset khi state sync lại)
            // Opponent nhận 2 bài úp mặt khi đang trong ván
            let defaultCards: NonNullable<typeof prev[0]>['cards'] = undefined;
            if (data.game_stage !== "waiting" && data.game_stage !== "ended" && s.status !== "folded") {
              if (isHero) {
                // Hero: giữ nguyên bài đang có, nếu chưa có thì [] (chờ table:private-cards)
                defaultCards = existingPlayer?.cards?.length ? existingPlayer.cards : [];
              } else {
                // FIX: dùng sentinel "back" thay vì A♠ A♠ làm placeholder
                // để không bị flip face-up khi showdown
                defaultCards = existingPlayer?.cards?.length
                  ? existingPlayer.cards
                  : [{ suit: "back", rank: "back" }, { suit: "back", rank: "back" }];
              }
            }

            return {
              seatIndex: s.seatIndex,
              id: s.id,
              name: s.name,
              avatar: s.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${s.name}`,
              chips: s.chips.toString(),
              current_bet: s.current_bet ? s.current_bet.toString() : "0",
              has_used_extra_time: s.has_used_extra_time,
              isDealer: s.seatIndex === data.dealer_seat,
              isSmallBlind: s.seatIndex === data.small_blind_seat,
              isBigBlind: s.seatIndex === data.big_blind_seat,
              isActive: s.seatIndex === data.current_turn_seat,
              lastAction: s.status === "folded" ? "Fold" : s.status === "sitting_out" ? "Sit Out" : s.status === "disconnected" ? "Mất mạng" : "",
              isFolded: s.status === "folded",
              hasAllIn: s.chips === "0" && s.status === "active",
              isHero,
              isBot: s.isBot,
              cards: defaultCards,
            };
          });
        });

        // Dynamic minRaise/maxRaise limits for Hero
        const heroSeat = data.seats.find((s) => heroId && String(s.id) === String(heroId));
        if (heroSeat) {
          const heroStack = parseInt(heroSeat.chips ? heroSeat.chips.toString() : "0");
          const heroCurrentBet = parseInt(heroSeat.current_bet ? heroSeat.current_bet.toString() : "0");

          // Calculate Maximum Effective Stack
          let maxOpponentTotal = 0;
          data.seats.forEach((s) => {
            if (s.status === 'active' && String(s.id) !== String(heroId)) {
              const oppTotal = parseInt(s.chips ? s.chips.toString() : "0") + parseInt(s.current_bet ? s.current_bet.toString() : "0");
              if (oppTotal > maxOpponentTotal) {
                maxOpponentTotal = oppTotal;
              }
            }
          });

          // Cap maxRaise to the effective stack size (Hero can't bet more than what opponents can cover)
          let effectiveMaxRaise = heroStack;
          if (maxOpponentTotal > 0) {
            effectiveMaxRaise = Math.min(heroStack, Math.max(0, maxOpponentTotal - heroCurrentBet));
          }
          setMaxRaise(effectiveMaxRaise);

          const highestBet = data.current_highest_bet ? parseInt(data.current_highest_bet.toString()) : 0;
          const bigBlind = data.big_blind ? parseInt(data.big_blind.toString()) : 100;
          const lastFullRaise = data.last_full_raise_size ? parseInt(data.last_full_raise_size.toString()) : bigBlind;

          const minRequired = highestBet > 0 ? highestBet + lastFullRaise : bigBlind;

          setMinRaise(Math.min(effectiveMaxRaise, minRequired));
          setRaiseAmount((prev) => Math.min(effectiveMaxRaise, Math.max(Math.min(effectiveMaxRaise, minRequired), prev)));
        }
      }
    });

    socket.on("table:private-cards", (data: { pocket_cards: string[] }) => {
      const heroId = currentUserRef.current?.id;
      setPlayers((prev) =>
        prev.map((p) => {
          // FIX: dùng id so sánh trực tiếp thay vì phụ thuộc vào isHero flag
          const isMyCard = p.isHero || (!!heroId && String(p.id) === String(heroId));
          if (isMyCard) {
            return { ...p, isHero: true, cards: data.pocket_cards.map(parseCard) };
          }
          return p;
        })
      );
    });

    socket.on("table:action-recorded", (data: SocketTypes.ActionRecordedPayload) => {
      playActionSound(data.action_type || data.action || "");
      setPot(data.total_pot.toString());

      setPlayers((prev) =>
        prev.map((p) => {
          if (p.seatIndex === data.seat_number) {
            return {
              ...p,
              chips: (data.new_stack ?? data.chipCount ?? 0).toString(),
              lastAction: (data.action_type || data.action || "").toUpperCase(),
              isFolded: (data.action_type || data.action) === "fold",
              hasAllIn: (data.action_type || data.action) === "allin",
            };
          }
          return p;
        })
      );

      const actor = playersRef.current.find(p => p.seatIndex === data.seat_number);
      if (actor) {
        const actionStr = (data.action_type || data.action || "").toUpperCase();
        setHandHistory((prev) => [...prev, `${actor.name}: ${actionStr} (${data.amount ?? 0})`]);
      }
    });

    socket.on("table:turn-change", (data: SocketTypes.TurnChangePayload) => {
      setCurrentTurnSeat(data.seat_number ?? 0);
      setTimerVal(data.time_limit ?? 30);
      // FIX: sync isActive trên players array để ActionBar và SeatV2 hiển thị đúng
      setPlayers((prev) =>
        prev.map((p) => ({
          ...p,
          isActive: p.seatIndex === data.seat_number,
        }))
      );
    });

    socket.on("table:player-disconnected", (data: Record<string, unknown>) => {
      showToast(`Người chơi ở ghế ${data.seat_number} đã mất kết nối mạng.`, "warning");
      setPlayers((prev) =>
        prev.map((p) =>
          p.seatIndex === data.seat_number
            ? { ...p, lastAction: "Mất mạng" }
            : p
        )
      );
    });

    socket.on("table:player-reconnected", (data: Record<string, unknown>) => {
      showToast(`Người chơi ở ghế ${data.seat_number} đã kết nối lại.`, "success");
      setPlayers((prev) =>
        prev.map((p) =>
          p.seatIndex === data.seat_number
            ? { ...p, lastAction: "" }
            : p
        )
      );
    });

    socket.on("table:blinds-escalated", (data: { small_blind: number | string, big_blind: number | string }) => {
      setSmallBlind(data.small_blind.toString());
      setBigBlind(data.big_blind.toString());
      showToast(`Mức mù tự động tăng lên: ${data.small_blind} / ${data.big_blind}`, "info");
      setHandHistory((prev) => [...prev, `Mức blinds tăng lên: ${data.small_blind} / ${data.big_blind}`]);
    });

    socket.on("table:hand-started", (data: SocketTypes.HandStartedPayload) => {
      setCommunityCards([]);
      setIsBombPot(!!data.is_bomb_pot);
      setRitBoard2Cards([]);
      setIsRitVotingActive(false);
      setRitVoters([]);
      setRitVotesYesCount(0);
      setRitVotesNoCount(0);
      setRabbitCards(null);
      if (data.community_cards && data.community_cards.length > 0) {
        setCommunityCards(data.community_cards.map(parseCard));
      }
      setGameStage("preflop");
      setHandHistory((prev) => [...prev, `--- Bắt đầu ván bài mới #${data.hand_id} ---`]);
      setProvablyFair({
        server_seed_hash: data.server_seed_hash ?? "",
        client_seed: data.client_seed ?? "",
      });
      const heroId = currentUserRef.current?.id;
      // FIX: reset cards dựa trên id trực tiếp, không phụ thuộc isHero flag
      setPlayers((prev) =>
        prev.map((p) => {
          const isThisHero = p.isHero || (!!heroId && String(p.id) === String(heroId));
          return {
            ...p,
            isHero: isThisHero,
            lastAction: "",
            isFolded: false,
            hasAllIn: false,
            // Hero: [] để chờ table:private-cards
            // Opponent: 2 bài placeholder "back" (không phải A♠ A♠)
            cards: isThisHero ? [] : [{ suit: "back", rank: "back" }, { suit: "back", rank: "back" }],
          };
        })
      );
    });

    socket.on("table:hand-aborted", (data: Record<string, unknown>) => {
      showToast((data.reason as string) || "Ván bài bị huỷ đột ngột do lỗi hệ thống.", "error");
      setCommunityCards([]);
      setGameStage("waiting");
    });

    socket.on("table:street-advanced", (data: SocketTypes.StreetAdvancedPayload) => {
      // Đồng bộ key trả về từ BE: BE trả về data.game_stage thay vì data.stage
      const stage = data.game_stage || data.stage || "preflop";
      setGameStage(stage);

      // Xử lý chuỗi community_cards an toàn: tách dấu phẩy thành mảng trước khi map()
      if (data.community_cards && typeof data.community_cards === "string") {
        const cardsArray = (data.community_cards as string).split(",").filter((c: string) => c.trim() !== "");
        setCommunityCards(cardsArray.map(parseCard));
      } else if (Array.isArray(data.community_cards)) {
        setCommunityCards(data.community_cards.map(parseCard));
      } else {
        setCommunityCards([]);
      }

      if (data.rit_board2_cards && typeof data.rit_board2_cards === "string") {
        const cardsArray = (data.rit_board2_cards as string).split(",").filter((c: string) => c.trim() !== "");
        setRitBoard2Cards(cardsArray.map(parseCard));
      } else if (Array.isArray(data.rit_board2_cards)) {
        setRitBoard2Cards(data.rit_board2_cards.map(parseCard));
      } else {
        setRitBoard2Cards([]);
      }

      showToast(`Vòng chơi mới: ${stage.toUpperCase()}`, "info");
      setHandHistory((prev) => [...prev, `Bắt đầu vòng cược: ${stage.toUpperCase()}`]);
    });

    socket.on("table:hand-ended", (data: SocketTypes.HandEndedPayload) => {
      setGameStage("showdown");
      setPrevProvablyFair({
        server_seed_hash: "",
        server_seed_plain: data.provably_fair?.server_seed_plain,
        client_seed: data.provably_fair?.client_seed ?? "",
      });

      if (data.rit_board2_cards && typeof data.rit_board2_cards === "string") {
        const cardsArray = (data.rit_board2_cards as string).split(",").filter((c: string) => c.trim() !== "");
        setRitBoard2Cards(cardsArray.map(parseCard));
      } else if (Array.isArray(data.rit_board2_cards)) {
        setRitBoard2Cards(data.rit_board2_cards.map(parseCard));
      }

      if (data.winners) {
        data.winners.forEach((w) => {
          showToast(`${w.username} thắng ${w.win_amount} chips với ${w.hand_name}!`, "success");
          setHandHistory((prev) => [
            ...prev,
            `Thắng cuộc: ${w.username} nhận ${w.win_amount} chips (${w.hand_name})`
          ]);
        });
      }

      // FIX: Reveal ALL players' real cards từ all_hands (ưu tiên hơn winners)
      // Đây là toàn bộ bài của mọi player đã vào showdown, không chỉ winners
      setPlayers((prev) =>
        prev.map((p) => {
          // Ưu tiên all_hands (có đầy đủ bài cho tất cả non-folded players)
          if (data.all_hands) {
            const hand = data.all_hands.find((h) => h.seat_number === p.seatIndex);
            if (hand && hand.pocket_cards && hand.pocket_cards.length > 0) {
              return { ...p, cards: hand.pocket_cards.map(parseCard) };
            }
          }
          // Fallback: winner cards nếu không có all_hands
          if (data.winners) {
            const winner = data.winners.find((w) => w.seat_number === p.seatIndex);
            if (winner && winner.pocket_cards && winner.pocket_cards.length > 0) {
              return { ...p, cards: winner.pocket_cards.map(parseCard) };
            }
          }
          return p;
        })
      );
    });

    socket.on("table:client-seed-updated", (data: Record<string, unknown>) => {
      setProvablyFair((prev) =>
        prev
          ? { ...prev, client_seed: (data.client_seed as string) ?? "" }
          : { server_seed_hash: "", client_seed: (data.client_seed as string) ?? "" }
      );
      showToast(`Hạt giống của bạn đã được cập nhật thành: ${data.client_seed}`, "success");
    });

    socket.on("table:player-busted", (data: Record<string, unknown>) => {
      if (data.user_id === currentUserRef.current?.id) {
        showToast(`Bạn đã hết chip và rời khỏi ghế (Trở thành khán giả). Bạn có thể Buy-in lại để tiếp tục chơi!`, "error");
      } else {
        const actor = playersRef.current.find(p => p.seatIndex === data.seat_number);
        showToast(`Người chơi ${actor ? actor.name : `ở ghế ${data.seat_number}`} đã hết chip và rời bàn!`, "info");
      }

      // Remove player from the seat
      setPlayers((prev) => prev.filter(p => p.seatIndex !== data.seat_number));
    });

    socket.on("table:rit-vote-request", (data: { voters: string[]; time_limit: number }) => {
      setRitVoters(data.voters);
      setRitVotesYesCount(0);
      setRitVotesNoCount(0);
      setIsRitVotingActive(true);
      showToast("Có biểu quyết Run It Twice (All-In Showdown)!", "info");
    });

    socket.on("table:rit-vote-updated", (data: { yes_count: number; no_count: number; total_voters: number }) => {
      setRitVotesYesCount(data.yes_count);
      setRitVotesNoCount(data.no_count);
    });

    socket.on("table:rit-vote-finalized", (data: { is_rit_active: boolean; yes_votes: string[] }) => {
      setIsRitVotingActive(false);
      showToast(data.is_rit_active ? "Run It Twice ĐƯỢC CHẤP NHẬN!" : "Run It Twice BỊ TỪ CHỐI!", data.is_rit_active ? "success" : "warning");
    });

    socket.on("table:rabbit-cards", (data: { user_id: string; rabbit_cards: string[] }) => {
      const cards = data.rabbit_cards.map(parseCard);
      setRabbitCards(cards);
      const user = playersRef.current.find(p => p.id === data.user_id);
      showToast(`${user ? user.name : "Người chơi"} đã săn thỏ: ${data.rabbit_cards.join(', ')}`, "info");
    });

    socket.on("table:player-left-seat", (data: Record<string, unknown>) => {
      // Remove player from the seat
      setPlayers((prev) => prev.filter(p => p.seatIndex !== data.seat_number));
    });

    socket.on("table:player-sat-out", (data: Record<string, unknown>) => {
      if (data.user_id === currentUserRef.current?.id) {
        showToast(`Bạn đã bị tự động chuyển sang trạng thái đi vắng do timeout!`, "warning");
      } else {
        const actor = playersRef.current.find(p => p.seatIndex === data.seat_number);
        showToast(`Người chơi ${actor ? actor.name : `ở ghế ${data.seat_number}`} đã chuyển sang trạng thái đi vắng.`, "info");
      }
      setPlayers((prev) =>
        prev.map((p) =>
          p.seatIndex === data.seat_number
            ? { ...p, lastAction: "Sit Out" }
            : p
        )
      );
    });

    socket.emit("table:get-sit-requests", { room_id: tableId });

    socket.on("table:sit-requests-list", (data: SocketTypes.SitRequestsListPayload) => {
      setSitRequests(data.requests || []);
    });

    socket.on("table:sit-request-submitted", () => {
      showToast("Yêu cầu xin ngồi của bạn đã được gửi và đang chờ chủ phòng duyệt.", "success");
    });

    socket.on("table:sit-approved", (data: Record<string, unknown>) => {
      showToast(`Chúc mừng! Bạn đã được chủ phòng phê duyệt ngồi vào ghế #${data.seat_number}.`, "success");
    });

    socket.on("table:sit-declined", (data: Record<string, unknown>) => {
      showToast((data.reason as string) || "Yêu cầu xin ngồi của bạn đã bị từ chối.", "error");
    });

    socket.on("user_joined_seat", (data: { display_name: string, seat_number: number, chips: number }) => {
      showToast(`${data.display_name} đã ngồi vào ghế #${data.seat_number} với ${data.chips.toLocaleString()} phỉnh.`, "success");
    });

    socket.on("join_request_created", (data: { display_name: string, seat_number: number, buy_in_chips: number }) => {
      const isOwner = currentUserRef.current?.id === ownerIdRef.current;
      if (isOwner) {
        showToast(`Yêu cầu tham gia mới: Ghế #${data.seat_number} từ ${data.display_name} (${data.buy_in_chips.toLocaleString()} chips).`, "info");
      }
    });

    socket.on("table:waiting-for-players", (data: { required: number, current: number, starting: boolean, can_start?: boolean, paused?: boolean }) => {
      if (data.paused) {
        setWaitingMessage({
          text: `Chủ phòng đã tạm dừng ván mới.`,
          starting: false
        });
      } else if (data.can_start) {
        setWaitingMessage({
          text: `Đã đủ người. Tự động chia bài trong giây lát...`,
          starting: true
        });
      } else {
        setWaitingMessage({
          text: `Đang chờ người chơi... (${data.current}/${data.required})`,
          starting: false
        });
      }
    });

    socket.on("table:status-changed", (data: { status: string }) => {
      setRoomStatus(data.status);
      if (data.status === 'paused') {
        showToast("Chủ phòng đã tạm dừng trò chơi (sẽ không chia ván tiếp theo).", "warning");
        if (gameStage === "waiting" || gameStage === "ended") {
          setWaitingMessage({
            text: `Chủ phòng đã tạm dừng ván mới.`,
            starting: false
          });
        }
      } else if (data.status === 'waiting') {
        showToast("Phòng chơi đã được mở lại.", "success");
      }
    });

    // Handle explicit board reset
    socket.on("table:board-reset-state", (data: Record<string, unknown>) => {
      const resetUI = () => {
        setCommunityCards([]);
        setGameStage("waiting");
        setPlayers((prev) =>
          prev.map((p) => ({
            ...p,
            cards: [],
            current_bet: "0",
            lastAction: "",
            hasAllIn: false,
            isFolded: false,
            isDealer: false,
            isSmallBlind: false,
            isBigBlind: false,
            isActive: false,
          }))
        );
      };
      resetUI();
      showToast((data.message as string) || "Bàn đã được reset do không đủ người chơi.", "info");
    });

    socket.on("table:destroyed", (data: Record<string, unknown>) => {
      showToast("Bàn chơi đã bị giải tán do không có người tham gia trong thời gian dài.", "warning");
      setTimeout(() => {
        router.push("/en/poker-game");
      }, 2000);
    });

    socket.on("table:chat-message-received", (data: { user_id: string; username: string; avatar: string; seat_number: number | null; message: string; timestamp: number }) => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `${data.user_id}-${data.timestamp}`,
          sender: data.username,
          text: data.message,
          avatar: data.avatar,
          isSystem: false,
          seatNumber: data.seat_number,
          timestamp: data.timestamp
        },
      ]);
    });

    socket.on("table:chat-history-loaded", (data: { room_id: string; history: any[]; offset: number; limit: number; hasMore: boolean }) => {
      setIsLoadingHistory(false);
      setHasMoreChats(data.hasMore);
      
      const newMsgs = data.history.map(item => ({
        id: `${item.user_id}-${item.timestamp}`,
        sender: item.username,
        text: item.message,
        avatar: item.avatar,
        isSystem: false,
        seatNumber: item.seat_number,
        timestamp: item.timestamp
      }));

      setChatMessages((prev) => {
        const existingIds = new Set(prev.map(m => m.id));
        const filteredNew = newMsgs.filter(m => !existingIds.has(m.id));
        return [...filteredNew, ...prev];
      });
    });

    return () => {
      socket.off("table:chat-message-received");
      socket.off("table:chat-history-loaded");
      socket.off("table:state");
      socket.off("table:private-cards");
      socket.off("table:action-recorded");
      socket.off("table:turn-change");
      socket.off("table:player-disconnected");
      socket.off("table:player-reconnected");
      socket.off("table:blinds-escalated");
      socket.off("table:hand-started");
      socket.off("table:hand-ended");
      socket.off("table:player-busted");
      socket.off("table:player-left-seat");
      socket.off("table:player-sat-out");
      socket.off("table:sit-requests-list");
      socket.off("table:sit-request-submitted");
      socket.off("table:sit-approved");
      socket.off("table:sit-declined");
      socket.off("user_joined_seat");
      socket.off("join_request_created");
      socket.off("table:waiting-for-players");
      socket.off("table:status-changed");
      socket.off("table:board-reset-state");
      socket.off("table:destroyed");
      socket.off("table:client-seed-updated");
      socket.off("error");
    };
  }, [socket, tableId, isConnected, router]);

  // Execute betting actions
  const handleUserAction = (action: string, amount: number = 0) => {
    if (!socket || !isConnected) return;
    socket.emit("table:action", {
      room_id: tableId,
      action_type: action,
      amount,
    });
  };

  // Request Extra Time
  const requestExtraTime = () => {
    if (!socket || !isConnected) return;
    socket.emit("table:extra-time:request", {
      room_id: tableId,
    });
  };

  const submitSitRequest = (seatNumber: number, amount: number, customName?: string) => {
    if (!socket || !isConnected) return;
    socket.emit("table:request-sit", {
      room_id: tableId,
      seat_number: seatNumber,
      amount,
      custom_name: customName,
    });
  };

  const respondSitRequest = (requestId: string, approve: boolean) => {
    if (!socket || !isConnected) return;
    socket.emit("table:respond-sit", {
      room_id: tableId,
      request_id: requestId,
      approve,
    });
  };

  const startGame = () => {
    if (!socket || !isConnected) return;
    socket.emit("table:start-game", {
      room_id: tableId,
    });
  };

  const updateClientSeed = (clientSeed: string) => {
    if (!socket || !isConnected) return;
    socket.emit("table:set-client-seed", {
      room_id: tableId,
      client_seed: clientSeed,
    });
  };

  // Send Chat messages
  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket || !isConnected) return;

    socket.emit("table:chat-message", {
      room_id: tableId,
      message: chatInput,
    });
    setChatInput("");
  };

  const loadMoreChats = () => {
    if (!socket || !isConnected || isLoadingHistory || !hasMoreChats) return;
    setIsLoadingHistory(true);
    const userMsgsCount = chatMessages.filter(m => !m.isSystem).length;
    socket.emit("table:get-chat-history", {
      room_id: tableId,
      offset: userMsgsCount,
      limit: 20,
    });
  };

  // Format chip numbers
  const formatChipsVal = (val: string) => {
    const num = parseInt(val);
    if (isNaN(num)) return "0";
    return num.toLocaleString("vi-VN");
  };

  // REST API Methods for Host Moderation
  const modifyBlinds = async (sb: number) => {
    await httpClient.post(`/api/v1/rooms/${tableId}/config`, {
      small_blind: sb,
    });
    showToast("Đã cập nhật mức blinds của phòng.", "success");
  };

  const kickPlayer = async (seatIndex: number) => {
    await httpClient.post(`/api/v1/rooms/${tableId}/kick`, {
      seat_number: seatIndex,
    });
    showToast("Đã mời người chơi ra khỏi phòng.", "info");
  };

  const forceSitOut = async (seatIndex: number) => {
    await httpClient.post(`/api/v1/rooms/${tableId}/force-sit-out`, {
      seat_number: seatIndex,
    });
    showToast("Đã chuyển người chơi sang chế độ đi vắng.", "info");
  };

  const modifyPlayerStack = async (seatIndex: number, amount: number, action: "add" | "subtract") => {
    await httpClient.post(`/api/v1/rooms/${tableId}/modify-stack`, {
      seat_number: seatIndex,
      amount,
      action,
    });
    showToast("Đã điều chỉnh lượng chip của người chơi.", "success");
  };

  const fetchStats = async () => {
    const res = await httpClient.get(`/api/v1/rooms/${tableId}/stats`);
    return res.data;
  };

  const togglePause = async (paused: boolean) => {
    try {
      await httpClient.post(`/v1/rooms/pause`, { room_id: tableId, paused });
      setRoomStatus(paused ? 'paused' : 'waiting');
      showToast(paused ? "Đã tạm dừng phòng chơi." : "Đã mở lại phòng chơi.", "success");
    } catch (error) {
      console.error("Toggle pause error:", error);
      showToast("Không thể thay đổi trạng thái bàn lúc này", "error");
    }
  };

  const leaveTable = async () => {
    try {
      await httpClient.post('/v1/rooms/leave', { room_id: tableId });
      socket?.disconnect();
      router.push('/poker-lobby');
    } catch (error) {
      console.error("Leave table error:", error);
      showToast("Không thể rời bàn lúc này. Vui lòng thử lại.", "error");
    }
  };

  const currentHighestBet = Math.max(
    ...players.map((p) => parseInt(p.current_bet || "0")),
    0
  );

  return (
    <PokerGameContext.Provider
      value={{
        currentHighestBet,
        soundEnabled,
        setSoundEnabled,
        isFullscreen,
        setIsFullscreen,
        isSettingsOpen,
        setIsSettingsOpen,
        showChat,
        setShowChat,
        showHistory,
        setShowHistory,
        tableBackground,
        setTableBackground,
        cardDeckStyle,
        setCardDeckStyle,
        dealerVoiceVol,
        setDealerVoiceVol,
        soundEffectsVol,
        setSoundEffectsVol,
        muteAllVoice,
        setMuteAllVoice,
        draftTableBg,
        setDraftTableBg,
        draftDeckStyle,
        setDraftDeckStyle,
        draftDealerVoiceVol,
        setDraftDealerVoiceVol,
        draftSoundEffectsVol,
        setDraftSoundEffectsVol,
        draftMuteAllVoice,
        setDraftMuteAllVoice,
        tableName,
        setTableName,
        smallBlind,
        setSmallBlind,
        bigBlind,
        setBigBlind,
        pot,
        setPot,
        minRaise,
        setMinRaise,
        maxRaise,
        setMaxRaise,
        raiseAmount,
        setRaiseAmount,
        waitingMessage,
        gameStage,
        setGameStage,
        players,
        setPlayers,
        chatInput,
        setChatInput,
        chatMessages,
        setChatMessages,
        sendChatMessage,
        handHistory,
        setHandHistory,
        toastMsg,
        showToast,
        handleUserAction,
        requestExtraTime,
        communityCards,
        setCommunityCards,
        isBombPot,
        ritBoard2Cards,
        isRitVotingActive,
        ritVoters,
        ritVotesYesCount,
        ritVotesNoCount,
        voteRit,
        muckOption,
        setMuckOption,
        rabbitCards,
        triggerRabbitHunt,
        tableId,
        tableRef,
        tableScale,
        getFeltStyles,
        formatChipsVal,
        maxTimerVal,
        timerVal,
        ownerId,
        currentTurnSeat,
        dealerSeat,
        smallBlindSeat,
        bigBlindSeat,
        provablyFair,
        prevProvablyFair,
        isConnecting,
        modifyBlinds,
        kickPlayer,
        forceSitOut,
        modifyPlayerStack,
        fetchStats,
        roomStatus,
        setRoomStatus,
        togglePause,
        sitRequests,
        submitSitRequest,
        respondSitRequest,
        startGame,
        updateClientSeed,
        minBuyin,
        maxBuyin,
        maxPlayers,
        leaveTable,
        loadMoreChats,
        hasMoreChats,
        isLoadingHistory,
      }}
    >
      {children}
    </PokerGameContext.Provider>
  );
};

export const usePokerGame = () => {
  const context = useContext(PokerGameContext);
  if (!context) {
    throw new Error("usePokerGame must be used within a PokerGameProvider");
  }
  return context;
};

