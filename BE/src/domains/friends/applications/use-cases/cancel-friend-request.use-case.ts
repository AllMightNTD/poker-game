import { Inject, Injectable } from '@nestjs/common';
import { IFriendRepository } from '../../domain/repositories/friend.repository.interface';

@Injectable()
export class CancelFriendRequestUseCase {
  constructor(
    @Inject('IFriendRepository')
    private readonly friendRepository: IFriendRepository,
  ) {}

  async execute(userId: string, requestId: string) {
    return this.friendRepository.cancelFriendRequest(userId, requestId);
  }
}
