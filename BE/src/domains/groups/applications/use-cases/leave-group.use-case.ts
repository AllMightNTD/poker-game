import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Group } from 'src/v1/entities/group.entity';
import { GroupMember } from 'src/v1/entities/group_member.entity';
import { GroupMemberRole } from 'src/constants/enums';

@Injectable()
export class LeaveGroupUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(groupId: string, currentUserId: string) {
    const groupRepo = this.dataSource.getRepository(Group);
    const memberRepo = this.dataSource.getRepository(GroupMember);

    const group = await groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');

    const member = await memberRepo.findOne({
      where: { group_id: groupId, user_id: currentUserId },
    });
    if (!member)
      throw new BadRequestException('You are not a member of this group');

    if (group.created_by === currentUserId) {
      throw new BadRequestException(
        'Owner cannot leave the group. Please transfer ownership first.',
      );
    }

    await memberRepo.remove(member);
    group.member_count = Math.max(0, group.member_count - 1);
    await groupRepo.save(group);

    return { success: true };
  }
}
