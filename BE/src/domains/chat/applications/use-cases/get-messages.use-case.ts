import { Inject, Injectable } from '@nestjs/common';
import { IChatRepository } from '../../domain/repositories/chat.repository.interface';

@Injectable()
export class GetMessagesUseCase {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(conversationId: string, page: number, limit: number) {
    return this.chatRepository.getMessages(conversationId, page, limit);
  }
}
