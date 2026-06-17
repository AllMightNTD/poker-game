import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { MessagePermission } from 'src/constants/enums';

@Injectable()
export class UpdateMessagePermissionUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, permission: MessagePermission) {
    return this.userRepository.updateMessagePermission(userId, permission);
  }
}
