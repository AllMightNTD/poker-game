export const getSeatPositions = (maxPlayers: number, heroSeatNumber?: number) => {
  const positions = [];
  
  // Calculate which index is the true "bottom" (6 o'clock)
  const bottomIndex = Math.floor(maxPlayers / 2);
  let offset = 0;
  
  if (heroSeatNumber && heroSeatNumber > 0) {
    const heroIndex = heroSeatNumber - 1;
    offset = bottomIndex - heroIndex;
  }

  for (let i = 0; i < maxPlayers; i++) {
    const visualIndex = (i + offset + maxPlayers) % maxPlayers;
    const angle = -Math.PI / 2 + (visualIndex * 2 * Math.PI) / maxPlayers;

    let left = 50 + 56 * Math.cos(angle);
    let top = 50 + 64 * Math.sin(angle);

    positions.push({ top, left });
  }
  return positions;
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
  customizeTitle: "TÙY CHỈNH MỨC CƯỢC",
  waitingFold: "Đã bỏ bài — Chờ ván tiếp theo...",
  waitingTurn: (name?: string) => (name ? `Đang chờ lượt của ${name}...` : "Đang chờ ván đấu..."),
  startGame: "Bắt đầu ván đấu",
} as const;


export const DEFAULT_AUTO_DISMISS_MS = 4500;

export const BANNER_TRANSITION = { duration: 0.25, ease: "easeOut" as const };

export const WINNER_LABELS = {
  wonByFold: "THẮNG DO ĐỐI THỦ BỎ BÀI",
  winTitle: (amount: string) => `CHIẾN THẮNG (+${amount})`,
  splitSuffix: "— chia đều",
  defaultPot: "Ván bài",
} as const;
