import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Post } from 'src/v1/entities/post.entity';
import { Group } from 'src/v1/entities/group.entity';
import { GroupMember } from 'src/v1/entities/group_member.entity';
import {
  PostStatus,
  GroupPrivacy,
  GroupMemberStatus,
} from 'src/constants/enums';

@Injectable()
export class GetGroupPostsUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(
    groupId: string,
    currentUserId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const groupRepo = this.dataSource.getRepository(Group);
    const group = await groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');

    const memberRepo = this.dataSource.getRepository(GroupMember);
    const member = await memberRepo.findOne({
      where: { group_id: groupId, user_id: currentUserId },
    });
    const isMember = member && member.status === GroupMemberStatus.ACTIVE;

    if (group.privacy !== GroupPrivacy.PUBLIC && !isMember) {
      throw new ForbiddenException(
        'This content is only visible to group members.',
      );
    }

    const postRepo = this.dataSource.getRepository(Post);
    const skip = (page - 1) * limit;

    const [posts, total] = await postRepo.findAndCount({
      where: { group_id: groupId, status: PostStatus.APPROVED },
      relations: ['user', 'user.profile', 'media'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
