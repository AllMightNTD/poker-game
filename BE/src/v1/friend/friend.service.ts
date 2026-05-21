import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendRequestStatus } from 'src/constants/enums';
import { Repository } from 'typeorm';
import { Friend } from '../entities/friend.entity';
import { FriendRequest } from '../entities/friend_request.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepo: Repository<Friend>,
    @InjectRepository(FriendRequest)
    private readonly friendRequestRepo: Repository<FriendRequest>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  /**
   * Get list of friends for a user with profile info
   */
  async getFriends(userId: string, page = 1, limit = 20) {
    console.log(userId);
    const [friends, total] = await this.friendRepo.findAndCount({
      where: { user_id: userId },
      relations: ['friend_user', 'friend_user.profile', 'friend_user.presence'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: friends,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Send a friend request
   */
  async sendFriendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    // Check if receiver exists
    const receiver = await this.userRepo.findOne({ where: { id: receiverId } });
    if (!receiver) {
      throw new NotFoundException('User not found');
    }

    // Check if already friends
    const existing = await this.friendRepo.findOne({
      where: { user_id: senderId, friend_id: receiverId },
    });
    if (existing) {
      throw new BadRequestException('Already friends');
    }

    // Check if request already sent
    const existingReq = await this.friendRequestRepo.findOne({
      where: { sender_id: senderId, receiver_id: receiverId },
    });
    if (existingReq) {
      throw new BadRequestException('Friend request already sent');
    }

    const request = await this.friendRequestRepo.save({
      sender_id: senderId,
      receiver_id: receiverId,
      status: FriendRequestStatus.PENDING,
    });

    return { message: 'Friend request sent', data: request };
  }

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(userId: string, requestId: string) {
    const request = await this.friendRequestRepo.findOne({
      where: { id: requestId, receiver_id: userId, status: FriendRequestStatus.PENDING },
    });

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    // Update request status
    request.status = FriendRequestStatus.ACCEPTED;
    request.responded_at = new Date();
    await this.friendRequestRepo.save(request);

    // Create bidirectional friendship
    await this.friendRepo.save([
      { user_id: request.sender_id, friend_id: request.receiver_id },
      { user_id: request.receiver_id, friend_id: request.sender_id },
    ]);

    return { message: 'Friend request accepted' };
  }

  /**
   * Decline a friend request
   */
  async declineFriendRequest(userId: string, requestId: string) {
    const request = await this.friendRequestRepo.findOne({
      where: { id: requestId, receiver_id: userId, status: FriendRequestStatus.PENDING },
    });

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    request.status = FriendRequestStatus.DECLINED;
    request.responded_at = new Date();
    await this.friendRequestRepo.save(request);

    return { message: 'Friend request declined' };
  }

  /**
   * Unfriend a user (remove bidirectional)
   */
  async unfriend(userId: string, friendId: string) {
    const friendship = await this.friendRepo.findOne({
      where: { user_id: userId, friend_id: friendId },
    });

    if (!friendship) {
      throw new NotFoundException('Not friends with this user');
    }

    // Remove both directions
    await this.friendRepo.delete({ user_id: userId, friend_id: friendId });
    await this.friendRepo.delete({ user_id: friendId, friend_id: userId });

    return { message: 'Unfriended successfully' };
  }

  /**
   * Cancel a sent friend request
   */
  async cancelFriendRequest(userId: string, requestId: string) {
    const request = await this.friendRequestRepo.findOne({
      where: { id: requestId, sender_id: userId, status: FriendRequestStatus.PENDING },
    });

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    request.status = FriendRequestStatus.CANCELLED;
    request.responded_at = new Date();
    await this.friendRequestRepo.save(request);

    return { message: 'Friend request cancelled' };
  }
}
