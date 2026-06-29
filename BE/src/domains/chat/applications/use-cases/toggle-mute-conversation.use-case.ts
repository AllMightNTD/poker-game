import { Inject, Injectable } from '@nestjs/common';
import { IChatRepository } from '../../domain/repositories/chat.repository.interface';

@Injectable()
export class ToggleMuteConversationUseCase {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(userId: string, conversationId: string, isMuted: boolean) {
    return this.chatRepository.toggleMuteConversation(
      userId,
      conversationId,
      isMuted,
    );
  }
}
