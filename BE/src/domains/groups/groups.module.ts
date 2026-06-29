import { Module } from '@nestjs/common';
import { GroupController } from './presenters/group.controller';

import { CreateGroupUseCase } from './applications/use-cases/create-group.use-case';
import { SearchGroupsUseCase } from './applications/use-cases/search-groups.use-case';
import { GetGroupSuggestionsUseCase } from './applications/use-cases/get-group-suggestions.use-case';
import { FindAllGroupsUseCase } from './applications/use-cases/find-all-groups.use-case';
import { FindOneGroupUseCase } from './applications/use-cases/find-one-group.use-case';
import { UpdateGroupUseCase } from './applications/use-cases/update-group.use-case';
import { RemoveGroupUseCase } from './applications/use-cases/remove-group.use-case';
import { JoinGroupUseCase } from './applications/use-cases/join-group.use-case';
import { GetGroupMembersUseCase } from './applications/use-cases/get-group-members.use-case';
import { ApproveGroupMemberUseCase } from './applications/use-cases/approve-group-member.use-case';
import { RemoveGroupMemberUseCase } from './applications/use-cases/remove-group-member.use-case';
import { GetPendingGroupPostsUseCase } from './applications/use-cases/get-pending-group-posts.use-case';
import { ApproveGroupPostUseCase } from './applications/use-cases/approve-group-post.use-case';
import { RejectGroupPostUseCase } from './applications/use-cases/reject-group-post.use-case';
import { GetGroupPostsUseCase } from './applications/use-cases/get-group-posts.use-case';
import { LeaveGroupUseCase } from './applications/use-cases/leave-group.use-case';
import { TransferOwnershipUseCase } from './applications/use-cases/transfer-ownership.use-case';

const useCases = [
  CreateGroupUseCase,
  SearchGroupsUseCase,
  GetGroupSuggestionsUseCase,
  FindAllGroupsUseCase,
  FindOneGroupUseCase,
  UpdateGroupUseCase,
  RemoveGroupUseCase,
  JoinGroupUseCase,
  GetGroupMembersUseCase,
  ApproveGroupMemberUseCase,
  RemoveGroupMemberUseCase,
  GetPendingGroupPostsUseCase,
  ApproveGroupPostUseCase,
  RejectGroupPostUseCase,
  GetGroupPostsUseCase,
  LeaveGroupUseCase,
  TransferOwnershipUseCase,
];

@Module({
  controllers: [GroupController],
  providers: [...useCases],
  exports: [...useCases],
})
export class GroupsModule {}
