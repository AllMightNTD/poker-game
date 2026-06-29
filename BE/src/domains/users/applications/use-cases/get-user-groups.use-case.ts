import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMember } from 'src/v1/entities/group_member.entity';
import { GroupMemberRole, GroupMemberStatus } from 'src/constants/enums';

export interface GetUserGroupsResult {
  data: any[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

@Injectable()
export class GetUserGroupsUseCase {
  constructor(
    @InjectRepository(GroupMember)
    private readonly groupMemberRepository: Repository<GroupMember>,
  ) {}

  async execute(
    targetUserId: string,
    filter: 'all' | 'managed' | 'owned',
    page: number = 1,
    limit: number = 20,
  ): Promise<GetUserGroupsResult> {
    const skip = (page - 1) * limit;

    const query = this.groupMemberRepository
      .createQueryBuilder('gm')
      .innerJoinAndSelect('gm.group', 'group')
      .leftJoinAndSelect('group.creator', 'creator')
      .leftJoinAndSelect('creator.profile', 'creatorProfile')
      .where('gm.user_id = :userId', { userId: targetUserId })
      .andWhere('gm.status = :status', { status: GroupMemberStatus.ACTIVE });

    if (filter === 'managed') {
      query.andWhere('gm.role IN (:...roles)', {
        roles: [GroupMemberRole.ADMIN, GroupMemberRole.MODERATOR],
      });
    } else if (filter === 'owned') {
      query.andWhere('group.created_by = :userId', { userId: targetUserId });
    }

    query.orderBy('gm.joined_at', 'DESC').skip(skip).take(limit);

    const [items, total] = await query.getManyAndCount();

    const data = items.map((gm) => ({
      id: gm.group.id,
      name: gm.group.name,
      slug: gm.group.slug,
      description: gm.group.description,
      avatar_url: gm.group.avatar_url,
      cover_url: gm.group.cover_url,
      privacy: gm.group.privacy,
      member_count: gm.group.member_count,
      post_count: gm.group.post_count,
      role: gm.role,
      joined_at: gm.joined_at,
      is_owner: gm.group.created_by === targetUserId,
    }));

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
