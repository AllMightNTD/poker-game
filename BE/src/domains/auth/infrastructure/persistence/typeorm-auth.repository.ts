import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { User } from 'src/v1/entities/user.entity';
import { Profile } from 'src/v1/entities/profile.entity';
import { RefreshToken } from 'src/v1/entities/refresh_token.entity';
import { UserSettings } from 'src/v1/entities/user_settings.entity';
import { UserStats } from 'src/v1/entities/user_stats.entity';
import { UserPresence } from 'src/v1/entities/user_presence.entity';

@Injectable()
export class TypeOrmAuthRepository implements IAuthRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly dataSource: DataSource,
  ) {}

  async findUserByEmailOrPhone(emailOrPhone: string): Promise<any | null> {
    return this.userRepo.findOne({
      where: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      select: ['id', 'email', 'phone', 'password', 'status'],
    });
  }

  async findUserByFacebookId(facebookId: string): Promise<any | null> {
    return this.userRepo.findOne({
      where: { facebook_id: facebookId },
      relations: ['profile'],
    });
  }

  async findUserByEmail(email: string): Promise<any | null> {
    return this.userRepo.findOne({
      where: { email },
      relations: ['profile'],
    });
  }

  async findUserByResetPasswordToken(token: string): Promise<any | null> {
    return this.userRepo.findOne({
      where: { reset_password_token: token },
    });
  }

  async saveUser(user: any): Promise<any> {
    return this.userRepo.save(user);
  }

  async findProfileByUsername(username: string): Promise<any | null> {
    return this.profileRepo.findOne({ where: { username } });
  }

  async createRegisterTransaction(
    userData: any,
    profileData: any,
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = queryRunner.manager.create(User, userData);
      await queryRunner.manager.save(user);

      const profile = queryRunner.manager.create(Profile, {
        user_id: user.id,
        ...profileData,
      });
      await queryRunner.manager.save(profile);

      const settings = queryRunner.manager.create(UserSettings, {
        user_id: user.id,
      });
      await queryRunner.manager.save(settings);

      const stats = queryRunner.manager.create(UserStats, {
        user_id: user.id,
      });
      await queryRunner.manager.save(stats);

      const presence = queryRunner.manager.create(UserPresence, {
        user_id: user.id,
        last_seen_at: new Date(),
      });
      await queryRunner.manager.save(presence);

      await queryRunner.commitTransaction();
      user.profile = profile;
      return user;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async saveRefreshToken(tokenData: any): Promise<any> {
    const token = this.refreshTokenRepository.create(tokenData);
    return this.refreshTokenRepository.save(token);
  }

  async revokeRefreshTokens(userId: string): Promise<any> {
    return this.refreshTokenRepository.update(
      {
        user_id: userId,
        revoked_at: IsNull(),
      },
      { revoked_at: new Date() },
    );
  }
}
