import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Group } from 'src/v1/entities/group.entity';
import { GroupMember } from 'src/v1/entities/group_member.entity';

@Injectable()
export class GetGroupSuggestionsUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(userId: string) {
    const groupRepo = this.dataSource.getRepository(Group);
    const memberRepo = this.dataSource.getRepository(GroupMember);

    const userMemberships = await memberRepo.find({
      where: { user_id: userId },
    });
    const joinedGroupIds = userMemberships.map((m) => m.group_id);

    const queryBuilder = groupRepo.createQueryBuilder('group');
    if (joinedGroupIds.length > 0) {
      queryBuilder.where('group.id NOT IN (:...joinedGroupIds)', {
        joinedGroupIds,
      });
    }
    const groups = await queryBuilder
      .orderBy('group.member_count', 'DESC')
      .take(10)
      .getMany();

    return groups.map((group) => ({
      ...group,
      user_status: 'NONE',
    }));
  }
}
