import { Injectable, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Post } from 'src/v1/entities/post.entity';
import { GroupMember } from 'src/v1/entities/group_member.entity';
import { PostStatus, GroupMemberRole } from 'src/constants/enums';

@Injectable()
export class GetPendingGroupPostsUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(groupId: string, adminId: string) {
    await this.checkAdmin(groupId, adminId);
    const postRepo = this.dataSource.getRepository(Post);
    return postRepo.find({
      where: { group_id: groupId, status: PostStatus.PENDING },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  private async checkAdmin(groupId: string, userId: string) {
    const memberRepo = this.dataSource.getRepository(GroupMember);
    const member = await memberRepo.findOne({
      where: { group_id: groupId, user_id: userId },
    });
    if (
      !member ||
      (member.role !== GroupMemberRole.ADMIN &&
        member.role !== GroupMemberRole.MODERATOR)
    ) {
      throw new ForbiddenException('Require Admin or Moderator role');
    }
  }
}
