import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Group } from 'src/v1/entities/group.entity';
import { GroupMember } from 'src/v1/entities/group_member.entity';

@Injectable()
export class SearchGroupsUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(q: string, userId: string) {
    const groupRepo = this.dataSource.getRepository(Group);
    const memberRepo = this.dataSource.getRepository(GroupMember);

    const queryBuilder = groupRepo.createQueryBuilder('group');
    if (q) {
      queryBuilder.where('group.name LIKE :q OR group.description LIKE :q', {
        q: `%${q}%`,
      });
    }
    const groups = await queryBuilder
      .orderBy('group.created_at', 'DESC')
      .getMany();

    const userMemberships = await memberRepo.find({
      where: { user_id: userId },
    });
    const membershipMap = new Map(
      userMemberships.map((m) => [m.group_id, m.status]),
    );

    return groups.map((group) => ({
      ...group,
      user_status: membershipMap.get(group.id) || 'NONE',
    }));
  }
}
