import { Inject, Injectable } from '@nestjs/common';
import { IFriendRepository } from '../../domain/repositories/friend.repository.interface';

@Injectable()
export class GetSentRequestsUseCase {
  constructor(
    @Inject('IFriendRepository')
    private readonly friendRepository: IFriendRepository,
  ) {}

  async execute(userId: string, page: number, limit: number) {
    return this.friendRepository.getSentRequests(userId, page, limit);
  }
}
