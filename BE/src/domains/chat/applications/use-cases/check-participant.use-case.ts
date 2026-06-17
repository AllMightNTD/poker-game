import { Inject, Injectable } from '@nestjs/common';
import { IChatRepository } from '../../domain/repositories/chat.repository.interface';

@Injectable()
export class CheckParticipantUseCase {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(userId: string, conversationId: string) {
    return this.chatRepository.checkParticipant(userId, conversationId);
  }
}
