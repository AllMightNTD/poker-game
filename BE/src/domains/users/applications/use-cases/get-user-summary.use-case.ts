import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class GetUserSummaryUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findByIdWithRelations(userId, [
      'stats',
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const stats = user.stats || {};

    return {
      postCount: stats.total_posts || 0,
      friendCount: stats.total_friends || 0,
      followerCount: stats.total_followers || 0,
      followingCount: stats.total_following || 0,
      photoCount: stats.total_media || 0,
      // Extrapolate other generic stats if needed
    };
  }
}
