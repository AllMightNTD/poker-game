import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Transaction } from '../../entities/transaction.entity';
import { Wallet } from '../../entities/wallet.entity';
import { ProcessTransactionDto } from '../dto/process-transaction.dto';
import {
  decodeCursor,
  buildCursorPaginationResponse,
} from '../../utils/pagination.util';

@Injectable()
export class AdminTransactionsService {
  async getTransactions(
    cursor: string | undefined,
    limit: number,
    status?: string,
  ) {
    const query = Transaction.createQueryBuilder('tx').leftJoinAndSelect(
      'tx.user',
      'user',
    );

    if (status) {
      query.where('tx.status = :status', { status });
    }

    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (decoded) {
        query.andWhere(
          '(tx.created_at < :time OR (tx.created_at = :time AND tx.id < :id))',
          { time: decoded.time, id: decoded.id },
        );
      }
    }

    query.orderBy('tx.created_at', 'DESC').addOrderBy('tx.id', 'DESC');
    query.take(limit + 1);

    const transactions = await query.getMany();

    const data = transactions.map((tx) => ({
      ...tx,
      user: tx.user
        ? { id: tx.user.id, email: tx.user.email, user_name: tx.user.user_name }
        : null,
    }));

    return buildCursorPaginationResponse(data as any, limit);
  }

  async processTransaction(
    adminId: string,
    id: string,
    dto: ProcessTransactionDto,
  ) {
    const transaction = await Transaction.findOne({ where: { id } });
    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.status !== 'PENDING')
      throw new BadRequestException('Transaction is already processed');

    transaction.status = dto.status;
    transaction.processed_by = adminId;
    transaction.notes = dto.notes;

    if (dto.status === 'APPROVED' && transaction.type === 'DEPOSIT') {
      const wallet = await Wallet.findOne({
        where: { user_id: transaction.user_id },
      });
      if (wallet) {
        wallet.chips_balance = (
          BigInt(wallet.chips_balance) + BigInt(transaction.amount)
        ).toString();
        await wallet.save();
      }
    }

    if (dto.status === 'REJECTED' && transaction.type === 'WITHDRAW') {
      const wallet = await Wallet.findOne({
        where: { user_id: transaction.user_id },
      });
      if (wallet) {
        wallet.chips_balance = (
          BigInt(wallet.chips_balance) + BigInt(transaction.amount)
        ).toString();
        await wallet.save();
      }
    }

    await transaction.save();
    return { success: true, message: `Transaction has been ${dto.status}` };
  }
}
