import { Inject, Injectable } from '@nestjs/common';
import { IChatRepository } from '../../domain/repositories/chat.repository.interface';

@Injectable()
export class TogglePinConversationUseCase {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(userId: string, conversationId: string, isPinned: boolean) {
    return this.chatRepository.togglePinConversation(
      userId,
      conversationId,
      isPinned,
    );
  }
}
