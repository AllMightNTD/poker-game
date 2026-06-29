import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { I18n, I18nLang, I18nService } from 'nestjs-i18n';
import { MessagePermission } from 'src/constants/enums';
import { AuthGuard } from '../guards/auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UserService } from './user.service';
import { FriendService } from '../friend/friend.service';

import { PostService } from '../post/post.service';

@Controller('')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly friendService: FriendService,
    private readonly postService: PostService,
  ) {}

  @Get('/hello')
  getHello(@I18nLang() lang: string, @I18n() i18n: I18nService) {
    return i18n.t('common.GREETING', { lang });
  }

  @UseGuards(AuthGuard)
  @Get('/me')
  async getMe(@Request() req) {
    // req.user is set by AuthGuard
    return this.userService.getMe(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Post('/profile')
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(req.user.sub, updateProfileDto);
  }

  @UseGuards(AuthGuard)
  @Post('/settings')
  async updateSettings(
    @Request() req,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    return this.userService.updateSettings(req.user.sub, updateSettingsDto);
  }

  @UseGuards(AuthGuard)
  @Get('/groups')
  async getListGroup(@Request() req) {
    return this.userService.getListGroup(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Put('/user/presence')
  async updatePresence(
    @Request() req,
    @Body('is_active_status') isActive: boolean,
  ) {
    return this.userService.updatePresence(req.user.sub, isActive);
  }

  @UseGuards(AuthGuard)
  @Put('/user/message-permission')
  async updateMessagePermission(
    @Request() req,
    @Body('message_permission') permission: MessagePermission,
  ) {
    return this.userService.updateMessagePermission(req.user.sub, permission);
  }

  @UseGuards(AuthGuard)
  @Post('/user/block/:targetUserId')
  async blockUser(
    @Request() req,
    @Param('targetUserId') targetUserId: string,
    @Body('reason') reason?: string,
  ) {
    return this.userService.blockUser(req.user.sub, targetUserId, reason);
  }

  @UseGuards(AuthGuard)
  @Delete('/user/block/:targetUserId')
  async unblockUser(
    @Request() req,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.userService.unblockUser(req.user.sub, targetUserId);
  }

  @UseGuards(AuthGuard)
  @Get('/user/block')
  async getBlockedUsers(@Request() req) {
    return this.userService.getBlockedUsers(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Get('/chips')
  async getChips(@Request() req) {
    const { Wallet } = require('../entities/wallet.entity');
    let wallet = await Wallet.findOne({ where: { user_id: req.user.sub } });
    if (!wallet) {
      wallet = new Wallet();
      wallet.user_id = req.user.sub;
      wallet.chips_balance = '50000000';
      await wallet.save();
    }
    return { chips_balance: wallet.chips_balance };
  }

  // --- Phase 1: Profile Endpoints ---

  @UseGuards(AuthGuard)
  @Get('/:userId')
  async getUserProfile(@Request() req, @Param('userId') userId: string) {
    return this.userService.getUserProfile(req.user.sub, userId);
  }

  @UseGuards(AuthGuard)
  @Get('/:userId/relationship')
  async getUserRelationship(@Request() req, @Param('userId') userId: string) {
    return this.userService.getUserRelationship(req.user.sub, userId);
  }

  @UseGuards(AuthGuard)
  @Get('/:userId/about')
  async getUserAbout(@Param('userId') userId: string) {
    return this.userService.getUserAbout(userId);
  }

  @UseGuards(AuthGuard)
  @Get('/:userId/summary')
  async getUserSummary(@Param('userId') userId: string) {
    return this.userService.getUserSummary(userId);
  }

  @UseGuards(AuthGuard)
  @Post('/:userId/follow')
  async followUser(@Request() req, @Param('userId') userId: string) {
    return this.userService.followUser(req.user.sub, userId);
  }

  @UseGuards(AuthGuard)
  @Delete('/:userId/follow')
  async unfollowUser(@Request() req, @Param('userId') userId: string) {
    return this.userService.unfollowUser(req.user.sub, userId);
  }

  // --- Phase 3: Friends Tab Endpoints ---
  @UseGuards(AuthGuard)
  @Get('/:userId/friends')
  async getUserFriends(
    @Param('userId') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.friendService.getFriends(userId, Number(page), Number(limit));
  }

  @UseGuards(AuthGuard)
  @Get('/:userId/friends/search')
  async searchUserFriends(
    @Param('userId') userId: string,
    @Query('keyword') keyword: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.friendService.searchFriends(
      userId,
      keyword,
      Number(page),
      Number(limit),
    );
  }

  @UseGuards(AuthGuard)
  @Get('/:userId/mutual-friends')
  async getMutualFriends(
    @Request() req,
    @Param('userId') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.friendService.getMutualFriends(
      req.user.sub,
      userId,
      Number(page),
      Number(limit),
    );
  }

  // --- Phase 4: Photos & Videos Tab Endpoints ---
  @UseGuards(AuthGuard)
  @Get('/:userId/media')
  async getUserMedia(
    @Request() req,
    @Param('userId') userId: string,
    @Query('type') type: 'IMAGE' | 'VIDEO' = 'IMAGE',
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.postService.getProfileMedia(
      userId,
      req.user.sub,
      type,
      Number(page),
      Number(limit),
    );
  }

  // --- Phase 5: Groups Tab Endpoints ---
  @UseGuards(AuthGuard)
  @Get('/:userId/groups')
  async getUserGroups(
    @Param('userId') userId: string,
    @Query('filter') filter: 'all' | 'managed' | 'owned' = 'all',
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.userService.getUserGroups(
      userId,
      filter,
      Number(page),
      Number(limit),
    );
  }
}
