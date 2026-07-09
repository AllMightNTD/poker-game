import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PokerHandCompletedEvent } from './audit.service';
import { PokerTable } from '../entities/poker_table.entity';

@Injectable()
export class TournamentService {
  private readonly logger = new Logger(TournamentService.name);

  @OnEvent('poker.hand.completed')
  async handleTournamentHandCompleted(event: PokerHandCompletedEvent) {
    try {
      const table = await PokerTable.findOne({ where: { id: event.roomId } });
      if (!table || table.mode !== 'TOURNAMENT') {
        return; // Bỏ qua nếu không phải giải đấu
      }

      this.logger.log(
        `[TOURNAMENT EVENT] Processing tournament hand completion for table ${event.roomId}, hand ${event.handId}`,
      );

      // Log chi tiết giải đấu hoặc thực hiện tăng blind level tiếp theo, kiểm tra số người chơi còn lại
      // Đây là nơi mở rộng tích hợp sau này cho Tournament engine.
    } catch (err) {
      this.logger.error(`Lỗi xử lý Tournament Hand Completed: ${err.message}`);
    }
  }
}
