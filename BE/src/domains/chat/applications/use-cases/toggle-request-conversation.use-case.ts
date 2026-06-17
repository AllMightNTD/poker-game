import { Inject, Injectable } from '@nestjs/common';
import { IChatRepository } from '../../domain/repositories/chat.repository.interface';

@Injectable()
export class ToggleRequestConversationUseCase {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(userId: string, conversationId: string, isRequest: boolean) {
    return this.chatRepository.toggleRequestConversation(userId, conversationId, isRequest);
  }
}
