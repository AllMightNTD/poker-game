import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PokerTable } from '../entities/poker_table.entity';
import { TableSession } from '../entities/table_session.entity';
import { Wallet } from '../entities/wallet.entity';
import { SystemRevenue } from '../entities/system_revenue.entity';
import {
  LobbyController,
  WalletController,
  RoomsController,
  UserController,
} from './poker-lobby.controller';
import { PokerLobbyService } from './poker-lobby.service';
import { PokerLobbyGateway } from './poker-lobby.gateway';
import { PokerStateService } from './poker-state.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([PokerTable, TableSession, Wallet, SystemRevenue]),
  ],
  controllers: [LobbyController, WalletController, RoomsController, UserController],
  providers: [PokerLobbyService, PokerLobbyGateway, PokerStateService],
  exports: [PokerLobbyService, PokerLobbyGateway, PokerStateService],
})
export class PokerLobbyModule {}


