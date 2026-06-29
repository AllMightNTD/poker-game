"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useCurrentUser } from "@/core/providers/user-provider";
import { useParams } from "next/navigation";
import { Card, Player, ChatMessage, TableBackgroundTheme, CardDeckStyleTheme } from "../types";
import { useSocket } from "@/core/providers/SocketProvider";
import { httpClient } from "@/core/api/http-client";

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
  gameStage: "preflop" | "flop" | "turn" | "river" | "showdown" | "ended";
  setGameStage: React.Dispatch<React.SetStateAction<"preflop" | "flop" | "turn" | "river" | "showdown" | "ended">>;
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
  showToast: (text: string, type?: "success" | "error" | "info" | "warning") => void;
  handleUserAction: (action: string, amount?: number) => void;
  requestExtraTime: () => void;
  communityCards: Card[];
  setCommunityCards: React.Dispatch<React.SetStateAction<Card[]>>;
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

  // Host Mod Actions
  modifyBlinds: (sb: number) => Promise<void>;
  kickPlayer: (seatIndex: number) => Promise<void>;
  forceSitOut: (seatIndex: number) => Promise<void>;
  modifyPlayerStack: (seatIndex: number, amount: number, action: "add" | "subtract") => Promise<void>;
  fetchStats: () => Promise<any>;
}

const PokerGameContext = createContext<PokerGameContextProps | undefined>(undefined);

