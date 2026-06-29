import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Follow } from 'src/v1/entities/follow.entity';
import { FollowingType, FollowStatus } from 'src/constants/enums';
import { UserStats } from 'src/v1/entities/user_stats.entity';

@Injectable()
export class FollowUserUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const followRepo = this.dataSource.getRepository(Follow);
    const existingFollow = await followRepo.findOne({
      where: {
        follower_id: followerId,
        following_entity_id: followingId,
        following_type: FollowingType.USER,
      },
    });

    if (existingFollow) {
      return { success: true, message: 'Already following' };
    }

    const newFollow = followRepo.create({
      follower_id: followerId,
      following_entity_id: followingId,
      following_type: FollowingType.USER,
      status: FollowStatus.ACTIVE,
    });

    await followRepo.save(newFollow);

    // Update stats
    const statsRepo = this.dataSource.getRepository(UserStats);

    // Increment following count for follower
    await statsRepo.increment({ user_id: followerId }, 'total_following', 1);

    // Increment follower count for target
    await statsRepo.increment({ user_id: followingId }, 'total_followers', 1);

    return { success: true };
  }
}
