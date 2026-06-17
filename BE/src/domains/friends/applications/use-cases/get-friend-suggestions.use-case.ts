import { Inject, Injectable } from '@nestjs/common';
import { IFriendRepository } from '../../domain/repositories/friend.repository.interface';

@Injectable()
export class GetFriendSuggestionsUseCase {
  constructor(
    @Inject('IFriendRepository')
    private readonly friendRepository: IFriendRepository,
  ) {}

  async execute(userId: string, page = 1, limit = 10) {
    return this.friendRepository.getFriendSuggestions(userId, page, limit);
  }
}
