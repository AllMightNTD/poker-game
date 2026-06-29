import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserDomainEntity } from '../../domain/entities/user.domain-entity';
import { User } from './typeorm-user.entity';
import { GroupMember } from 'src/v1/entities/group_member.entity';
import { Profile } from 'src/v1/entities/profile.entity';
import { UserSettings } from 'src/v1/entities/user_settings.entity';
import { Block } from 'src/v1/entities/block.entity';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly typeormRepository: Repository<User>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepository: Repository<GroupMember>,
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: string): Promise<UserDomainEntity | null> {
    const user = await this.typeormRepository.findOne({ where: { id } });
    if (!user) return null;
    return this.mapToDomain(user);
  }

  async findByIdWithRelations(
    id: string,
    relations: string[],
  ): Promise<any | null> {
    return this.typeormRepository.findOne({ where: { id }, relations });
  }

  async save(user: UserDomainEntity): Promise<UserDomainEntity> {
    const ormUser = this.mapToOrm(user);
    const saved = await this.typeormRepository.save(ormUser);
    return this.mapToDomain(saved);
  }

  async updatePresence(id: string, isActive: boolean): Promise<any> {
    const user = await this.typeormRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    user.is_active_status = isActive;
    await this.typeormRepository.save(user);
    return { success: true, is_active_status: user.is_active_status };
  }

  async updateMessagePermission(id: string, permission: any): Promise<any> {
    const user = await this.typeormRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    user.message_permission = permission;
    await this.typeormRepository.save(user);
    return { success: true, message_permission: user.message_permission };
  }

  async blockUser(
    userId: string,
    targetUserId: string,
    reason?: string,
  ): Promise<any> {
    if (userId === targetUserId) {
      throw new BadRequestException('You cannot block yourself');
    }
    const blockRepo = this.dataSource.getRepository(Block);
    const existingBlock = await blockRepo.findOne({
      where: { blocker_id: userId, blocked_id: targetUserId },
    });
    if (existingBlock) {
      return { success: true, message: 'Already blocked' };
    }

    const newBlock = blockRepo.create({
      blocker_id: userId,
      blocked_id: targetUserId,
      reason: reason || '',
    });
    await blockRepo.save(newBlock);
    return { success: true };
  }

  async unblockUser(userId: string, targetUserId: string): Promise<any> {
    const blockRepo = this.dataSource.getRepository(Block);
    await blockRepo.delete({ blocker_id: userId, blocked_id: targetUserId });
    return { success: true };
  }

  async getBlockedUsers(userId: string): Promise<any[]> {
    const blockRepo = this.dataSource.getRepository(Block);
    const blocks = await blockRepo.find({
      where: { blocker_id: userId },
      relations: ['blocked', 'blocked.profile'],
    });
    return blocks.map((b) => ({
      id: b.blocked?.id,
      email: b.blocked?.email,
      profile: b.blocked?.profile,
      created_at: b.created_at,
    }));
  }

  async getListGroup(userId: string): Promise<any> {
    const groups = await this.groupMemberRepository.find({
      where: { user_id: userId },
      relations: ['group', 'group.creator'],
    });

    if (!groups) {
      throw new BadRequestException('Group not found');
    }

    return {
      data: groups,
    };
  }

  async updateProfile(userId: string, updateProfileDto: any): Promise<any> {
    const profileRepo = this.dataSource.getRepository(Profile);
    const profile = await profileRepo.findOne({ where: { user_id: userId } });
    if (!profile) {
      throw new BadRequestException('Profile not found');
    }

    Object.assign(profile, updateProfileDto);
    return profileRepo.save(profile);
  }

  async updateSettings(userId: string, updateSettingsDto: any): Promise<any> {
    const settingsRepo = this.dataSource.getRepository(UserSettings);
    const settings = await settingsRepo.findOne({ where: { user_id: userId } });
    if (!settings) {
      throw new BadRequestException('Settings not found');
    }

    Object.assign(settings, updateSettingsDto);
    return settingsRepo.save(settings);
  }

  private mapToDomain(ormUser: User): UserDomainEntity {
    return new UserDomainEntity({
      id: ormUser.id,
      email: ormUser.email,
      phone: ormUser.phone,
      password: ormUser.password,
      facebookId: ormUser.facebook_id,
      resetPasswordToken: ormUser.reset_password_token,
      resetPasswordExpiresAt: ormUser.reset_password_expires_at,
      status: ormUser.status,
      isActiveStatus: ormUser.is_active_status,
      messagePermission: ormUser.message_permission,
      emailVerifiedAt: ormUser.email_verified_at,
      phoneVerifiedAt: ormUser.phone_verified_at,
      lastLoginAt: ormUser.last_login_at,
      createdAt: ormUser.created_at,
      updatedAt: ormUser.updated_at,
      deletedAt: ormUser.deleted_at,
    });
  }

  private mapToOrm(domainUser: UserDomainEntity): User {
    const ormUser = new User();
    if (domainUser.id) ormUser.id = domainUser.id;
    ormUser.email = domainUser.email;
    ormUser.phone = domainUser.phone;
    ormUser.password = domainUser.password;
    ormUser.facebook_id = domainUser.facebookId;
    ormUser.reset_password_token = domainUser.resetPasswordToken;
    ormUser.reset_password_expires_at = domainUser.resetPasswordExpiresAt;
    ormUser.status = domainUser.status;
    ormUser.is_active_status = domainUser.isActiveStatus;
    ormUser.message_permission = domainUser.messagePermission;
    ormUser.email_verified_at = domainUser.emailVerifiedAt;
    ormUser.phone_verified_at = domainUser.phoneVerifiedAt;
    ormUser.last_login_at = domainUser.lastLoginAt;
    return ormUser;
  }
}
