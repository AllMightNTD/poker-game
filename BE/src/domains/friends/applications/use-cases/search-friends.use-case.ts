import { Inject, Injectable } from '@nestjs/common';
import { IFriendRepository } from '../../domain/repositories/friend.repository.interface';

@Injectable()
export class SearchFriendsUseCase {
  constructor(
    @Inject('IFriendRepository')
    private readonly friendRepository: IFriendRepository,
  ) {}

  async execute(userId: string, keyword: string, page: number, limit: number) {
    return this.friendRepository.searchFriends(userId, keyword, page, limit);
  }
}
