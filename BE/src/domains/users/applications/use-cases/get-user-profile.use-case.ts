import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, targetUserId: string) {
    const user = await this.userRepository.findByIdWithRelations(targetUserId, [
      'profile',
      'stats',
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hide sensitive fields
    delete user.password;
    delete user.refresh_token;

    return user;
  }
}
