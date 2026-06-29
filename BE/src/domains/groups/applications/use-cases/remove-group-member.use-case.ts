import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Group } from 'src/v1/entities/group.entity';
import { GroupMember } from 'src/v1/entities/group_member.entity';
import { GroupMemberStatus, GroupMemberRole } from 'src/constants/enums';

@Injectable()
export class RemoveGroupMemberUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(groupId: string, memberId: string, adminId: string) {
    await this.checkAdmin(groupId, adminId);
    const groupRepo = this.dataSource.getRepository(Group);
    const memberRepo = this.dataSource.getRepository(GroupMember);

    const member = await memberRepo.findOne({
      where: { group_id: groupId, user_id: memberId },
    });
    if (!member) throw new NotFoundException('Member not found');

    await memberRepo.remove(member);
    if (member.status === GroupMemberStatus.ACTIVE) {
      await groupRepo.decrement({ id: groupId }, 'member_count', 1);
    }
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
