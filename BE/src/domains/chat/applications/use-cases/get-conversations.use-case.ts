import { Inject, Injectable } from '@nestjs/common';
import { IChatRepository } from '../../domain/repositories/chat.repository.interface';

@Injectable()
export class GetConversationsUseCase {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(userId: string, page: number, limit: number, search?: string, tab?: string) {
    return this.chatRepository.getConversations(userId, page, limit, search, tab);
  }
}
