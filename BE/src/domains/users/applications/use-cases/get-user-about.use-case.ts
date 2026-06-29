import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class GetUserAboutUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findByIdWithRelations(userId, [
      'profile',
    ]);

    if (!user || !user.profile) {
      throw new NotFoundException('User profile not found');
    }

    return {
      bio: user.profile.bio,
      birthday: user.profile.date_of_birth,
      gender: user.profile.gender,
      city: user.profile.location_city,
      hometown: user.profile.address,
      work: user.profile.work,
      education: user.profile.education,
      hobbies: user.profile.hobbies,
    };
  }
}
