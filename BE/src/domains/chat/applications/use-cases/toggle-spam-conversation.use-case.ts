import { Inject, Injectable } from '@nestjs/common';
import { IChatRepository } from '../../domain/repositories/chat.repository.interface';

@Injectable()
export class ToggleSpamConversationUseCase {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(userId: string, conversationId: string, isSpam: boolean) {
    return this.chatRepository.toggleSpamConversation(
      userId,
      conversationId,
      isSpam,
    );
  }
}
