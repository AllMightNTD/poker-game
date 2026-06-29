import { Inject, Injectable } from '@nestjs/common';
import { IFriendRepository } from '../../domain/repositories/friend.repository.interface';

@Injectable()
export class GetMutualFriendsUseCase {
  constructor(
    @Inject('IFriendRepository')
    private readonly friendRepository: IFriendRepository,
  ) {}

  async execute(
    currentUserId: string,
    targetUserId: string,
    page: number,
    limit: number,
  ) {
    return this.friendRepository.getMutualFriends(
      currentUserId,
      targetUserId,
      page,
      limit,
    );
  }
}
