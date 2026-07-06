import { Module } from '@nestjs/common';
import { AdminAuditLogsController } from '../admin/controllers/admin-audit-logs.controller';
import { AdminTablesController } from '../admin/controllers/admin-tables.controller';
import { AdminTransactionsController } from '../admin/controllers/admin-transactions.controller';
import { AdminUsersController } from '../admin/controllers/admin-users.controller';
import { AdminWalletsController } from '../admin/controllers/admin-wallets.controller';
import { AdminController } from '../admin/controllers/admin.controller';
import { AdminAuditLogsService } from '../admin/services/admin-audit-logs.service';
import { AdminTablesService } from '../admin/services/admin-tables.service';
import { AdminTransactionsService } from '../admin/services/admin-transactions.service';
import { AdminUsersService } from '../admin/services/admin-users.service';
import { AdminWalletsService } from '../admin/services/admin-wallets.service';
import { AdminService } from '../admin/services/admin.service';

@Module({
  controllers: [AdminController, AdminUsersController, AdminWalletsController, AdminTransactionsController, AdminTablesController, AdminAuditLogsController],
  providers: [AdminService, AdminUsersService, AdminWalletsService, AdminTransactionsService, AdminTablesService, AdminAuditLogsService],
})
export class AdminModule { }
