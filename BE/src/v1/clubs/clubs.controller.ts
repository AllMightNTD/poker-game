import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
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
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new club (A-BE-04)' })
  async create(@Req() req: any, @Body() dto: CreateClubDto) {
    return this.clubsService.create(req.user.id, dto);
  }

  @Post('join')
  @ApiOperation({ summary: 'Join a club using invite code (A-BE-05)' })
  async joinByCode(@Req() req: any, @Body() dto: JoinClubDto) {
    return this.clubsService.joinByCode(req.user.id, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Get list of clubs I joined (A-BE-06)' })
  async findMine(@Req() req: any) {
    return this.clubsService.findMine(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get club details (A-BE-07)' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.clubsService.findOne(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update club settings' })
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateClubDto,
  ) {
    return this.clubsService.update(id, req.user.id, dto);
  }

  @Put(':id/members/:userId/role')
  @ApiOperation({ summary: 'Update member role (A-BE-08)' })
  async updateMemberRole(
    @Req() req: any,
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.clubsService.updateMemberRole(
      id,
      req.user.id,
      targetUserId,
      dto,
    );
  }

  @Post(':id/credit')
  @ApiOperation({ summary: 'Transfer credit to member (A-BE-09)' })
  async transferCredit(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: TransferCreditDto,
  ) {
    return this.clubsService.transferCredit(id, req.user.id, dto);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get club statistics (A-BE-10)' })
  async getStats(@Req() req: any, @Param('id') id: string) {
    return this.clubsService.getStats(id, req.user.id);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Kick or ban a member' })
  async removeMember(
    @Req() req: any,
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @Query('ban') ban: string,
  ) {
    return this.clubsService.removeMember(
      id,
      req.user.id,
      targetUserId,
      ban === 'true',
    );
  }

  @Delete(':id/leave')
  @ApiOperation({ summary: 'Leave a club' })
  async leaveClub(@Req() req: any, @Param('id') id: string) {
    return this.clubsService.leaveClub(id, req.user.id);
  }
}
