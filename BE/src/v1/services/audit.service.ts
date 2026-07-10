import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditLog } from '../entities/audit_log.entity';

export interface PokerHandCompletedEvent {
  roomId: string;
  handId: string;
  totalPot: number;
  rakeAmount: string;
  winners: {
    user_id: string;
    seat_number: number;
    username: string;
    win_amount: number;
    hand_name: string;
  }[];
  userRakeShares?: {
    amount: number;
    userId: string;
    rakePaid: string;
  }[];
  reconciliationSuccess: boolean;
  reconciliationDetails?: any;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  @OnEvent('poker.hand.completed')
  async handleHandCompleted(event: PokerHandCompletedEvent) {
    this.logger.log(
      `[AUDIT EVENT] Hand ${event.handId} completed on table ${event.roomId}. Total Pot: ${event.totalPot}, Rake: ${event.rakeAmount}. Reconciliation Success: ${event.reconciliationSuccess}`,
    );

    try {
      // Ghi Audit Log cho kết quả ván đấu
      const audit = new AuditLog();
      audit.event_type = 'HAND_COMPLETED';
      audit.room_id = event.roomId;
      audit.description = `Ván bài ${event.handId} kết thúc. Tổng Pot: ${event.totalPot} chips. Rake: ${event.rakeAmount} chips. Đối soát: ${event.reconciliationSuccess ? 'Thành công' : 'Thất bại'}`;
      audit.level = event.reconciliationSuccess ? 'INFO' : 'ERROR';
      audit.metadata = {
        handId: event.handId,
        totalPot: event.totalPot.toString(),
        rakeAmount: event.rakeAmount,
        winners: event.winners,
        reconciliationSuccess: event.reconciliationSuccess,
        reconciliationDetails: event.reconciliationDetails,
      };
      await audit.save();
    } catch (err) {
      this.logger.error(`Lỗi ghi AuditLog cho Hand Completed: ${err.message}`);
    }
  }
}
