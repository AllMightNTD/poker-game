import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentRakeback } from '../entities/agent_rakeback.entity';
import { Club } from '../entities/club.entity';
import { ClubMember } from '../entities/club_member.entity';
import { PokerTable } from '../entities/poker_table.entity';
import { ClubsController } from './clubs.controller';
import { ClubsService } from './clubs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Club, ClubMember, AgentRakeback, PokerTable]),
  ],
  controllers: [ClubsController],
  providers: [ClubsService],
  exports: [ClubsService],
})
export class ClubsModule {}
