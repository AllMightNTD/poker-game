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
import { AuthGuard } from '../guards/auth.guard';
import { FriendService } from './friend.service';

@Controller('')
@UseGuards(AuthGuard)
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  /**
   * GET /api/v1/friend/list
   * Get list of friends for the authenticated user
   */
  @Get('/list')
  async getFriends(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.friendService.getFriends(req.user.sub, +page, +limit);
  }

  /**
   * GET /api/v1/friend/suggestions
   * Get friend recommendations/suggestions for the authenticated user
   */
  @Get('/suggestions')
  async getFriendSuggestions(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.friendService.getFriendSuggestions(req.user.sub, +page, +limit);
  }

  /**
   * GET /api/v1/friend/requests/incoming
   * Get list of pending incoming friend requests
   */
  @Get('/requests/incoming')
  async getPendingRequests(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.friendService.getPendingRequests(req.user.sub, +page, +limit);
  }

  /**
   * GET /api/v1/friend/requests/outgoing
   * Get list of pending outgoing friend requests
   */
  @Get('/requests/outgoing')
  async getSentRequests(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.friendService.getSentRequests(req.user.sub, +page, +limit);
  }

  /**
   * GET /api/v1/friend/requests/count
   * Count pending incoming friend requests
   */
  @Get('/requests/count')
  async countPendingRequests(@Request() req) {
    const count = await this.friendService.countPendingRequests(req.user.sub);
    return { count };
  }

  /**
   * POST /api/v1/friend/request
   * Send a friend request
   */
  @Post('/request')
  async sendRequest(@Request() req, @Body('receiver_id') receiverId: string) {
    return this.friendService.sendFriendRequest(req.user.sub, receiverId);
  }

  /**
   * PUT /api/v1/friend/request/:id/accept
   * Accept a friend request
   */
  @Put('/request/:id/accept')
  async acceptRequest(@Request() req, @Param('id') requestId: string) {
    return this.friendService.acceptFriendRequest(req.user.sub, requestId);
  }

  /**
   * PUT /api/v1/friend/request/:id/decline
   * Decline a friend request
   */
  @Put('/request/:id/decline')
  async declineRequest(@Request() req, @Param('id') requestId: string) {
    return this.friendService.declineFriendRequest(req.user.sub, requestId);
  }

  /**
   * DELETE /api/v1/friend/request/:id/cancel
   * Cancel a sent friend request
   */
  @Delete('/request/:id/cancel')
  async cancelRequest(@Request() req, @Param('id') requestId: string) {
    return this.friendService.cancelFriendRequest(req.user.sub, requestId);
  }

  /**
   * DELETE /api/v1/friend/:friendId
   * Unfriend a user
   */
  @Delete('/:friendId')
  async unfriend(@Request() req, @Param('friendId') friendId: string) {
    return this.friendService.unfriend(req.user.sub, friendId);
  }
}
