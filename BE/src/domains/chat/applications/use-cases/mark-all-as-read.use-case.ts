import { Inject, Injectable } from '@nestjs/common';
import { IChatRepository } from '../../domain/repositories/chat.repository.interface';

@Injectable()
export class MarkAllAsReadUseCase {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(userId: string) {
    return this.chatRepository.markAllAsRead(userId);
  }
}
