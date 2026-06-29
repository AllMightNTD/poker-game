import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Group } from 'src/v1/entities/group.entity';
import { GroupMember } from 'src/v1/entities/group_member.entity';
import { GroupMemberRole, GroupMemberStatus } from 'src/constants/enums';
import { CreateGroupDto } from '../dtos/create-group.dto';

@Injectable()
export class CreateGroupUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(createGroupDto: CreateGroupDto, userId: string) {
    const groupRepo = this.dataSource.getRepository(Group);
    const memberRepo = this.dataSource.getRepository(GroupMember);

    const existingSlug = await groupRepo.findOne({
      where: { slug: createGroupDto.slug },
    });
    if (existingSlug) {
      throw new BadRequestException('Group slug already exists');
    }

    const group = groupRepo.create({
      ...createGroupDto,
      created_by: userId,
      member_count: 1,
    });
    const savedGroup = await groupRepo.save(group);

    const member = memberRepo.create({
      group_id: savedGroup.id,
      user_id: userId,
      role: GroupMemberRole.ADMIN,
      status: GroupMemberStatus.ACTIVE,
    });
    await memberRepo.save(member);

    return savedGroup;
  }
}
