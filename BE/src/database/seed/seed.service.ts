import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

import { UserStatus } from 'src/constants/enums';
import { Role } from 'src/v1/entities/role.entity';
import { User } from 'src/v1/entities/user.entity';
import { UserRole } from 'src/v1/entities/user_role.entity';
import { Wallet } from 'src/v1/entities/wallet.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly dataSource: DataSource) { }

  async seedAll() {
    this.logger.log('Starting minimal poker database seed...');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0;');
      const entities = this.dataSource.entityMetadatas;
      for (const entity of entities) {
        await queryRunner.query(`TRUNCATE TABLE \`${entity.tableName}\``);
      }
      this.logger.log('All tables truncated successfully.');
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1;');

      // Roles
      const roleRepo = this.dataSource.getRepository(Role);
      const r1 = await roleRepo.save({ name: 'SUPER_ADMIN', description: 'Admin tối cao' });
      const r2 = await roleRepo.save({ name: 'MEMBER', description: 'Người dùng thường' });

      // Users
      const passwordHash = await bcrypt.hash('123456', 10);
      const userRepo = this.dataSource.getRepository(User);
      const userRoleRepo = this.dataSource.getRepository(UserRole);
      const walletRepo = this.dataSource.getRepository(Wallet);

      this.logger.log('Generating 10 poker players...');

      for (let i = 1; i <= 10; i++) {
        const user = await userRepo.save({
          email: `player${i}@example.com`,
          password: passwordHash,
          status: UserStatus.ACTIVE,
          is_active_status: true,
          user_name: `Player${i}`,

        });

        await userRoleRepo.save({
          user_id: user.id,
          role_id: i === 1 ? r1.id : r2.id,
        });

        await walletRepo.save({
          user_id: user.id,
          chips_balance: '1000000', // 1M chips for poker
        });
      }

      this.logger.log('Users and wallets generated successfully.');
    } catch (err) {
      this.logger.error('Error during seeding', err);
    } finally {
      await queryRunner.release();
    }
  }
}
