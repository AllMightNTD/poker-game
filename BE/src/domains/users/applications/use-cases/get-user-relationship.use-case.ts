import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Friend } from 'src/v1/entities/friend.entity';
import { Follow } from 'src/v1/entities/follow.entity';
import { FriendRequest } from 'src/v1/entities/friend_request.entity';
import { Block } from 'src/v1/entities/block.entity';
import { FollowingType } from 'src/constants/enums';

@Injectable()
export class GetUserRelationshipUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      return {
        isMe: true,
        isFriend: false,
        followed: false,
        requestSent: false,
        requestReceived: false,
        blocked: false,
      };
    }

    const [friend, follow, requestSent, requestReceived, blocked] =
      await Promise.all([
        // Check Friend
        this.dataSource.getRepository(Friend).findOne({
          where: [
            { user_id: currentUserId, friend_id: targetUserId },
            { user_id: targetUserId, friend_id: currentUserId },
          ],
        }),
        // Check Follow
        this.dataSource.getRepository(Follow).findOne({
          where: {
            follower_id: currentUserId,
            following_entity_id: targetUserId,
            following_type: FollowingType.USER,
          },
        }),
        // Check Request Sent
        this.dataSource.getRepository(FriendRequest).findOne({
          where: {
            sender_id: currentUserId,
            receiver_id: targetUserId,
            status: 'pending' as any,
          },
        }),
        // Check Request Received
        this.dataSource.getRepository(FriendRequest).findOne({
          where: {
            sender_id: targetUserId,
            receiver_id: currentUserId,
            status: 'pending' as any,
          },
        }),
        // Check Blocked (did I block them?)
        this.dataSource.getRepository(Block).findOne({
          where: { blocker_id: currentUserId, blocked_id: targetUserId },
        }),
      ]);

    return {
      isMe: false,
      isFriend: !!friend,
      followed: !!follow,
      requestSent: !!requestSent,
      requestReceived: !!requestReceived,
      requestId: requestSent
        ? requestSent.id
        : requestReceived
          ? requestReceived.id
          : null,
      blocked: !!blocked,
    };
  }
}
