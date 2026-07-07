import { Injectable } from '@nestjs/common';
import { SystemRevenue } from '../../entities/system_revenue.entity';
import { Transaction } from '../../entities/transaction.entity';

@Injectable()
export class AdminRevenueService {
  async getRevenueStats() {
    // 1. Tổng doanh thu (All-time)
    const totalRakeResult = await SystemRevenue.createQueryBuilder('sr')
      .select(
        'COALESCE(SUM(CAST(sr.revenue_amount AS DECIMAL)), 0)',
        'totalRake',
      )
      .getRawOne();

    const totalDepositResult = await Transaction.createQueryBuilder('tx')
      .select('COALESCE(SUM(CAST(tx.amount AS DECIMAL)), 0)', 'totalDeposit')
      .where("tx.type = 'DEPOSIT' AND tx.status = 'APPROVED'")
      .getRawOne();

    const totalWithdrawResult = await Transaction.createQueryBuilder('tx')
      .select('COALESCE(SUM(CAST(tx.amount AS DECIMAL)), 0)', 'totalWithdraw')
      .where("tx.type = 'WITHDRAW' AND tx.status = 'APPROVED'")
      .getRawOne();

    // 2. Rake theo ngày (30 ngày gần nhất)
    const rakeStats = await SystemRevenue.createQueryBuilder('sr')
      .select("DATE_FORMAT(sr.created_at, '%Y-%m-%d')", 'date')
      .addSelect(
        'COALESCE(SUM(CAST(sr.revenue_amount AS DECIMAL)), 0)',
        'amount',
      )
      .where('sr.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)')
      .groupBy("DATE_FORMAT(sr.created_at, '%Y-%m-%d')")
      .orderBy('date', 'ASC')
      .getRawMany();

    // 3. Nạp/rút theo ngày (30 ngày gần nhất)
    const txStats = await Transaction.createQueryBuilder('tx')
      .select("DATE_FORMAT(tx.created_at, '%Y-%m-%d')", 'date')
      .addSelect(
        "SUM(CASE WHEN tx.type = 'DEPOSIT' THEN CAST(tx.amount AS DECIMAL) ELSE 0 END)",
        'deposit',
      )
      .addSelect(
        "SUM(CASE WHEN tx.type = 'WITHDRAW' THEN CAST(tx.amount AS DECIMAL) ELSE 0 END)",
        'withdraw',
      )
      .where(
        "tx.status = 'APPROVED' AND tx.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)",
      )
      .groupBy("DATE_FORMAT(tx.created_at, '%Y-%m-%d')")
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      summary: {
        total_rake: Number(totalRakeResult?.totalRake || 0),
        total_deposit: Number(totalDepositResult?.totalDeposit || 0),
        total_withdraw: Number(totalWithdrawResult?.totalWithdraw || 0),
        net_flow:
          Number(totalDepositResult?.totalDeposit || 0) -
          Number(totalWithdrawResult?.totalWithdraw || 0),
      },
      daily_rake: rakeStats.map((r) => ({
        date: r.date,
        amount: Number(r.amount),
      })),
      daily_transactions: txStats.map((t) => ({
        date: t.date,
        deposit: Number(t.deposit),
        withdraw: Number(t.withdraw),
      })),
    };
  }
}
