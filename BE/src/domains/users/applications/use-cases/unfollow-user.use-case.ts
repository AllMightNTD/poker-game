import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Follow } from 'src/v1/entities/follow.entity';
import { FollowingType } from 'src/constants/enums';
import { UserStats } from 'src/v1/entities/user_stats.entity';

@Injectable()
export class UnfollowUserUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot unfollow yourself');
    }

    const followRepo = this.dataSource.getRepository(Follow);
    const existingFollow = await followRepo.findOne({
      where: {
        follower_id: followerId,
        following_entity_id: followingId,
        following_type: FollowingType.USER as any,
      },
    });

    if (!existingFollow) {
      return { success: true, message: 'Not following' };
    }

    await followRepo.delete({
      follower_id: followerId,
      following_entity_id: followingId,
      following_type: FollowingType.USER as any,
    });

    // Update stats
    const statsRepo = this.dataSource.getRepository(UserStats);

    // Decrement following count for follower
    await statsRepo.decrement({ user_id: followerId }, 'total_following', 1);

    // Decrement follower count for target
    await statsRepo.decrement({ user_id: followingId }, 'total_followers', 1);

    return { success: true };
  }
}
