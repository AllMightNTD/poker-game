export interface Card {
  suit: "H" | "D" | "S" | "C"; // Hearts, Diamonds, Spades, Clubs
  rank: string;
}

export interface Player {
  seatIndex: number;
  id: string;
  name: string;
  chips: string;
  avatar?: string;
  isHero: boolean;
  isActive: boolean;
  isFolded: boolean;
  lastAction?: string;
  cards?: Card[];
  isDealer?: boolean;
  isSmallBlind?: boolean;
  isBigBlind?: boolean;
  hasAllIn?: boolean;
  current_bet?: string;
  has_used_extra_time?: boolean;
}

export interface ChatMessage {
  sender: string;
  text: string;
  isSystem?: boolean;
}

export type GameStage = "Đợi người chơi..." | "Pre-flop" | "Flop" | "Turn" | "River" | "showdown";

export type TableBackgroundTheme = "classic_green" | "royal_blue" | "ruby_red" | "shadow_black";

export type CardDeckStyleTheme = "classic" | "modern" | "cyberpunk";
