import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';
import { AgentRakeback } from '../entities/agent_rakeback.entity';
import { Club } from '../entities/club.entity';
import { ClubMember } from '../entities/club_member.entity';
import { PokerTable } from '../entities/poker_table.entity';
import { PokerHandCompletedEvent } from '../services/audit.service';
import {
  CreateClubDto,
  JoinClubDto,
  TransferCreditDto,
  UpdateClubDto,
  UpdateMemberRoleDto,
} from './dto/club.dto';

@Injectable()
export class ClubsService {
  constructor(
    @InjectRepository(Club)
    private readonly clubRepo: Repository<Club>,
    @InjectRepository(ClubMember)
    private readonly memberRepo: Repository<ClubMember>,
    @InjectRepository(AgentRakeback)
    private readonly rakebackRepo: Repository<AgentRakeback>,
    @InjectRepository(PokerTable)
    private readonly tableRepo: Repository<PokerTable>,
    private readonly dataSource: DataSource,
  ) {}

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private generateCode(length = 6): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  private async generateUniqueCode(): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt++) {
      const code = this.generateCode(6);
      const exists = await this.clubRepo.findOne({ where: { code } });
      if (!exists) return code;
    }
    throw new ConflictException(
      'Could not generate a unique club code. Try again.',
    );
  }

  private async assertMembership(
    clubId: string,
    userId: string,
    allowedRoles?: Array<'OWNER' | 'AGENT' | 'MEMBER'>,
  ): Promise<ClubMember> {
    const member = await this.memberRepo.findOne({
      where: { club_id: clubId, user_id: userId, status: 'active' },
    });
    if (!member)
      throw new ForbiddenException('You are not a member of this club.');
    if (allowedRoles && !allowedRoles.includes(member.role)) {
      throw new ForbiddenException(
        `Required role: ${allowedRoles.join(' or ')}.`,
      );
    }
    return member;
  }

  // ─── A-BE-04: Create club ────────────────────────────────────────────────────

  async create(ownerId: string, dto: CreateClubDto): Promise<Club> {
    const code = await this.generateUniqueCode();

    return this.dataSource.transaction(async (em) => {
      const club = em.create(Club, {
        name: dto.name,
        code,
        owner_id: ownerId,
        description: dto.description ?? null,
        max_members: dto.max_members ?? 50,
        club_rake_rate: dto.club_rake_rate ?? 5.0,
      });
      const saved = await em.save(club);

      // Owner automatically becomes OWNER member
      await em.save(ClubMember, {
        club_id: saved.id,
        user_id: ownerId,
        role: 'OWNER',
        status: 'active',
      });

      return saved;
    });
  }

  // ─── A-BE-05: Join club by invite code ──────────────────────────────────────

  async joinByCode(userId: string, dto: JoinClubDto): Promise<ClubMember> {
    const club = await this.clubRepo.findOne({
      where: { code: dto.code.toUpperCase(), status: 'active' },
    });
    if (!club)
      throw new NotFoundException('Invalid invite code or club is inactive.');

    const existingMember = await this.memberRepo.findOne({
      where: { club_id: club.id, user_id: userId },
    });
    if (existingMember) {
      if (existingMember.status === 'banned')
        throw new ForbiddenException('You have been banned from this club.');
      if (existingMember.status === 'active')
        throw new ConflictException('You are already a member of this club.');
      // pending → re-activate
      existingMember.status = 'active';
      return this.memberRepo.save(existingMember);
    }

    // Check capacity
    const count = await this.memberRepo.count({
      where: { club_id: club.id, status: 'active' },
    });
    if (count >= club.max_members) {
      throw new BadRequestException(
        'This club has reached its member capacity.',
      );
    }

    return this.memberRepo.save(
      this.memberRepo.create({
        club_id: club.id,
        user_id: userId,
        role: 'MEMBER',
        status: 'active',
      }),
    );
  }

  // ─── A-BE-06: My clubs ───────────────────────────────────────────────────────

  async findMine(
    userId: string,
  ): Promise<{ club: Club; role: string; credit_balance: string }[]> {
    const memberships = await this.memberRepo.find({
      where: { user_id: userId, status: 'active' },
      relations: ['club'],
      order: { joined_at: 'DESC' },
    });
    return memberships.map((m) => ({
      club: m.club,
      role: m.role,
      credit_balance: m.credit_balance,
    }));
  }

  // ─── A-BE-07: Club detail ───────────────────────────────────────────────────

  async findOne(
    clubId: string,
    requesterId: string,
  ): Promise<{
    club: Club;
    my_membership: ClubMember;
    members: ClubMember[];
    tables: PokerTable[];
    member_count: number;
  }> {
    const club = await this.clubRepo.findOne({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Club not found.');

    const my_membership = await this.assertMembership(clubId, requesterId);

    const [members, tables, member_count] = await Promise.all([
      this.memberRepo.find({
        where: { club_id: clubId, status: 'active' },
        relations: ['user'],
        order: { joined_at: 'DESC' },
        take: 50,
      }),
      this.tableRepo.find({
        where: { club_id: clubId, is_active: true },
        order: { created_at: 'DESC' },
      }),
      this.memberRepo.count({ where: { club_id: clubId, status: 'active' } }),
    ]);

    return { club, my_membership, members, tables, member_count };
  }

  // ─── A-BE-08: Update member role ───────────────────────────────────────────

  async updateMemberRole(
    clubId: string,
    requesterId: string,
    targetUserId: string,
    dto: UpdateMemberRoleDto,
  ): Promise<ClubMember> {
    // Only OWNER or AGENT can change roles
    await this.assertMembership(clubId, requesterId, ['OWNER', 'AGENT']);

    const target = await this.memberRepo.findOne({
      where: { club_id: clubId, user_id: targetUserId },
    });
    if (!target)
      throw new NotFoundException('Target member not found in this club.');
    if (target.role === 'OWNER')
      throw new ForbiddenException('Cannot change the owner role.');

    target.role = dto.role;
    return this.memberRepo.save(target);
  }

  // ─── A-BE-09: Transfer credit ───────────────────────────────────────────────

  async transferCredit(
    clubId: string,
    requesterId: string,
    dto: TransferCreditDto,
  ): Promise<ClubMember> {
    // Only OWNER or AGENT can transfer credits
    await this.assertMembership(clubId, requesterId, ['OWNER', 'AGENT']);

    return this.dataSource.transaction(async (em) => {
      const club = await em.findOne(Club, { where: { id: clubId } });
      if (!club) throw new NotFoundException('Club not found.');

      const target = await em.findOne(ClubMember, {
        where: {
          club_id: clubId,
          user_id: dto.member_user_id,
          status: 'active',
        },
      });
      if (!target)
        throw new NotFoundException('Target member not found in this club.');

      const amount = BigInt(dto.amount);
      const newBalance = BigInt(target.credit_balance) + amount;
      if (newBalance < 0n) {
        throw new BadRequestException(
          'Insufficient credit balance for this member.',
        );
      }

      const newPool = BigInt(club.credit_pool) - amount;
      if (amount > 0n && newPool < 0n) {
        throw new BadRequestException('Club credit pool is insufficient.');
      }

      target.credit_balance = newBalance.toString();
      club.credit_pool = newPool.toString();

      await em.save(club);
      return em.save(target);
    });
  }

  // ─── A-BE-10: Club stats ───────────────────────────────────────────────────

  async getStats(clubId: string, requesterId: string) {
    await this.assertMembership(clubId, requesterId, ['OWNER', 'AGENT']);

    const [memberCount, tableCount, rakebacks] = await Promise.all([
      this.memberRepo.count({ where: { club_id: clubId, status: 'active' } }),
      this.tableRepo.count({ where: { club_id: clubId, is_active: true } }),
      this.rakebackRepo.find({
        where: { club_id: clubId },
        order: { created_at: 'DESC' },
        take: 12,
      }),
    ]);

    const totalRakeAllTime = await this.memberRepo
      .createQueryBuilder('m')
      .select('SUM(CAST(m.total_rake_paid AS BIGINT))', 'total')
      .where('m.club_id = :clubId', { clubId })
      .getRawOne<{ total: string }>();

    return {
      member_count: memberCount,
      active_tables: tableCount,
      total_rake_all_time: totalRakeAllTime?.total ?? '0',
      rakebacks,
    };
  }

  // ─── Update club info ───────────────────────────────────────────────────────

  async update(
    clubId: string,
    requesterId: string,
    dto: UpdateClubDto,
  ): Promise<Club> {
    const club = await this.clubRepo.findOne({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Club not found.');
    await this.assertMembership(clubId, requesterId, ['OWNER']);

    Object.assign(club, dto);
    return this.clubRepo.save(club);
  }

  // ─── Remove member (ban or kick) ─────────────────────────────────────────────

  async removeMember(
    clubId: string,
    requesterId: string,
    targetUserId: string,
    ban = false,
  ) {
    await this.assertMembership(clubId, requesterId, ['OWNER', 'AGENT']);

    const target = await this.memberRepo.findOne({
      where: { club_id: clubId, user_id: targetUserId },
    });
    if (!target) throw new NotFoundException('Member not found.');
    if (target.role === 'OWNER')
      throw new ForbiddenException('Cannot remove the club owner.');

    if (ban) {
      target.status = 'banned';
      await this.memberRepo.save(target);
    } else {
      await this.memberRepo.remove(target);
    }
    return { success: true };
  }

  // ─── Leave club ──────────────────────────────────────────────────────────────

  async leaveClub(clubId: string, userId: string) {
    const member = await this.memberRepo.findOne({
      where: { club_id: clubId, user_id: userId },
    });
    if (!member)
      throw new NotFoundException('You are not a member of this club.');
    if (member.role === 'OWNER') {
      throw new ForbiddenException(
        'Owner cannot leave. Transfer ownership or close the club first.',
      );
    }
    await this.memberRepo.remove(member);
    return { success: true };
  }

  // ─── A-BE-12: Update total_rake_paid ──────────────────────────────────────────

  @OnEvent('poker.hand.completed')
  async handleHandCompleted(event: PokerHandCompletedEvent) {
    if (!event.userRakeShares || event.userRakeShares.length === 0) return;

    // We only want to update members if this table belongs to a club.
    const table = await this.tableRepo.findOne({ where: { id: event.roomId } });
    if (!table || !table.club_id) return;

    const userIds = event.userRakeShares.map((s) => s.userId);
    const members = await this.memberRepo.find({
      where: { club_id: table.club_id, user_id: In(userIds) },
    });

    if (members.length === 0) return;

    for (const member of members) {
      const share = event.userRakeShares.find(
        (s) => s.userId === member.user_id,
      );
      if (share && share.rakePaid) {
        member.total_rake_paid = (
          BigInt(member.total_rake_paid) + BigInt(share.rakePaid)
        ).toString();
      }
      member.total_hands += 1;
    }

    await this.memberRepo.save(members);
  }
}
