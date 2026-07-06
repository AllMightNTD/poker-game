import { DataSource, QueryRunner } from 'typeorm';

/**
 * Generic transaction wrapper to avoid boilerplate try/catch/commit/rollback/release.
 * Usage:
 *   const result = await withTransaction(this.dataSource, async (qr) => {
 *     const wallet = await qr.manager.findOne(Wallet, { where: { user_id }, lock: { mode: 'pessimistic_write' } });
 *     wallet.chips_balance = '999';
 *     await qr.manager.save(wallet);
 *     return wallet;
 *   });
 */
export async function withTransaction<T>(
  dataSource: DataSource,
  work: (qr: QueryRunner) => Promise<T>,
): Promise<T> {
  const qr = dataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();
  try {
    const result = await work(qr);
    await qr.commitTransaction();
    return result;
  } catch (err) {
    await qr.rollbackTransaction();
    throw err;
  } finally {
    await qr.release();
  }
}
