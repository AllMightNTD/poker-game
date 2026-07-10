import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClubMember } from '../../entities/club_member.entity';

/**
 * Validates if the current user is an active member of the club specified in the request.
 * Assumes the request has `params.clubId` or `body.club_id`.
 */
@Injectable()
export class ClubMemberGuard implements CanActivate {
  constructor(
    @InjectRepository(ClubMember)
    private readonly memberRepo: Repository<ClubMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const clubId = request.params?.clubId || request.body?.club_id;

    if (!userId) {
      throw new ForbiddenException('User is not authenticated.');
    }

    // If there's no club context in the request, we pass (or you could throw depending on usage)
    if (!clubId) {
      return true;
    }

    const member = await this.memberRepo.findOne({
      where: { club_id: clubId, user_id: userId, status: 'active' },
    });

    if (!member) {
      throw new ForbiddenException(
        'You must be a member of this club to perform this action.',
      );
    }

    // Optionally attach member object to request for downstream use
    request.clubMember = member;

    return true;
  }
}
