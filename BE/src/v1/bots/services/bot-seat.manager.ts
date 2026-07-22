import { Injectable, Logger } from '@nestjs/common';
import { PokerStateService } from '../../services/poker-state.service';

@Injectable()
export class BotSeatManager {
  private readonly logger = new Logger(BotSeatManager.name);

  constructor(private readonly stateService: PokerStateService) {}

  /**
   * Tìm ghế trống đầu tiên trong bàn
   */
  async findAvailableSeat(
    roomId: string,
    maxSeats: number = 9,
  ): Promise<number | null> {
    const seats = await this.stateService.getAllSeats(roomId);
    const occupiedSeats = new Set(seats.map((s) => s.seat_number));

    for (let i = 1; i <= maxSeats; i++) {
      if (!occupiedSeats.has(i)) {
        return i;
      }
    }
    return null;
  }

  /**
   * Tự động đặt trạng thái Ready cho tất cả các Bot rảnh rỗi trong phòng
   */
  async autoReadyBots(roomId: string) {
    const seats = await this.stateService.getAllSeats(roomId);
    for (const seat of seats) {
      if (
        seat.is_bot === '1' &&
        (seat.status === 'sitting' ||
          seat.status === 'idle' ||
          seat.status === 'ready')
      ) {
        await this.stateService.setSeat(roomId, seat.seat_number, {
          status: 'waiting_for_next_hand',
        });
        this.logger.log(
          `[BotSeatManager] Auto-readied bot ${seat.username} (Seat ${seat.seat_number}) in Room ${roomId}`,
        );
      }
    }
  }

  /**
   * Tự động Nạp chip (Rebuy) khi Bot bị cạn stack (< Big Blind)
   */
  async autoRebuyBots(roomId: string, defaultRebuyChips: number = 100000) {
    const table = await this.stateService.getTableState(roomId);
    if (!table) return;

    const bigBlind = parseInt(table.big_blind || '100', 10);
    const seats = await this.stateService.getAllSeats(roomId);

    for (const seat of seats) {
      if (seat.is_bot === '1') {
        const stack = parseInt(String(seat.stack || '0'), 10);
        if (stack < bigBlind) {
          await this.stateService.setSeat(roomId, seat.seat_number, {
            stack: String(defaultRebuyChips),
          });
          this.logger.log(
            `[BotSeatManager] Auto-rebought bot ${seat.username} to ${defaultRebuyChips} chips in Room ${roomId}`,
          );
        }
      }
    }
  }
}
