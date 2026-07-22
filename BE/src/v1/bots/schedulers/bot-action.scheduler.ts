import { Injectable, Logger } from '@nestjs/common';
import { BotDifficulty } from '../dto/bot-config.dto';

@Injectable()
export class BotActionScheduler {
  private readonly logger = new Logger(BotActionScheduler.name);
  private readonly activeTimers = new Map<string, NodeJS.Timeout>();

  /**
   * Tính toán thời gian trễ suy nghĩ mô phỏng con người (tính bằng ms)
   */
  calculateHumanThinkingDelay(
    difficulty: BotDifficulty,
    isComplexDecision: boolean = false,
  ): number {
    // 1. Base ranges per difficulty
    let minMs = 1500;
    let maxMs = 3500;

    if (difficulty === BotDifficulty.EASY) {
      minMs = 1000;
      maxMs = 2500;
    } else if (difficulty === BotDifficulty.HARD) {
      minMs = 2000;
      maxMs = 5000;
    }

    // 2. Snap-call chance (5% chance to act super fast ~500ms - 900ms)
    if (Math.random() < 0.05) {
      return 500 + Math.floor(Math.random() * 400);
    }

    // 3. Tanking chance (7% chance to think very long ~7000ms - 10000ms)
    if (isComplexDecision || Math.random() < 0.07) {
      return 7000 + Math.floor(Math.random() * 3000);
    }

    // 4. Standard Gaussian-like random delay
    const delay = minMs + Math.random() * (maxMs - minMs);
    return Math.floor(delay);
  }

  /**
   * Đặt lịch thực thi hành động Bot với khả năng hủy timer an toàn
   */
  scheduleAction(
    roomId: string,
    seatNumber: number,
    delayMs: number,
    actionFn: () => Promise<void>,
  ) {
    const timerKey = `${roomId}:${seatNumber}`;
    this.cancelTimer(timerKey);

    this.logger.log(
      `[Scheduler] Room ${roomId} Seat ${seatNumber} scheduled action in ${delayMs}ms`,
    );

    const timer = setTimeout(async () => {
      this.activeTimers.delete(timerKey);
      try {
        await actionFn();
      } catch (err: any) {
        this.logger.error(
          `[Scheduler] Execution error for ${timerKey}: ${err.message}`,
        );
      }
    }, delayMs);

    this.activeTimers.set(timerKey, timer);
  }

  /**
   * Hủy bỏ timer của một ghế cụ thể hoặc cả phòng
   */
  cancelTimer(timerKey: string) {
    if (this.activeTimers.has(timerKey)) {
      clearTimeout(this.activeTimers.get(timerKey)!);
      this.activeTimers.delete(timerKey);
    }
  }

  cancelAllRoomTimers(roomId: string) {
    for (const key of this.activeTimers.keys()) {
      if (key.startsWith(`${roomId}:`)) {
        this.cancelTimer(key);
      }
    }
  }
}
