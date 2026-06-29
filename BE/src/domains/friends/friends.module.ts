import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from 'src/v1/entities/friend.entity';
import { FriendRequest } from 'src/v1/entities/friend_request.entity';
import { User } from 'src/v1/entities/user.entity';
import { TypeOrmFriendRepository } from './infrastructure/persistence/typeorm-friend.repository';

import { GetFriendsUseCase } from './applications/use-cases/get-friends.use-case';
import { SendFriendRequestUseCase } from './applications/use-cases/send-friend-request.use-case';
import { AcceptFriendRequestUseCase } from './applications/use-cases/accept-friend-request.use-case';
import { DeclineFriendRequestUseCase } from './applications/use-cases/decline-friend-request.use-case';
import { CancelFriendRequestUseCase } from './applications/use-cases/cancel-friend-request.use-case';
import { UnfriendUseCase } from './applications/use-cases/unfriend.use-case';
import { GetPendingRequestsUseCase } from './applications/use-cases/get-pending-requests.use-case';
import { GetSentRequestsUseCase } from './applications/use-cases/get-sent-requests.use-case';
import { CountPendingRequestsUseCase } from './applications/use-cases/count-pending-requests.use-case';
import { GetFriendSuggestionsUseCase } from './applications/use-cases/get-friend-suggestions.use-case';
import { SearchFriendsUseCase } from './applications/use-cases/search-friends.use-case';
import { GetMutualFriendsUseCase } from './applications/use-cases/get-mutual-friends.use-case';

const useCases = [
  GetFriendsUseCase,
  SendFriendRequestUseCase,
  AcceptFriendRequestUseCase,
  DeclineFriendRequestUseCase,
  CancelFriendRequestUseCase,
  UnfriendUseCase,
  GetPendingRequestsUseCase,
  GetSentRequestsUseCase,
  CountPendingRequestsUseCase,
  GetFriendSuggestionsUseCase,
  SearchFriendsUseCase,
  GetMutualFriendsUseCase,
];

@Module({
  imports: [TypeOrmModule.forFeature([Friend, FriendRequest, User])],
  providers: [
    ...useCases,
    {
      provide: 'IFriendRepository',
      useClass: TypeOrmFriendRepository,
    },
  ],
  exports: ['IFriendRepository', ...useCases],
})
export class FriendsModule {}
