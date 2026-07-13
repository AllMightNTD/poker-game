import { Module } from '@nestjs/common';
import { AdminAuditLogsController } from '../admin/controllers/admin-audit-logs.controller';
import { AdminTablesController } from '../admin/controllers/admin-tables.controller';
import { AdminTransactionsController } from '../admin/controllers/admin-transactions.controller';
import { AdminUsersController } from '../admin/controllers/admin-users.controller';
import { AdminWalletsController } from '../admin/controllers/admin-wallets.controller';
import { AdminController } from '../admin/controllers/admin.controller';
import { AdminHandsController } from '../admin/controllers/admin-hands.controller';
import { AdminRevenueController } from '../admin/controllers/admin-revenue.controller';
import { AdminSystemController } from '../admin/controllers/admin-system.controller';
import { AdminEventsController } from '../admin/controllers/admin-events.controller';
import { AdminSecurityLogsController } from '../admin/controllers/admin-security-logs.controller';
import { AdminFinancialAuditController } from '../admin/controllers/admin-financial-audit.controller';
import { AdminAuditLogsService } from '../admin/services/admin-audit-logs.service';
import { AdminTablesService } from '../admin/services/admin-tables.service';
import { AdminTransactionsService } from '../admin/services/admin-transactions.service';
import { AdminUsersService } from '../admin/services/admin-users.service';
import { AdminWalletsService } from '../admin/services/admin-wallets.service';
import { AdminHandsService } from '../admin/services/admin-hands.service';
import { AdminRevenueService } from '../admin/services/admin-revenue.service';
import { AdminService } from '../admin/services/admin.service';
import { AdminEventsService } from '../admin/services/admin-events.service';
import { AdminSecurityLogsService } from '../admin/services/admin-security-logs.service';
import { AdminFinancialAuditService } from '../admin/services/admin-financial-audit.service';
import { PokerLobbyModule } from './poker-lobby.module';

@Module({
  imports: [PokerLobbyModule],
  controllers: [
    AdminController,
    AdminUsersController,
    AdminWalletsController,
    AdminTransactionsController,
    AdminTablesController,
    AdminAuditLogsController,
    AdminHandsController,
    AdminRevenueController,
    AdminSystemController,
    AdminEventsController,
    AdminSecurityLogsController,
    AdminFinancialAuditController,
  ],
  providers: [
    AdminService,
    AdminUsersService,
    AdminWalletsService,
    AdminTransactionsService,
    AdminTablesService,
    AdminAuditLogsService,
    AdminHandsService,
    AdminRevenueService,
    AdminEventsService,
    AdminSecurityLogsService,
    AdminFinancialAuditService,
  ],
})
export class AdminModule {}
