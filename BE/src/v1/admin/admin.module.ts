import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminUsersService } from './services/admin-users.service';
import { AdminWalletsController } from './controllers/admin-wallets.controller';
import { AdminWalletsService } from './services/admin-wallets.service';
import { AdminTransactionsController } from './controllers/admin-transactions.controller';
import { AdminTransactionsService } from './services/admin-transactions.service';
import { AdminTablesController } from './controllers/admin-tables.controller';
import { AdminTablesService } from './services/admin-tables.service';
import { AdminAuditLogsController } from './controllers/admin-audit-logs.controller';
import { AdminAuditLogsService } from './services/admin-audit-logs.service';

@Module({
  controllers: [AdminController, AdminUsersController, AdminWalletsController, AdminTransactionsController, AdminTablesController, AdminAuditLogsController],
  providers: [AdminService, AdminUsersService, AdminWalletsService, AdminTransactionsService, AdminTablesService, AdminAuditLogsService],
})
export class AdminModule {}
