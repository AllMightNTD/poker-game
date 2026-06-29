import { Inject, Injectable } from '@nestjs/common';
import { IChatRepository } from '../../domain/repositories/chat.repository.interface';

@Injectable()
export class GetMediaUseCase {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(
    conversationId: string,
    page: number,
    limit: number,
    type?: string,
  ) {
    return this.chatRepository.getMedia(conversationId, page, limit, type);
  }
}
