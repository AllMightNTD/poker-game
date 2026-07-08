export const getSeatPositions = (maxPlayers: number, heroSeatNumber?: number) => {
  // If maxPlayers is 6, we use the custom hand-tuned layout matching poker_room.png 98%
  if (maxPlayers === 6) {
    const customLayout = [
      { top: 12, left: 80 },   // Pos 1: Top-Right
      { top: 50, left: 94 },   // Pos 2: Right
      { top: 84, left: 78 },   // Pos 3: Bottom-Right
      { top: 92, left: 50 },   // Pos 4: Bottom-Center (Hero)
      { top: 84, left: 22 },   // Pos 5: Bottom-Left
      { top: 50, left: 6 },    // Pos 6: Left
      { top: 12, left: 20 },   // Pos 7: Top-Left
    ];
    
    // If there is a Hero, we rotate so Hero is at Bottom-Center (Pos 4, index 3 of customLayout)
    if (heroSeatNumber && heroSeatNumber > 0) {
      const heroIndex = heroSeatNumber - 1;
      const result = [];
      for (let i = 0; i < 6; i++) {
        const dist = (i - heroIndex + 6) % 6;
        if (dist === 0) result.push(customLayout[3]); // Hero -> Pos 4
        else if (dist === 1) result.push(customLayout[4]); // Pos 5
        else if (dist === 2) result.push(customLayout[5]); // Pos 6
        else if (dist === 3) result.push(customLayout[6]); // Pos 7
        else if (dist === 4) result.push(customLayout[1]); // Pos 2
        else result.push(customLayout[2]); // Pos 3
      }
      return result;
    } else {
      // Spectator default layout: fill Bottom-Center and distribute other seats
      return [
        customLayout[6], // Seat 1 -> Top-Left
        customLayout[5], // Seat 2 -> Left
        customLayout[4], // Seat 3 -> Bottom-Left
        customLayout[3], // Seat 4 -> Bottom-Center
        customLayout[2], // Seat 5 -> Bottom-Right
        customLayout[1], // Seat 6 -> Right
      ];
    }
  }

  // Fallback for other player sizes (e.g. 8, 9, 2)
  const positions = [];
  const bottomIndex = Math.floor(maxPlayers / 2);
  let offset = 0;
  
  if (heroSeatNumber && heroSeatNumber > 0) {
    const heroIndex = heroSeatNumber - 1;
    offset = bottomIndex - heroIndex;
  }

  for (let i = 0; i < maxPlayers; i++) {
    const visualIndex = (i + offset + maxPlayers) % maxPlayers;
    let angle = -Math.PI / 2 + (visualIndex * 2 * Math.PI) / maxPlayers;

    // Shift angle slightly if too close to dealer at the top
    const diffToTop = Math.abs(angle + Math.PI / 2);
    if (diffToTop < 0.2) {
      angle += 0.3;
    }

    const left = 50 + 44 * Math.cos(angle);
    const top = 54 + 36 * Math.sin(angle); // shift down to avoid dealer

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