export const PokerGameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const params = useParams();
  const { currentUser } = useCurrentUser();
  const { socket, isConnected } = useSocket();
  const tableId = params?.id as string;

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
  const [smallBlind, setSmallBlind] = useState("50");
  const [bigBlind, setBigBlind] = useState("100");
  const [pot, setPot] = useState("0");
  const [minRaise, setMinRaise] = useState(200);
  const [maxRaise, setMaxRaise] = useState(1000);
  const [raiseAmount, setRaiseAmount] = useState(200);
  const [gameStage, setGameStage] = useState<"preflop" | "flop" | "turn" | "river" | "showdown" | "ended">("ended");
  const [players, setPlayers] = useState<Player[]>([]);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [ownerId, setOwnerId] = useState("");
  const [currentTurnSeat, setCurrentTurnSeat] = useState(0);
  const [dealerSeat, setDealerSeat] = useState(1);
  const [smallBlindSeat, setSmallBlindSeat] = useState(0);
  const [bigBlindSeat, setBigBlindSeat] = useState(0);

  // Provably Fair States
  const [provablyFair, setProvablyFair] = useState<ProvablyFairData | null>(null);
  const [prevProvablyFair, setPrevProvablyFair] = useState<ProvablyFairData | null>(null);

  // Hand history log
  const [handHistory, setHandHistory] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Disconnect & network status
  const [isConnecting, setIsConnecting] = useState(false);

  // Timers
  const maxTimerVal = 30;
  const [timerVal, setTimerVal] = useState(0);

  // Toast State
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" | "info" | "warning" } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Helper for dynamic felt styles
  const getFeltStyles = (theme: TableBackgroundTheme) => {
    switch (theme) {
      case "royal_blue":
        return { gradient: "from-blue-950/95 via-blue-900/90 to-blue-950/95", line: "border-blue-500/15" };
      case "ruby_red":
        return { gradient: "from-rose-950/95 via-rose-900/90 to-rose-950/95", line: "border-rose-500/15" };
      case "shadow_black":
        return { gradient: "from-slate-950/95 via-slate-900/90 to-slate-950/95", line: "border-slate-700/25" };
      case "classic_green":
      default:
        return { gradient: "from-emerald-950/95 via-emerald-900/90 to-emerald-950/95", line: "border-emerald-500/10" };
    }
  };

  // Parse card string from BE into card object
  const parseCard = (cardStr: string): Card => {
    if (!cardStr || cardStr.length < 2) return { suit: "S", rank: "A" };
    const suitChar = cardStr.slice(-1).toUpperCase();
    const rankStr = cardStr.slice(0, -1).toUpperCase();
    return { suit: suitChar as any, rank: rankStr };
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
      audio.play().catch(() => {});
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
    if (!socket || !tableId) return;

    // Join room
    socket.emit("table:subscribe", { room_id: tableId });

    socket.on("table:state", (data: any) => {
      setTableName(data.room_name || "Bàn Poker");
      setGameStage(data.game_stage);
      setPot(data.total_pot.toString());
      setCommunityCards(data.community_cards ? data.community_cards.map(parseCard) : []);
      setDealerSeat(data.dealer_seat);
      setSmallBlindSeat(data.small_blind_seat);
      setBigBlindSeat(data.big_blind_seat);
      setCurrentTurnSeat(data.current_turn_seat);
      setTimerVal(data.remaining_time || 0);
      setOwnerId(data.owner_id || "");

      // Sync players list
      if (data.seats) {
        const syncedPlayers = data.seats.map((s: any) => {
          const isHero = s.id === currentUser?.id;
          return {
            seatIndex: s.seatIndex,
            id: s.id,
            name: s.name,
            avatar: s.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${s.name}`,
            chips: s.chips,
            current_bet: s.current_bet || "0",
            has_used_extra_time: s.has_used_extra_time,
            isDealer: s.seatIndex === data.dealer_seat,
            isSmallBlind: s.seatIndex === data.small_blind_seat,
            isBigBlind: s.seatIndex === data.big_blind_seat,
            isActive: s.seatIndex === data.current_turn_seat,
            lastAction: s.status === "folded" ? "Fold" : s.status === "sitting_out" ? "Sit Out" : s.status === "disconnected" ? "Mất mạng" : "",
            isFolded: s.status === "folded",
            hasAllIn: s.chips === "0" && s.status === "active",
            isHero,
            cards: isHero ? [] : undefined, // Pocket cards filled by private event
          };
        });
        setPlayers(syncedPlayers);
      }
    });

    socket.on("table:private-cards", (data: { pocket_cards: string[] }) => {
      setPlayers((prev) =>
        prev.map((p) =>
          p.isHero
            ? { ...p, cards: data.pocket_cards.map(parseCard) }
            : p
        )
      );
    });

    socket.on("table:action-recorded", (data: any) => {
      playActionSound(data.action_type);
      setPot(data.total_pot.toString());

      setPlayers((prev) =>
        prev.map((p) => {
          if (p.seatIndex === data.seat_number) {
            return {
              ...p,
              chips: data.new_stack.toString(),
              lastAction: data.action_type.toUpperCase(),
              isFolded: data.action_type === "fold",
              hasAllIn: data.action_type === "allin",
            };
          }
          return p;
        })
      );

      const actor = players.find(p => p.seatIndex === data.seat_number);
      if (actor) {
        setHandHistory((prev) => [...prev, `${actor.name}: ${data.action_type.toUpperCase()} (${data.amount})`]);
      }
    });

    socket.on("table:turn-change", (data: any) => {
      setCurrentTurnSeat(data.seat_number);
      setTimerVal(data.time_limit || 30);
      
      // Update min/max raise values dynamically based on current game turn limits
      const highestBet = parseInt(pot); // Approximation
      setMinRaise(data.seat_number === currentTurnSeat ? highestBet * 2 : 200);
    });

    socket.on("table:player-disconnected", (data: any) => {
      showToast(`Người chơi ở ghế ${data.seat_number} đã mất kết nối mạng.`, "warning");
      setPlayers((prev) =>
        prev.map((p) =>
          p.seatIndex === data.seat_number
            ? { ...p, lastAction: "Mất mạng" }
            : p
        )
      );
    });

    socket.on("table:player-reconnected", (data: any) => {
      showToast(`Người chơi ở ghế ${data.seat_number} đã kết nối lại.`, "success");
      setPlayers((prev) =>
        prev.map((p) =>
          p.seatIndex === data.seat_number
            ? { ...p, lastAction: "" }
            : p
        )
      );
    });

    socket.on("table:blinds-escalated", (data: any) => {
      setSmallBlind(data.small_blind.toString());
      setBigBlind(data.big_blind.toString());
      showToast(`Mức mù tự động tăng lên: ${data.small_blind} / ${data.big_blind}`, "info");
      setHandHistory((prev) => [...prev, `Mức blinds tăng lên: ${data.small_blind} / ${data.big_blind}`]);
    });

    socket.on("table:hand-started", (data: any) => {
      setCommunityCards([]);
      setGameStage("preflop");
      setHandHistory((prev) => [...prev, `--- Bắt đầu ván bài mới #${data.hand_id} ---`]);
      setProvablyFair({
        server_seed_hash: data.server_seed_hash,
        client_seed: data.client_seed,
      });
      // Clear action flags
      setPlayers((prev) =>
        prev.map((p) => ({
          ...p,
          lastAction: "",
          isFolded: false,
          hasAllIn: false,
        }))
      );
    });

    socket.on("table:hand-ended", (data: any) => {
      setGameStage("showdown");
      setPrevProvablyFair({
        server_seed_hash: "",
        server_seed_plain: data.provably_fair?.server_seed_plain,
        client_seed: data.provably_fair?.client_seed,
      });

      if (data.winners) {
        data.winners.forEach((w: any) => {
          showToast(`${w.username} thắng ${w.win_amount} chips với ${w.hand_name}!`, "success");
          setHandHistory((prev) => [
            ...prev,
            `Thắng cuộc: ${w.username} nhận ${w.win_amount} chips (${w.hand_name})`
          ]);
        });
      }
    });

    socket.on("table:rebuy-countdown", (data: any) => {
      if (data.user_id === currentUser?.id) {
        showToast(`Bạn có ${data.time_limit} giây để nạp thêm chip (Re-buy) hoặc sẽ bị kick khỏi bàn!`, "warning");
      } else {
        const actor = players.find(p => p.seatIndex === data.seat_number);
        showToast(`Người chơi ${actor ? actor.name : `ở ghế ${data.seat_number}`} đang có ${data.time_limit} giây để Re-buy.`, "info");
      }
    });

    socket.on("table:player-sat-out", (data: any) => {
      if (data.user_id === currentUser?.id) {
        showToast(`Bạn đã bị tự động chuyển sang trạng thái đi vắng do timeout!`, "warning");
      } else {
        const actor = players.find(p => p.seatIndex === data.seat_number);
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

    return () => {
      socket.off("table:state");
      socket.off("table:private-cards");
      socket.off("table:action-recorded");
      socket.off("table:turn-change");
      socket.off("table:player-disconnected");
      socket.off("table:player-reconnected");
      socket.off("table:blinds-escalated");
      socket.off("table:hand-started");
      socket.off("table:hand-ended");
      socket.off("table:rebuy-countdown");
      socket.off("table:player-sat-out");
    };
  }, [socket, tableId, currentUser, players]);

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

  // Send Chat messages
  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        sender: currentUser?.name || currentUser?.username || "Bạn",
        text: chatInput,
        isSystem: false,
      },
    ]);
    setChatInput("");
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

