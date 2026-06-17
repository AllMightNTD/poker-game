import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IFriendRepository } from '../../domain/repositories/friend.repository.interface';
import { Friend } from 'src/v1/entities/friend.entity';
import { FriendRequest } from 'src/v1/entities/friend_request.entity';
import { User } from 'src/v1/entities/user.entity';
import { FriendRequestStatus, FollowingType, FollowPriority, FollowStatus } from 'src/constants/enums';
import { Follow } from 'src/v1/entities/follow.entity';
import { UserStats } from 'src/v1/entities/user_stats.entity';
import { Profile } from 'src/v1/entities/profile.entity';

@Injectable()
export class TypeOrmFriendRepository implements IFriendRepository {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepo: Repository<Friend>,
    @InjectRepository(FriendRequest)
    private readonly friendRequestRepo: Repository<FriendRequest>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getFriends(userId: string, page = 1, limit = 20) {
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

  async sendFriendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    const receiver = await this.userRepo.findOne({ where: { id: receiverId } });
    if (!receiver) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.friendRepo.findOne({
      where: { user_id: senderId, friend_id: receiverId },
    });
    if (existing) {
      throw new BadRequestException('Already friends');
    }

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

  async acceptFriendRequest(userId: string, requestId: string) {
    const request = await this.friendRequestRepo.findOne({
      where: { id: requestId, receiver_id: userId, status: FriendRequestStatus.PENDING },
    });

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    const { sender_id, receiver_id } = request;

    await this.friendRepo.manager.transaction(async (manager) => {
      // 1. Accept request
      request.status = FriendRequestStatus.ACCEPTED;
      request.responded_at = new Date();
      await manager.save(request);

      // 2. Create friendship
      await manager.save(Friend, [
        { user_id: sender_id, friend_id: receiver_id },
        { user_id: receiver_id, friend_id: sender_id },
      ]);

      // 3. Auto Follow (both directions)
      const followAtoB = await manager.findOne(Follow, {
        where: { follower_id: sender_id, following_type: FollowingType.USER, following_entity_id: receiver_id }
      });
      if (!followAtoB) {
        await manager.save(Follow, {
          follower_id: sender_id,
          following_type: FollowingType.USER,
          following_entity_id: receiver_id,
          status: FollowStatus.ACTIVE,
        });
      }

      const followBtoA = await manager.findOne(Follow, {
        where: { follower_id: receiver_id, following_type: FollowingType.USER, following_entity_id: sender_id }
      });
      if (!followBtoA) {
        await manager.save(Follow, {
          follower_id: receiver_id,
          following_type: FollowingType.USER,
          following_entity_id: sender_id,
          status: FollowStatus.ACTIVE,
        });
      }

      // 4. Update Stats
      for (const id of [sender_id, receiver_id]) {
        let stats = await manager.findOne(UserStats, { where: { user_id: id } });
        if (!stats) {
          stats = manager.create(UserStats, { user_id: id });
        }
        stats.friend_count = (stats.friend_count || 0) + 1;
        stats.follower_count = (stats.follower_count || 0) + 1;
        stats.following_count = (stats.following_count || 0) + 1;
        await manager.save(stats);
      }
    });

    return { message: 'Friend request accepted', senderId: sender_id };
  }

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

  async unfriend(userId: string, friendId: string) {
    const friendship = await this.friendRepo.findOne({
      where: { user_id: userId, friend_id: friendId },
    });

    if (!friendship) {
      throw new NotFoundException('Not friends with this user');
    }

    await this.friendRepo.manager.transaction(async (manager) => {
      // 1. Delete friendships
      await manager.delete(Friend, { user_id: userId, friend_id: friendId });
      await manager.delete(Friend, { user_id: friendId, friend_id: userId });

      // 2. Delete follows
      await manager.delete(Follow, { follower_id: userId, following_type: FollowingType.USER, following_entity_id: friendId });
      await manager.delete(Follow, { follower_id: friendId, following_type: FollowingType.USER, following_entity_id: userId });

      // 3. Decrement stats
      for (const id of [userId, friendId]) {
        let stats = await manager.findOne(UserStats, { where: { user_id: id } });
        if (stats) {
          stats.friend_count = Math.max(0, (stats.friend_count || 0) - 1);
          stats.follower_count = Math.max(0, (stats.follower_count || 0) - 1);
          stats.following_count = Math.max(0, (stats.following_count || 0) - 1);
          await manager.save(stats);
        }
      }
    });

    return { message: 'Unfriended successfully' };
  }

  async getPendingRequests(userId: string, page = 1, limit = 20) {
    const [requests, total] = await this.friendRequestRepo.findAndCount({
      where: { receiver_id: userId, status: FriendRequestStatus.PENDING },
      relations: ['sender', 'sender.profile', 'sender.presence'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: requests,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getSentRequests(userId: string, page = 1, limit = 20) {
    const [requests, total] = await this.friendRequestRepo.findAndCount({
      where: { sender_id: userId, status: FriendRequestStatus.PENDING },
      relations: ['receiver', 'receiver.profile', 'receiver.presence'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: requests,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async countPendingRequests(userId: string): Promise<number> {
    return this.friendRequestRepo.count({
      where: { receiver_id: userId, status: FriendRequestStatus.PENDING },
    });
  }

  async getFriendSuggestions(userId: string, page = 1, limit = 10) {
    const profile = await this.friendRepo.manager.findOne(Profile, {
      where: { user_id: userId },
    });

    const city = profile?.location_city || '';
    const country = profile?.location_country || '';

    const schools: string[] = [];
    const companies: string[] = [];

    if (profile?.education && Array.isArray(profile.education)) {
      profile.education.forEach((edu: any) => {
        if (edu && typeof edu === 'object') {
          const schoolName = edu.school || edu.school_name || edu.university;
          if (schoolName && typeof schoolName === 'string') {
            schools.push(schoolName.trim());
          }
        }
      });
    }

    if (profile?.work && Array.isArray(profile.work)) {
      profile.work.forEach((w: any) => {
        if (w && typeof w === 'object') {
          const companyName = w.company || w.company_name || w.workplace;
          if (companyName && typeof companyName === 'string') {
            companies.push(companyName.trim());
          }
        }
      });
    }

    const weightMutual = 15;
    const weightCity = 20;
    const weightCountry = 5;
    const weightGroup = 15;
    const weightInteraction = 5;
    const weightNetwork = 10;
    const weightSchool = 25;
    const weightCompany = 25;

    let educationScoreSql = '0';
    const queryParams: any = {
      userId,
      targetCity: city,
      targetCountry: country,
      weightMutual,
      weightCity,
      weightCountry,
      weightGroup,
      weightInteraction,
      weightNetwork,
      limit,
      offset: (page - 1) * limit,
    };

    if (schools.length > 0) {
      const schoolChecks = schools.map((school, index) => {
        const paramName = `school_${index}`;
        queryParams[paramName] = `%${school}%`;
        return `IF(p.education LIKE :${paramName}, ${weightSchool}, 0)`;
      });
      educationScoreSql = schoolChecks.join(' + ');
    }

    let workScoreSql = '0';
    if (companies.length > 0) {
      const companyChecks = companies.map((company, index) => {
        const paramName = `company_${index}`;
        queryParams[paramName] = `%${company}%`;
        return `IF(p.work LIKE :${paramName}, ${weightCompany}, 0)`;
      });
      workScoreSql = companyChecks.join(' + ');
    }

    const rawQuery = `
      SELECT 
        u.id AS id,
        p.full_name AS fullName,
        p.avatar_url AS avatarUrl,
        p.location_city AS locationCity,
        
        -- 1. Mutual friends count
        COALESCE(mutual_friends.count, 0) AS mutualFriendsCount,
        
        -- 2. Detail scores for debug/display
        (COALESCE(mutual_friends.count, 0) * :weightMutual) AS mutualFriendsScore,
        IF(p.location_city IS NOT NULL AND LOWER(p.location_city) = LOWER(:targetCity), :weightCity, 0) AS cityScore,
        IF(p.location_country IS NOT NULL AND LOWER(p.location_country) = LOWER(:targetCountry), :weightCountry, 0) AS countryScore,
        (COALESCE(common_groups.count, 0) * :weightGroup) AS commonGroupsScore,
        ((COALESCE(shared_comments.count, 0) + COALESCE(shared_reactions.count, 0)) * :weightInteraction) AS indirectInteractionsScore,
        IF(COALESCE(shared_networks.count, 0) > 0, :weightNetwork, 0) AS networkScore,
        (${educationScoreSql}) AS educationScore,
        (${workScoreSql}) AS workScore,
        
        -- Total score
        (
          (COALESCE(mutual_friends.count, 0) * :weightMutual) +
          IF(p.location_city IS NOT NULL AND LOWER(p.location_city) = LOWER(:targetCity), :weightCity, 0) +
          IF(p.location_country IS NOT NULL AND LOWER(p.location_country) = LOWER(:targetCountry), :weightCountry, 0) +
          (COALESCE(common_groups.count, 0) * :weightGroup) +
          ((COALESCE(shared_comments.count, 0) + COALESCE(shared_reactions.count, 0)) * :weightInteraction) +
          IF(COALESCE(shared_networks.count, 0) > 0, :weightNetwork, 0) +
          (${educationScoreSql}) +
          (${workScoreSql})
        ) AS totalScore
      FROM users u
      JOIN profiles p ON p.user_id = u.id
      
      -- Left Join for Mutual Friends
      LEFT JOIN (
        SELECT f2.user_id AS candidate_id, COUNT(f2.friend_id) AS count
        FROM friends f1
        JOIN friends f2 ON f1.friend_id = f2.friend_id
        WHERE f1.user_id = :userId AND f2.user_id != :userId
        GROUP BY f2.user_id
      ) mutual_friends ON mutual_friends.candidate_id = u.id
      
      -- Left Join for Shared Groups
      LEFT JOIN (
        SELECT gm2.user_id AS candidate_id, COUNT(gm2.group_id) AS count
        FROM group_members gm1
        JOIN group_members gm2 ON gm1.group_id = gm2.group_id
        WHERE gm1.user_id = :userId AND gm2.user_id != :userId
          AND gm1.status = 'ACTIVE' AND gm2.status = 'ACTIVE'
        GROUP BY gm2.user_id
      ) common_groups ON common_groups.candidate_id = u.id
      
      -- Left Join for Comments on same posts
      LEFT JOIN (
        SELECT c2.user_id AS candidate_id, COUNT(DISTINCT c2.target_id) AS count
        FROM comments c1
        JOIN comments c2 ON c1.target_id = c2.target_id AND c1.target_type = c2.target_type
        WHERE c1.user_id = :userId AND c2.user_id != :userId AND c1.target_type = 'POST'
        GROUP BY c2.user_id
      ) shared_comments ON shared_comments.candidate_id = u.id
      
      -- Left Join for Reactions on same posts
      LEFT JOIN (
        SELECT r2.user_id AS candidate_id, COUNT(DISTINCT r2.target_id) AS count
        FROM reactions r1
        JOIN reactions r2 ON r1.target_id = r2.target_id AND r1.target_type = r2.target_type
        WHERE r1.user_id = :userId AND r2.user_id != :userId AND r1.target_type = 'POST'
        GROUP BY r2.user_id
      ) shared_reactions ON shared_reactions.candidate_id = u.id
      
      -- Left Join for Shared networks (IP / device)
      LEFT JOIN (
        SELECT rt2.user_id AS candidate_id, COUNT(rt2.id) AS count
        FROM refresh_tokens rt1
        JOIN refresh_tokens rt2 ON (rt1.ip_address = rt2.ip_address OR rt1.device_info = rt2.device_info)
        WHERE rt1.user_id = :userId AND rt2.user_id != :userId
          AND rt1.ip_address IS NOT NULL AND rt2.ip_address IS NOT NULL
        GROUP BY rt2.user_id
      ) shared_networks ON shared_networks.candidate_id = u.id
      
      WHERE u.id != :userId
        AND u.status = 'ACTIVE'
        AND u.deleted_at IS NULL
        -- Exclude existing friends
        AND u.id NOT IN (
          SELECT friend_id FROM friends WHERE user_id = :userId
        )
        -- Exclude pending requests
        AND u.id NOT IN (
          SELECT sender_id FROM friend_requests WHERE receiver_id = :userId AND status = 'PENDING'
          UNION
          SELECT receiver_id FROM friend_requests WHERE sender_id = :userId AND status = 'PENDING'
        )
        -- Exclude blocked users
        AND u.id NOT IN (
          SELECT blocked_id FROM blocks WHERE blocker_id = :userId
          UNION
          SELECT blocker_id FROM blocks WHERE blocked_id = :userId
        )
        -- Optimization: must have at least one criteria matching
        AND (
          mutual_friends.count > 0 OR
          (p.location_city IS NOT NULL AND LOWER(p.location_city) = LOWER(:targetCity)) OR
          common_groups.count > 0 OR
          shared_comments.count > 0 OR
          shared_reactions.count > 0 OR
          shared_networks.count > 0 OR
          (${schools.length > 0 ? educationScoreSql : '1=0'}) OR
          (${companies.length > 0 ? workScoreSql : '1=0'})
        )
      ORDER BY totalScore DESC, u.created_at DESC
      LIMIT :limit OFFSET :offset
    `;

    const countQuery = `
      SELECT COUNT(*) AS total FROM (
        SELECT u.id
        FROM users u
        JOIN profiles p ON p.user_id = u.id
        LEFT JOIN (
          SELECT f2.user_id AS candidate_id, COUNT(f2.friend_id) AS count
          FROM friends f1
          JOIN friends f2 ON f1.friend_id = f2.friend_id
          WHERE f1.user_id = :userId AND f2.user_id != :userId
          GROUP BY f2.user_id
        ) mutual_friends ON mutual_friends.candidate_id = u.id
        LEFT JOIN (
          SELECT gm2.user_id AS candidate_id, COUNT(gm2.group_id) AS count
          FROM group_members gm1
          JOIN group_members gm2 ON gm1.group_id = gm2.group_id
          WHERE gm1.user_id = :userId AND gm2.user_id != :userId
            AND gm1.status = 'ACTIVE' AND gm2.status = 'ACTIVE'
          GROUP BY gm2.user_id
        ) common_groups ON common_groups.candidate_id = u.id
        LEFT JOIN (
          SELECT c2.user_id AS candidate_id, COUNT(DISTINCT c2.target_id) AS count
          FROM comments c1
          JOIN comments c2 ON c1.target_id = c2.target_id AND c1.target_type = c2.target_type
          WHERE c1.user_id = :userId AND c2.user_id != :userId AND c1.target_type = 'POST'
          GROUP BY c2.user_id
        ) shared_comments ON shared_comments.candidate_id = u.id
        LEFT JOIN (
          SELECT r2.user_id AS candidate_id, COUNT(DISTINCT r2.target_id) AS count
          FROM reactions r1
          JOIN reactions r2 ON r1.target_id = r2.target_id AND r1.target_type = r2.target_type
          WHERE r1.user_id = :userId AND r2.user_id != :userId AND r1.target_type = 'POST'
          GROUP BY r2.user_id
        ) shared_reactions ON shared_reactions.candidate_id = u.id
        LEFT JOIN (
          SELECT rt2.user_id AS candidate_id, COUNT(rt2.id) AS count
          FROM refresh_tokens rt1
          JOIN refresh_tokens rt2 ON (rt1.ip_address = rt2.ip_address OR rt1.device_info = rt2.device_info)
          WHERE rt1.user_id = :userId AND rt2.user_id != :userId
            AND rt1.ip_address IS NOT NULL AND rt2.ip_address IS NOT NULL
          GROUP BY rt2.user_id
        ) shared_networks ON shared_networks.candidate_id = u.id
        WHERE u.id != :userId
          AND u.status = 'ACTIVE'
          AND u.deleted_at IS NULL
          AND u.id NOT IN (SELECT friend_id FROM friends WHERE user_id = :userId)
          AND u.id NOT IN (
            SELECT sender_id FROM friend_requests WHERE receiver_id = :userId AND status = 'PENDING'
            UNION
            SELECT receiver_id FROM friend_requests WHERE sender_id = :userId AND status = 'PENDING'
          )
          AND u.id NOT IN (
            SELECT blocked_id FROM blocks WHERE blocker_id = :userId
            UNION
            SELECT blocker_id FROM blocks WHERE blocked_id = :userId
          )
          AND (
            mutual_friends.count > 0 OR
            (p.location_city IS NOT NULL AND LOWER(p.location_city) = LOWER(:targetCity)) OR
            common_groups.count > 0 OR
            shared_comments.count > 0 OR
            shared_reactions.count > 0 OR
            shared_networks.count > 0 OR
            (${schools.length > 0 ? educationScoreSql : '1=0'}) OR
            (${companies.length > 0 ? workScoreSql : '1=0'})
          )
      ) AS tmp
    `;

    const parseNamedParameters = (sql: string, params: Record<string, any>) => {
      const values: any[] = [];
      const query = sql.replace(/:([a-zA-Z0-9_]+)/g, (match, name) => {
        if (name in params) {
          values.push(params[name]);
          return '?';
        }
        return match;
      });
      return { query, values };
    };

    const parsedQuery = parseNamedParameters(rawQuery, queryParams);
    const parsedCount = parseNamedParameters(countQuery, queryParams);

    const data = await this.friendRepo.manager.query(parsedQuery.query, parsedQuery.values);
    const countResult = await this.friendRepo.manager.query(parsedCount.query, parsedCount.values);
    const total = countResult[0] ? parseInt(countResult[0].total, 10) : 0;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
