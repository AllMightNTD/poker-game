import { useState, useEffect } from "react";
import { Player } from "../types";

export function useTimer(
  players: Player[],
  maxTimerVal: number,
  simulateNextTurn: () => void,
  showToast: (text: string, type: "success" | "error" | "info") => void
) {
  const [timerVal, setTimerVal] = useState(15);

  useEffect(() => {
    const activePlayer = players.find((p) => p.isActive);
    if (!activePlayer) return;

    const interval = setInterval(() => {
      setTimerVal((t) => {
        if (t <= 1) {
          showToast(`Hết thời gian! Tự động Check.`, "info");
          simulateNextTurn();
          return maxTimerVal;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [players, maxTimerVal, simulateNextTurn, showToast]);

  return { timerVal, setTimerVal };
}
