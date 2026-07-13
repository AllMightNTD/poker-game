import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PokerTable } from '../entities/poker_table.entity';
import { TableSession } from '../entities/table_session.entity';
import { Wallet } from '../entities/wallet.entity';
import { SystemRevenue } from '../entities/system_revenue.entity';
import { ProvablyFairAudit } from '../entities/provably_fair_audit.entity';
import { LobbyController } from '../controllers/lobby.controller';
import { WalletController } from '../controllers/wallet.controller';
import { RoomsController } from '../controllers/rooms.controller';
import { UserController } from '../controllers/user.controller';
import { ProvablyFairController } from '../controllers/provably-fair.controller';
import { PokerLobbyService } from '../services/poker-lobby.service';
import { PokerLobbyGateway } from '../gateways/poker-lobby.gateway';
import { PokerStateService } from '../services/poker-state.service';
import { PokerGameService } from '../services/poker-game.service';
import { WalletService } from '../services/wallet.service';
import { AuditService } from '../services/audit.service';
import { TournamentService } from '../services/tournament.service';
import { ProvablyFairService } from '../services/provably-fair.service';
import { AntiCollusionService } from '../services/anti-collusion.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      PokerTable,
      TableSession,
      Wallet,
      SystemRevenue,
      ProvablyFairAudit,
    ]),
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
    PokerGameService,
    WalletService,
    AuditService,
    TournamentService,
    ProvablyFairService,
    AntiCollusionService,
  ],
  exports: [
    PokerLobbyService,
    PokerLobbyGateway,
    PokerStateService,
    PokerGameService,
    WalletService,
    AuditService,
    TournamentService,
    ProvablyFairService,
    AntiCollusionService,
  ],
})
export class PokerLobbyModule {}
