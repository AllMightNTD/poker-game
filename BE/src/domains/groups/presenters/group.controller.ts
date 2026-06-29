import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GroupMemberStatus } from 'src/constants/enums';
import { AuthGuard } from 'src/v1/guards/auth.guard';
import { CreateGroupDto } from '../applications/dtos/create-group.dto';
import { UpdateGroupDto } from '../applications/dtos/update-group.dto';

import { ApproveGroupMemberUseCase } from '../applications/use-cases/approve-group-member.use-case';
import { ApproveGroupPostUseCase } from '../applications/use-cases/approve-group-post.use-case';
import { CreateGroupUseCase } from '../applications/use-cases/create-group.use-case';
import { FindAllGroupsUseCase } from '../applications/use-cases/find-all-groups.use-case';
import { FindOneGroupUseCase } from '../applications/use-cases/find-one-group.use-case';
import { GetGroupMembersUseCase } from '../applications/use-cases/get-group-members.use-case';
import { GetGroupPostsUseCase } from '../applications/use-cases/get-group-posts.use-case';
import { GetGroupSuggestionsUseCase } from '../applications/use-cases/get-group-suggestions.use-case';
import { GetPendingGroupPostsUseCase } from '../applications/use-cases/get-pending-group-posts.use-case';
import { JoinGroupUseCase } from '../applications/use-cases/join-group.use-case';
import { LeaveGroupUseCase } from '../applications/use-cases/leave-group.use-case';
import { RejectGroupPostUseCase } from '../applications/use-cases/reject-group-post.use-case';
import { RemoveGroupMemberUseCase } from '../applications/use-cases/remove-group-member.use-case';
import { RemoveGroupUseCase } from '../applications/use-cases/remove-group.use-case';
import { SearchGroupsUseCase } from '../applications/use-cases/search-groups.use-case';
import { TransferOwnershipUseCase } from '../applications/use-cases/transfer-ownership.use-case';
import { UpdateGroupUseCase } from '../applications/use-cases/update-group.use-case';

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('')
export class GroupController {
  constructor(
    private readonly createGroupUseCase: CreateGroupUseCase,
    private readonly searchGroupsUseCase: SearchGroupsUseCase,
    private readonly getGroupSuggestionsUseCase: GetGroupSuggestionsUseCase,
    private readonly findAllGroupsUseCase: FindAllGroupsUseCase,
    private readonly findOneGroupUseCase: FindOneGroupUseCase,
    private readonly updateGroupUseCase: UpdateGroupUseCase,
    private readonly removeGroupUseCase: RemoveGroupUseCase,
    private readonly joinGroupUseCase: JoinGroupUseCase,
    private readonly getGroupMembersUseCase: GetGroupMembersUseCase,
    private readonly approveGroupMemberUseCase: ApproveGroupMemberUseCase,
    private readonly removeGroupMemberUseCase: RemoveGroupMemberUseCase,
    private readonly getPendingGroupPostsUseCase: GetPendingGroupPostsUseCase,
    private readonly approveGroupPostUseCase: ApproveGroupPostUseCase,
    private readonly rejectGroupPostUseCase: RejectGroupPostUseCase,
    private readonly getGroupPostsUseCase: GetGroupPostsUseCase,
    private readonly leaveGroupUseCase: LeaveGroupUseCase,
    private readonly transferOwnershipUseCase: TransferOwnershipUseCase,
  ) {}

  @Post()
  create(@Body() createGroupDto: CreateGroupDto, @Req() req: any) {
    return this.createGroupUseCase.execute(createGroupDto, req.user.sub);
  }

  @Get('search')
  @ApiQuery({ name: 'q', required: false })
  searchGroups(@Query('q') q: string, @Req() req: any) {
    return this.searchGroupsUseCase.execute(q || '', req.user.sub);
  }

  @Get('suggestions')
  getSuggestions(@Req() req: any) {
    return this.getGroupSuggestionsUseCase.execute(req.user.sub);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.findAllGroupsUseCase.execute(req.user.sub);
  }

  @Get(':id/posts')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getPosts(
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Req() req: any,
  ) {
    return this.getGroupPostsUseCase.execute(
      id,
      req.user.sub,
      Number(page),
      Number(limit),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.findOneGroupUseCase.execute(id, req.user.sub);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @Req() req: any,
  ) {
    return this.updateGroupUseCase.execute(id, updateGroupDto, req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.removeGroupUseCase.execute(id, req.user.sub);
  }

  @Post(':id/join')
  joinGroup(@Param('id') id: string, @Req() req: any) {
    return this.joinGroupUseCase.execute(id, req.user.sub);
  }

  @Post(':id/leave')
  leaveGroup(@Param('id') id: string, @Req() req: any) {
    return this.leaveGroupUseCase.execute(id, req.user.sub);
  }

  @Post(':id/transfer-owner')
  transferOwner(
    @Param('id') id: string,
    @Body('newOwnerId') newOwnerId: string,
    @Req() req: any,
  ) {
    return this.transferOwnershipUseCase.execute(id, req.user.sub, newOwnerId);
  }

  @Get(':id/members')
  @ApiQuery({ name: 'status', enum: GroupMemberStatus, required: false })
  getMembers(
    @Param('id') id: string,
    @Query('status') status?: GroupMemberStatus,
  ) {
    return this.getGroupMembersUseCase.execute(id, status);
  }

  @Post(':id/members/:userId/approve')
  approveMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    return this.approveGroupMemberUseCase.execute(id, userId, req.user.sub);
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    return this.removeGroupMemberUseCase.execute(id, userId, req.user.sub);
  }

  @Get(':id/pending-posts')
  getPendingPosts(@Param('id') id: string, @Req() req: any) {
    return this.getPendingGroupPostsUseCase.execute(id, req.user.sub);
  }

  @Post(':id/posts/:postId/approve')
  approvePost(
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Req() req: any,
  ) {
    return this.approveGroupPostUseCase.execute(id, postId, req.user.sub);
  }

  @Post(':id/posts/:postId/reject')
  rejectPost(
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Req() req: any,
  ) {
    return this.rejectGroupPostUseCase.execute(id, postId, req.user.sub);
  }
}
