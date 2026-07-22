import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { ClubsService } from './clubs.service';
import {
  CreateClubDto,
  JoinClubDto,
  TransferCreditDto,
  UpdateClubDto,
  UpdateMemberRoleDto,
} from './dto/club.dto';

@ApiTags('Clubs')
@Controller('clubs')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new club (A-BE-04)' })
  async create(@Request() req, @Body() dto: CreateClubDto) {
    return this.clubsService.create(req.user.sub, dto);
  }

  @Post('join')
  @ApiOperation({ summary: 'Join a club using invite code (A-BE-05)' })
  async joinByCode(@Request() req: any, @Body() dto: JoinClubDto) {
    return this.clubsService.joinByCode(req.user.sub, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Get list of clubs I joined (A-BE-06)' })
  async findMine(@Request() req: any) {
    return this.clubsService.findMine(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get club details (A-BE-07)' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.clubsService.findOne(id, req.user.sub);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update club settings' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateClubDto,
  ) {
    return this.clubsService.update(id, req.user.sub, dto);
  }

  @Put(':id/members/:userId/role')
  @ApiOperation({ summary: 'Update member role (A-BE-08)' })
  async updateMemberRole(
    @Request() req: any,
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.clubsService.updateMemberRole(
      id,
      req.user.sub,
      targetUserId,
      dto,
    );
  }

  @Post(':id/credit')
  @ApiOperation({ summary: 'Transfer credit to member (A-BE-09)' })
  async transferCredit(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: TransferCreditDto,
  ) {
    return this.clubsService.transferCredit(id, req.user.sub, dto);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get club statistics (A-BE-10)' })
  async getStats(@Request() req: any, @Param('id') id: string) {
    return this.clubsService.getStats(id, req.user.sub);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Kick or ban a member' })
  async removeMember(
    @Request() req: any,
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @Query('ban') ban: string,
  ) {
    return this.clubsService.removeMember(
      id,
      req.user.sub,
      targetUserId,
      ban === 'true',
    );
  }

  @Delete(':id/leave')
  @ApiOperation({ summary: 'Leave a club' })
  async leaveClub(@Request() req: any, @Param('id') id: string) {
    return this.clubsService.leaveClub(id, req.user.sub);
  }
}
