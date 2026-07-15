import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

import { AdminRole, UserStatus } from 'src/constants/enums';

import { Admin } from 'src/v1/entities/admin.entity';
import { Blog } from 'src/v1/entities/blog.entity';
import { Role } from 'src/v1/entities/role.entity';
import { User } from 'src/v1/entities/user.entity';
import { UserRole } from 'src/v1/entities/user_role.entity';
import { Wallet } from 'src/v1/entities/wallet.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly dataSource: DataSource) {}

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
      const r1 = await roleRepo.save({
        name: 'SUPER_ADMIN',
        description: 'Admin tối cao',
      });
      const r2 = await roleRepo.save({
        name: 'MEMBER',
        description: 'Người dùng thường',
      });

      // Users
      const passwordHash = await bcrypt.hash('Password@123', 10);
      const userRepo = this.dataSource.getRepository(User);
      const userRoleRepo = this.dataSource.getRepository(UserRole);
      const walletRepo = this.dataSource.getRepository(Wallet);

      // Add Admin
      const adminRepo = this.dataSource.getRepository(Admin);
      await adminRepo.save({
        email: 'admin@example.com',
        password: passwordHash,
        user_name: 'Admin',
        role: AdminRole.SUPER_ADMIN,
        is_active: true,
        is_two_factor_enabled: false,
      });

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

      const users = await userRepo.find();
      const userIds = users.map((u) => u.id);
      await this.seedBlogs(userIds);
    } catch (err) {
      this.logger.error('Error during seeding', err);
    } finally {
      await queryRunner.release();
    }
  }

  private async seedBlogs(userIds: string[]) {
    this.logger.log('Starting seed 10,000 blogs...');
    const blogRepo = this.dataSource.getRepository(Blog);

    const BATCH_SIZE = 1000;
    const TOTAL_BLOGS = 10000;
    const categories = ['Strategy', 'Tournament', 'News', 'Lifestyle'];

    const thumbnails = [
      'https://images.unsplash.com/photo-1541577717466-9b19b780829d?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1596541624467-5d5180fbe9e3?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1605809798401-46dc03662580?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&q=80',
    ];

    for (let i = 0; i < TOTAL_BLOGS; i += BATCH_SIZE) {
      const batch = [];
      for (let j = 0; j < BATCH_SIZE; j++) {
        const index = i + j + 1;
        const authorId = userIds[Math.floor(Math.random() * userIds.length)];
        const category =
          categories[Math.floor(Math.random() * categories.length)];
        const thumbnail =
          thumbnails[Math.floor(Math.random() * thumbnails.length)];

        batch.push({
          title: `The Ultimate Poker Guide #${index} - ${category}`,
          slug: `the-ultimate-poker-guide-${index}-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
          thumbnail,
          content: `<p>Welcome to our comprehensive guide on <b>${category}</b>. In this article, we dive deep into the strategies that separate the amateurs from the pros.</p><br/><p>Keep grinding and always respect the bankroll management principles.</p>`,
          excerpt: `Discover the top secrets about ${category} in this detailed guide.`,
          category,
          tags: ['Poker', category, 'Pro Tips'],
          author_id: authorId,
          views_count: Math.floor(Math.random() * 100000),
          is_published: Math.random() > 0.1,
        });
      }
      await blogRepo.insert(batch);
      this.logger.log(`Seeded ${i + BATCH_SIZE} / ${TOTAL_BLOGS} blogs`);
    }

    this.logger.log('Blog seeding completed successfully.');
  }
}
