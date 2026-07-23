export const getSeatPositions = (maxPlayers: number, heroSeatNumber?: number, isVertical?: boolean) => {
  // Đảm bảo số lượng ghế tối thiểu là 2, mặc định là 6
  const numSeats = Math.max(2, maxPlayers || 6);

  // Dynamic radius (Rx, Ry) for the ellipse based on screen orientation
  const rx = isVertical ? 38 : 42; 
  const ry = isVertical ? 42 : 36;

  const positions = [];
  for (let i = 0; i < numSeats; i++) {
    // Offset by Pi/2 (90 degrees) so seat 0 is at Bottom-Center
    // Web coordinate system: +y goes down, so sin(90) = 1 (bottom)
    const angle = (Math.PI / 2) + (i * 2 * Math.PI) / numSeats;
    
    const left = 50 + rx * Math.cos(angle);
    const top = 50 + ry * Math.sin(angle);
    
    positions.push({ top, left });
  }

  // Nếu có Hero Seat, xoay mảng sao cho vị trí của Hero luôn nằm ở Bottom-Center (vị trí 0)
  if (heroSeatNumber && heroSeatNumber > 0) {
    const heroIndex = heroSeatNumber - 1;
    const result = [];
    for (let i = 0; i < numSeats; i++) {
      const dist = (i - heroIndex + numSeats) % numSeats;
      result.push(positions[dist]);
    }
    return result;
  } else {
    // Dành cho Spectator
    return positions;
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
