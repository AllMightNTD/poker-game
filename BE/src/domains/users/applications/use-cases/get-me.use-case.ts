import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findByIdWithRelations(userId, [
      'profile',
      'settings',
      'stats',
      'user_roles',
      'user_roles.role',
      'user_roles.role.role_permissions',
      'user_roles.role.role_permissions.permission',
    ]);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    delete user.password;
    return user;
  }
}
