import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditLog } from '../entities/audit_log.entity';

export interface PokerWalletAdjustEvent {
  userId: string;
  amount: number; // Số chips thay đổi (dương là cộng, âm là trừ)
  type: 'buyin' | 'refund' | 'win' | 'free_chips';
  referenceId: string;
}

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  @OnEvent('poker.wallet.adjust')
  async handleWalletAdjust(event: PokerWalletAdjustEvent) {
    this.logger.log(
      `[WALLET EVENT] User ${event.userId} adjusted by ${event.amount} chips (Type: ${event.type}, Ref: ${event.referenceId})`,
    );

    try {
      // Ghi vết kiểm toán (Audit Log) cho sự kiện thay đổi số dư ví
      const audit = new AuditLog();
      audit.event_type = 'WALLET_UPDATE';
      audit.user_id = event.userId;
      audit.description = `Điều chỉnh số dư ví: ${event.amount > 0 ? '+' : ''}${event.amount} chips do ${event.type}`;
      audit.level = 'INFO';
      audit.metadata = {
        amount: event.amount.toString(),
        type: event.type,
        referenceId: event.referenceId,
      };
      await audit.save();
    } catch (err) {
      this.logger.error(`Lỗi ghi AuditLog cho Wallet Adjust: ${err.message}`);
    }
  }
}
