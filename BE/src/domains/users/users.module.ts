import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './infrastructure/persistence/typeorm-user.entity';
import { GroupMember } from 'src/v1/entities/group_member.entity';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm-user.repository';
import { UserController } from './presenters/user.controller';

import { GetMeUseCase } from './applications/use-cases/get-me.use-case';
import { UpdateProfileUseCase } from './applications/use-cases/update-profile.use-case';
import { UpdateSettingsUseCase } from './applications/use-cases/update-settings.use-case';
import { GetListGroupUseCase } from './applications/use-cases/get-list-group.use-case';
import { UpdatePresenceUseCase } from './applications/use-cases/update-presence.use-case';
import { UpdateMessagePermissionUseCase } from './applications/use-cases/update-message-permission.use-case';
import { BlockUserUseCase } from './applications/use-cases/block-user.use-case';
import { UnblockUserUseCase } from './applications/use-cases/unblock-user.use-case';
import { GetBlockedUsersUseCase } from './applications/use-cases/get-blocked-users.use-case';

const useCases = [
  GetMeUseCase,
  UpdateProfileUseCase,
  UpdateSettingsUseCase,
  GetListGroupUseCase,
  UpdatePresenceUseCase,
  UpdateMessagePermissionUseCase,
  BlockUserUseCase,
  UnblockUserUseCase,
  GetBlockedUsersUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([User, GroupMember]),
  ],
  controllers: [UserController],
  providers: [
    ...useCases,
    {
      provide: 'IUserRepository',
      useClass: TypeOrmUserRepository,
    },
  ],
  exports: [
    'IUserRepository',
    ...useCases,
  ],
})
export class UsersModule {}
