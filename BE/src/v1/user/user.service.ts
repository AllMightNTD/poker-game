import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/base/base.service';
import { MessagePermission } from 'src/constants/enums';
import { User } from '../entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

import { GetMeUseCase } from 'src/domains/users/applications/use-cases/get-me.use-case';
import { UpdateProfileUseCase } from 'src/domains/users/applications/use-cases/update-profile.use-case';
import { UpdateSettingsUseCase } from 'src/domains/users/applications/use-cases/update-settings.use-case';
import { GetListGroupUseCase } from 'src/domains/users/applications/use-cases/get-list-group.use-case';
import { UpdatePresenceUseCase } from 'src/domains/users/applications/use-cases/update-presence.use-case';
import { UpdateMessagePermissionUseCase } from 'src/domains/users/applications/use-cases/update-message-permission.use-case';
import { BlockUserUseCase } from 'src/domains/users/applications/use-cases/block-user.use-case';
import { UnblockUserUseCase } from 'src/domains/users/applications/use-cases/unblock-user.use-case';
import { GetBlockedUsersUseCase } from 'src/domains/users/applications/use-cases/get-blocked-users.use-case';

@Injectable()
export class UserService extends BaseService<User, string> {
  protected filterableColumns: any;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly updateSettingsUseCase: UpdateSettingsUseCase,
    private readonly getListGroupUseCase: GetListGroupUseCase,
    private readonly updatePresenceUseCase: UpdatePresenceUseCase,
    private readonly updateMessagePermissionUseCase: UpdateMessagePermissionUseCase,
    private readonly blockUserUseCase: BlockUserUseCase,
    private readonly unblockUserUseCase: UnblockUserUseCase,
    private readonly getBlockedUsersUseCase: GetBlockedUsersUseCase,
  ) {
    super(userRepository);
  }

  async getMe(userId: string) {
    return this.getMeUseCase.execute(userId);
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    return this.updateProfileUseCase.execute(userId, updateProfileDto);
  }

  async updateSettings(userId: string, updateSettingsDto: UpdateSettingsDto) {
    return this.updateSettingsUseCase.execute(userId, updateSettingsDto);
  }

  async getListGroup(userId: string) {
    return this.getListGroupUseCase.execute(userId);
  }

  async updatePresence(userId: string, isActive: boolean) {
    return this.updatePresenceUseCase.execute(userId, isActive);
  }

  async updateMessagePermission(userId: string, permission: MessagePermission) {
    return this.updateMessagePermissionUseCase.execute(userId, permission);
  }

  async blockUser(userId: string, targetUserId: string, reason?: string) {
    return this.blockUserUseCase.execute(userId, targetUserId, reason);
  }

  async unblockUser(userId: string, targetUserId: string) {
    return this.unblockUserUseCase.execute(userId, targetUserId);
  }

  async getBlockedUsers(userId: string) {
    return this.getBlockedUsersUseCase.execute(userId);
  }
}
