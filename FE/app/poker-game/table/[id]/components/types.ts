export interface Card {
  suit: "H" | "D" | "S" | "C" | "back"; // Hearts, Diamonds, Spades, Clubs, back=placeholder
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
  isBot?: boolean;
}

export interface ChatMessage {
  sender: string;
  text: string;
  isSystem?: boolean;
}

export type TableBackgroundTheme = "classic_green" | "royal_blue" | "ruby_red" | "shadow_black";

export type CardDeckStyleTheme = "classic" | "modern" | "cyberpunk";

/**
 * Shared types for the action-bar module.
 * Keep these in sync with the shapes returned by `usePokerGame`.
 */

export interface PokerPlayer {
  id: string;
  name: string;
  isHero?: boolean;
  isActive?: boolean;
  isFolded?: boolean;
  current_bet?: string;
  /** Remaining chips the player can still act with. Optional because not
   * every consumer of `usePokerGame` populates it, but when present it is
   * used to correctly cap call/raise amounts to a real all-in. */
  stack?: string | number;
}

export type GameStage = "waiting" | "preflop" | "flop" | "turn" | "river" | "showdown" | string;

export interface QuickBetOption {
  label: string;
  val: number;
}

/** The player-facing action sent to the table/server. */
export type PokerAction = "fold" | "check" | "call" | "raise";

export interface RaiseControllerParams {
  minRaise: number;
  maxRaise: number;
  raiseAmount: number;
  setRaiseAmount: (val: number) => void;
  potNum: number;
  callAmount: number;
}

export interface RaiseControllerResult {
  isRaiseMode: boolean;
  openRaiseMode: () => void;
  closeRaiseMode: () => void;
  inputRaw: string;
  handleInputChange: (raw: string) => void;
  handleSlider: (val: number) => void;
  setPreset: (val: number) => void;
  step: number;
  isAtMin: boolean;
  isAtMax: boolean;
  isAllIn: boolean;
  /** True when the hero's stack is too short to make a legal min-raise —
   * standard poker clients only allow shoving all-in in this case. */
  forcedAllIn: boolean;
  potPercent: number | null;
  quickBets: QuickBetOption[];
}

/**
 * Shared types for the winner-banner module.
 */

/** Label of the pot a winner took, e.g. "Main Pot", "Side Pot 1". Left
 * undefined when the hand only ever had a single pot. */
export type PotLabel = string;

export interface WinnerData {
  userId: string;
  playerName: string;
  seatNumber: number;
  amountWon: number;
  netGainLoss?: number;
  handName?: string;
  isBigWin: boolean;
  potLabel?: string;
}

export interface WinnerBannerProps {
  /**
   * Fallback headline hand name shown when every winner shares the same
   * hand (the common single-pot showdown case). Ignored per-row once a
   * winner supplies their own `handName`.
   */
  handName: string;
  winners: WinnerData[];
  /** True when the pot was awarded because every other player folded —
   * i.e. there was no showdown, so no hand name should be displayed. */
  wonByFold?: boolean;
  /** Called once the banner has fully finished its exit animation. */
  onDismiss?: () => void;
  /** Auto-dismiss after this many ms. Pass 0/undefined to disable. */
  autoDismissMs?: number;
}

export interface PotGroup {
  potLabel: PotLabel | undefined;
  winners: WinnerData[];
  potTotal: number;
  isSplit: boolean;
}


export type AnimationStepType =
  | "HIGHLIGHT_WINNERS"
  | "COLLECT_POT_TO_CENTER"
  | "FLY_CHIPS_TO_WINNERS"
  | "SHOW_BANNER"
  | "NEXT_HAND_COUNTDOWN";

export interface AnimationStep {
  type: AnimationStepType;
  duration: number;
  payload: any;
}

export interface WinnerTimelinePayload {
  winners: WinnerData[];
  totalPot: number;
  handName: string;
}
