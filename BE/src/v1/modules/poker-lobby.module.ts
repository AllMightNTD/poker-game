import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PokerTable } from '../entities/poker_table.entity';
import { TableSession } from '../entities/table_session.entity';
import { Wallet } from '../entities/wallet.entity';
import { SystemRevenue } from '../entities/system_revenue.entity';
import { LobbyController } from '../controllers/lobby.controller';
import { WalletController } from '../controllers/wallet.controller';
import { RoomsController } from '../controllers/rooms.controller';
import { UserController } from '../controllers/user.controller';
import { PokerLobbyService } from '../services/poker-lobby.service';
import { PokerLobbyGateway } from '../gateways/poker-lobby.gateway';
import { PokerStateService } from '../services/poker-state.service';
import { PokerGameService } from '../services/poker-game.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([PokerTable, TableSession, Wallet, SystemRevenue]),
  ],
  controllers: [
    LobbyController,
    WalletController,
    RoomsController,
    UserController,
  ],
  providers: [
    PokerLobbyService,
    PokerLobbyGateway,
    PokerStateService,
    PokerGameService,
  ],
  exports: [
    PokerLobbyService,
    PokerLobbyGateway,
    PokerStateService,
    PokerGameService,
  ],
})
export class PokerLobbyModule {}
