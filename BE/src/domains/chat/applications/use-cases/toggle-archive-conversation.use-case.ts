import { Inject, Injectable } from '@nestjs/common';
import { IChatRepository } from '../../domain/repositories/chat.repository.interface';

@Injectable()
export class ToggleArchiveConversationUseCase {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(userId: string, conversationId: string, isArchived: boolean) {
    return this.chatRepository.toggleArchiveConversation(userId, conversationId, isArchived);
  }
}
