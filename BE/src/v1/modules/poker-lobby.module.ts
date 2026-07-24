import { BullModule } from '@nestjs/bullmq';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotModule } from '../bots/bot.module';
import { LobbyController } from '../controllers/lobby.controller';
import { ProvablyFairController } from '../controllers/provably-fair.controller';
import { RoomsController } from '../controllers/rooms.controller';
import { UserController } from '../controllers/user.controller';
import { WalletController } from '../controllers/wallet.controller';
import { PokerGameHistoryProcessor } from '../engines/poker-game-history.processor';
import { PokerTable } from '../entities/poker_table.entity';
import { ProvablyFairAudit } from '../entities/provably_fair_audit.entity';
import { SystemRevenue } from '../entities/system_revenue.entity';
import { TableSession } from '../entities/table_session.entity';
import { Wallet } from '../entities/wallet.entity';
import { PokerLobbyGateway } from '../gateways/poker-lobby.gateway';
import { AntiCollusionService } from '../services/anti-collusion.service';
import { AuditService } from '../services/audit.service';
import { PokerGameService } from '../services/poker-game.service';
import { AutoHandScheduler } from '../services/auto-hand-scheduler.service';
import { PokerLobbyService } from '../services/poker-lobby.service';
import { PokerStateService } from '../services/poker-state.service';
import { PokerStreamService } from '../services/poker-stream.service';
import { ProvablyFairService } from '../services/provably-fair.service';
import { TournamentService } from '../services/tournament.service';
import { WalletService } from '../services/wallet.service';

import { RoomCleanupService } from '../services/poker-cleanup.service';

@Module({
  imports: [
    forwardRef(() => BotModule),
    ConfigModule,
    TypeOrmModule.forFeature([
      PokerTable,
      TableSession,
      Wallet,
      SystemRevenue,
      ProvablyFairAudit,
    ]),
    BullModule.registerQueue({
      name: 'poker-game-history',
    }),
  ],
  controllers: [
    LobbyController,
    WalletController,
    RoomsController,
    UserController,
    ProvablyFairController,
  ],
  providers: [
    PokerLobbyService,
    PokerLobbyGateway,
    PokerStateService,
    PokerStreamService,
    PokerGameService,
    AutoHandScheduler,
    RoomCleanupService,
    WalletService,
    AuditService,
    TournamentService,
    ProvablyFairService,
    AntiCollusionService,
    PokerGameHistoryProcessor,
  ],
  exports: [
    PokerLobbyService,
    PokerLobbyGateway,
    PokerStateService,
    PokerStreamService,
    PokerGameService,
    AutoHandScheduler,
    RoomCleanupService,
    WalletService,
    AuditService,
    TournamentService,
    ProvablyFairService,
    AntiCollusionService,
    BullModule,
  ],
})
export class PokerLobbyModule {}
