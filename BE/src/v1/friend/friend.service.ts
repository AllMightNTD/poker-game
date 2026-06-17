import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetFriendsUseCase } from 'src/domains/friends/applications/use-cases/get-friends.use-case';
import { SendFriendRequestUseCase } from 'src/domains/friends/applications/use-cases/send-friend-request.use-case';
import { AcceptFriendRequestUseCase } from 'src/domains/friends/applications/use-cases/accept-friend-request.use-case';
import { DeclineFriendRequestUseCase } from 'src/domains/friends/applications/use-cases/decline-friend-request.use-case';
import { CancelFriendRequestUseCase } from 'src/domains/friends/applications/use-cases/cancel-friend-request.use-case';
import { UnfriendUseCase } from 'src/domains/friends/applications/use-cases/unfriend.use-case';
import { GetPendingRequestsUseCase } from 'src/domains/friends/applications/use-cases/get-pending-requests.use-case';
import { GetSentRequestsUseCase } from 'src/domains/friends/applications/use-cases/get-sent-requests.use-case';
import { CountPendingRequestsUseCase } from 'src/domains/friends/applications/use-cases/count-pending-requests.use-case';
import { GetFriendSuggestionsUseCase } from 'src/domains/friends/applications/use-cases/get-friend-suggestions.use-case';
import { Notification } from '../entities/notification.entity';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class FriendService {
  constructor(
    private readonly getFriendsUseCase: GetFriendsUseCase,
    private readonly sendFriendRequestUseCase: SendFriendRequestUseCase,
    private readonly acceptFriendRequestUseCase: AcceptFriendRequestUseCase,
    private readonly declineFriendRequestUseCase: DeclineFriendRequestUseCase,
    private readonly cancelFriendRequestUseCase: CancelFriendRequestUseCase,
    private readonly unfriendUseCase: UnfriendUseCase,
    private readonly getPendingRequestsUseCase: GetPendingRequestsUseCase,
    private readonly getSentRequestsUseCase: GetSentRequestsUseCase,
    private readonly countPendingRequestsUseCase: CountPendingRequestsUseCase,
    private readonly getFriendSuggestionsUseCase: GetFriendSuggestionsUseCase,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly chatGateway: ChatGateway,
  ) {}

  async getFriends(userId: string, page = 1, limit = 20) {
    return this.getFriendsUseCase.execute(userId, page, limit);
  }

  async sendFriendRequest(senderId: string, receiverId: string) {
    const result = await this.sendFriendRequestUseCase.execute(senderId, receiverId);

    try {
      const notification = await this.notificationRepo.save({
        user_id: receiverId,
        actor_id: senderId,
        type: 'friend_request',
        payload: {
          message: 'sent you a friend request',
          requestId: result.data.id,
        },
      });

      if (this.chatGateway.server) {
        this.chatGateway.server.to(`user_${receiverId}`).emit('new_notification', {
          id: notification.id,
          user_id: receiverId,
          actor_id: senderId,
          type: 'friend_request',
          payload: notification.payload,
          created_at: notification.created_at,
        });
      }
    } catch (err) {
      console.error('Failed to create send friend request notification:', err);
    }

    return result;
  }

  async acceptFriendRequest(userId: string, requestId: string) {
    const result = await this.acceptFriendRequestUseCase.execute(userId, requestId);

    try {
      const senderId = result.senderId;
      if (senderId) {
        const notification = await this.notificationRepo.save({
          user_id: senderId,
          actor_id: userId,
          type: 'friend_accept',
          payload: {
            message: 'accepted your friend request',
          },
        });

        if (this.chatGateway.server) {
          this.chatGateway.server.to(`user_${senderId}`).emit('new_notification', {
            id: notification.id,
            user_id: senderId,
            actor_id: userId,
            type: 'friend_accept',
            payload: notification.payload,
            created_at: notification.created_at,
          });
        }
      }
    } catch (err) {
      console.error('Failed to create accept friend request notification:', err);
    }

    return result;
  }

  async declineFriendRequest(userId: string, requestId: string) {
    return this.declineFriendRequestUseCase.execute(userId, requestId);
  }

  async cancelFriendRequest(userId: string, requestId: string) {
    return this.cancelFriendRequestUseCase.execute(userId, requestId);
  }

  async unfriend(userId: string, friendId: string) {
    return this.unfriendUseCase.execute(userId, friendId);
  }

  async getPendingRequests(userId: string, page = 1, limit = 20) {
    return this.getPendingRequestsUseCase.execute(userId, page, limit);
  }

  async getSentRequests(userId: string, page = 1, limit = 20) {
    return this.getSentRequestsUseCase.execute(userId, page, limit);
  }

  async countPendingRequests(userId: string) {
    return this.countPendingRequestsUseCase.execute(userId);
  }

  async getFriendSuggestions(userId: string, page = 1, limit = 10) {
    return this.getFriendSuggestionsUseCase.execute(userId, page, limit);
  }
}
