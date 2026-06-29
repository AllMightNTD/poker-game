import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Group } from 'src/v1/entities/group.entity';
import { GroupMember } from 'src/v1/entities/group_member.entity';
import { GroupMemberRole } from 'src/constants/enums';
import { UpdateGroupDto } from '../dtos/update-group.dto';

@Injectable()
export class UpdateGroupUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(id: string, updateGroupDto: UpdateGroupDto, userId: string) {
    const groupRepo = this.dataSource.getRepository(Group);
    const group = await groupRepo.findOne({ where: { id } });
    if (!group) throw new NotFoundException('Group not found');

    await this.checkAdmin(id, userId);
    Object.assign(group, updateGroupDto);
    return groupRepo.save(group);
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
