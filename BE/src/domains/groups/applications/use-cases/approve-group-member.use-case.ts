import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Group } from 'src/v1/entities/group.entity';
import { GroupMember } from 'src/v1/entities/group_member.entity';
import { GroupMemberStatus, GroupMemberRole } from 'src/constants/enums';

@Injectable()
export class ApproveGroupMemberUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(groupId: string, memberId: string, adminId: string) {
    await this.checkAdmin(groupId, adminId);
    const groupRepo = this.dataSource.getRepository(Group);
    const memberRepo = this.dataSource.getRepository(GroupMember);

    const member = await memberRepo.findOne({
      where: { group_id: groupId, user_id: memberId },
    });
    if (!member) throw new NotFoundException('Member not found');

    if (member.status !== GroupMemberStatus.PENDING) {
      throw new BadRequestException('Member is not pending');
    }

    member.status = GroupMemberStatus.ACTIVE;
    await groupRepo.increment({ id: groupId }, 'member_count', 1);
    return memberRepo.save(member);
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
