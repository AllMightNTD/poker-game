import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Group } from 'src/v1/entities/group.entity';
import { GroupMember } from 'src/v1/entities/group_member.entity';
import {
  GroupPrivacy,
  GroupMemberStatus,
  GroupMemberRole,
} from 'src/constants/enums';

@Injectable()
export class JoinGroupUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(groupId: string, userId: string) {
    const groupRepo = this.dataSource.getRepository(Group);
    const memberRepo = this.dataSource.getRepository(GroupMember);

    const group = await groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new BadRequestException('Group not found');
    const existing = await memberRepo.findOne({
      where: { group_id: groupId, user_id: userId },
    });

    if (existing) {
      throw new BadRequestException('User is already a member or pending');
    }

    const status =
      group.privacy === GroupPrivacy.PUBLIC
        ? GroupMemberStatus.ACTIVE
        : GroupMemberStatus.PENDING;

    const member = memberRepo.create({
      group_id: groupId,
      user_id: userId,
      role: GroupMemberRole.MEMBER,
      status,
    });

    if (status === GroupMemberStatus.ACTIVE) {
      await groupRepo.increment({ id: groupId }, 'member_count', 1);
    }

    return memberRepo.save(member);
  }
}
