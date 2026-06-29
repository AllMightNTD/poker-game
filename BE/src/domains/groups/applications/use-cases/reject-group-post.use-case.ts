import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Post } from 'src/v1/entities/post.entity';
import { GroupMember } from 'src/v1/entities/group_member.entity';
import { PostStatus, GroupMemberRole } from 'src/constants/enums';

@Injectable()
export class RejectGroupPostUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(groupId: string, postId: string, adminId: string) {
    await this.checkAdmin(groupId, adminId);
    const postRepo = this.dataSource.getRepository(Post);

    const post = await postRepo.findOne({
      where: { id: postId, group_id: groupId },
    });
    if (!post) throw new NotFoundException('Post not found');

    post.status = PostStatus.REJECTED;
    return postRepo.save(post);
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
