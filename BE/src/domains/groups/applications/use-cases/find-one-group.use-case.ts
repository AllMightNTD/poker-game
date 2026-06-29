import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Group } from 'src/v1/entities/group.entity';
import { GroupMember } from 'src/v1/entities/group_member.entity';
import { GroupPrivacy, GroupMemberStatus } from 'src/constants/enums';

@Injectable()
export class FindOneGroupUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(id: string, currentUserId: string) {
    const groupRepo = this.dataSource.getRepository(Group);
    const group = await groupRepo.findOne({ where: { id } });
    if (!group) throw new NotFoundException('Group not found');

    const memberRepo = this.dataSource.getRepository(GroupMember);
    const member = await memberRepo.findOne({
      where: { group_id: id, user_id: currentUserId },
    });

    let currentUserRole = 'NONE';
    let isMember = false;

    if (group.created_by === currentUserId) {
      currentUserRole = 'OWNER';
      isMember = true;
    } else if (member && member.status === GroupMemberStatus.ACTIVE) {
      currentUserRole = member.role;
      isMember = true;
    } else if (member && member.status === GroupMemberStatus.PENDING) {
      currentUserRole = 'PENDING';
    }

    const canViewPosts = group.privacy === GroupPrivacy.PUBLIC || isMember;

    return {
      ...group,
      currentUserRole,
      isMember,
      canViewPosts,
    };
  }
}
