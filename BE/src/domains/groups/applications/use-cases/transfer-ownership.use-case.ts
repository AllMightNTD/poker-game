import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Group } from 'src/v1/entities/group.entity';
import { GroupMember } from 'src/v1/entities/group_member.entity';
import { GroupMemberRole } from 'src/constants/enums';

@Injectable()
export class TransferOwnershipUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(groupId: string, currentOwnerId: string, newOwnerId: string) {
    const groupRepo = this.dataSource.getRepository(Group);
    const memberRepo = this.dataSource.getRepository(GroupMember);

    const group = await groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');

    if (group.created_by !== currentOwnerId) {
      throw new ForbiddenException('You are not the owner of this group');
    }

    const newOwner = await memberRepo.findOne({
      where: { group_id: groupId, user_id: newOwnerId },
    });
    if (!newOwner) {
      throw new BadRequestException(
        'Target user is not a member of this group',
      );
    }

    // Transfer role (Promote to Admin optionally, but Owner is defined by created_by)
    newOwner.role = GroupMemberRole.ADMIN;
    await memberRepo.save(newOwner);

    // Remove the old owner from the group
    const currentOwner = await memberRepo.findOne({
      where: { group_id: groupId, user_id: currentOwnerId },
    });
    if (currentOwner) {
      await memberRepo.remove(currentOwner);
    }

    // Update group creator to the new owner
    group.created_by = newOwnerId;
    group.member_count = Math.max(0, group.member_count - 1); // since old owner left
    await groupRepo.save(group);

    return { success: true };
  }
}
