import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GroupMember } from 'src/v1/entities/group_member.entity';
import { GroupMemberStatus } from 'src/constants/enums';

@Injectable()
export class GetGroupMembersUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(groupId: string, status?: GroupMemberStatus) {
    const memberRepo = this.dataSource.getRepository(GroupMember);
    const whereCondition: any = { group_id: groupId };
    if (status) whereCondition.status = status;
    return memberRepo.find({ where: whereCondition, relations: ['user'] });
  }
}
