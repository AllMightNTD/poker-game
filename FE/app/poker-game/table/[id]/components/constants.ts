export const getSeatPositions = (maxPlayers: number, heroSeatNumber?: number, isVertical?: boolean) => {
  // Hand-tuned coordinates for 6-max table (symmetric hexagon)
  const horizontalLayout6 = [
    { top: 86, left: 50 },   // Hero (Bottom-Center)
    { top: 76, left: 16 },   // Bottom-Left
    { top: 38, left: 12 },   // Top-Left
    { top: 12, left: 50 },   // Top-Center
    { top: 38, left: 88 },   // Top-Right
    { top: 76, left: 84 },   // Bottom-Right
  ];

  const verticalLayout6 = [
    { top: 88, left: 50 },   // Hero
    { top: 72, left: 14 },
    { top: 30, left: 14 },
    { top: 10, left: 50 },
    { top: 30, left: 86 },
    { top: 72, left: 86 },
  ];

  // Hand-tuned coordinates for 9-max table (symmetric nonagon)
  const horizontalLayout9 = [
    { top: 86, left: 50 },   // Hero (Bottom-Center)
    { top: 76, left: 24 },   // Bottom-Left
    { top: 52, left: 10 },   // Left-Lower
    { top: 26, left: 18 },   // Left-Upper
    { top: 12, left: 36 },   // Top-Left
    { top: 12, left: 64 },   // Top-Right
    { top: 26, left: 82 },   // Right-Upper
    { top: 52, left: 90 },   // Right-Lower
    { top: 76, left: 76 },   // Bottom-Right
  ];

  const verticalLayout9 = [
    { top: 90, left: 50 },   // Hero
    { top: 76, left: 16 },
    { top: 54, left: 10 },
    { top: 32, left: 16 },
    { top: 12, left: 32 },
    { top: 12, left: 68 },
    { top: 32, left: 84 },
    { top: 54, left: 90 },
    { top: 76, left: 84 },
  ];

  const use9Max = maxPlayers > 6;
  const customLayout = use9Max 
    ? (isVertical ? verticalLayout9 : horizontalLayout9)
    : (isVertical ? verticalLayout6 : horizontalLayout6);

  const numSeats = use9Max ? 9 : 6;

  if (heroSeatNumber && heroSeatNumber > 0) {
    const heroIndex = heroSeatNumber - 1;
    const result = [];
    for (let i = 0; i < numSeats; i++) {
      const dist = (i - heroIndex + numSeats) % numSeats;
      result.push(customLayout[dist]);
    }
    return result;
  } else {
    // Spectator default layout: return coordinates sequentially
    return customLayout;
  }
};

export const LOCALE = "vi-VN";

export const THOUSAND = 1_000;
export const MILLION = 1_000_000;

export const RAISE_PANEL_TRANSITION = { duration: 0.15, ease: "easeOut" as const };

export const LABELS = {
  fold: "FOLD",
  check: "CHECK",
  call: "CALL",
  callAllIn: "CALL ALL-IN",
  bet: "BET",
  raise: "RAISE",
  allIn: "ALL-IN",
  min: "MIN",
  halfPot: "1/2 POT",
  pot: "POT",
  customizeTitle: "CUSTOMIZE BETS",
  waitingFold: "Folded — Waiting for next hand...",
  waitingTurn: (name?: string) => (name ? `Đang chờ lượt của ${name}...` : "Waiting for hand..."),
  startGame: "Start Hand",
} as const;


export const DEFAULT_AUTO_DISMISS_MS = 4500;

export const BANNER_TRANSITION = { duration: 0.25, ease: "easeOut" as const };

export const WINNER_LABELS = {
  wonByFold: "WON - OPPONENTS FOLDED",
  winTitle: (amount: string) => `CHIẾN THẮNG (+${amount})`,
  splitSuffix: "— split",
  defaultPot: "Hand",
} as const;
