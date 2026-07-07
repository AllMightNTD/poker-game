import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1783333290818 implements MigrationInterface {
  name = 'Migration1783333290818';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user_settings\` (\`id\` varchar(36) NOT NULL, \`game_volume\` int NOT NULL DEFAULT '50', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` varchar(36) NULL, UNIQUE INDEX \`REL_4ed056b9344e6f7d8d46ec4b30\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`transactions\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`type\` enum ('DEPOSIT', 'WITHDRAW', 'TRANSFER', 'GAME_WIN', 'GAME_LOSS') NOT NULL, \`amount\` bigint NOT NULL, \`status\` enum ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'FAILED') NOT NULL DEFAULT 'PENDING', \`payment_method\` varchar(255) NULL, \`proof_image\` varchar(255) NULL, \`notes\` text NULL, \`processed_by\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_e9acc6efa76de013e8c1553ed2\` (\`user_id\`), INDEX \`IDX_2d5fa024a84dceb158b2b95f34\` (\`type\`), INDEX \`IDX_da87c55b3bbbe96c6ed88ea7ee\` (\`status\`), INDEX \`IDX_450a5294dfde65588ff285fcff\` (\`created_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`blogs\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`thumbnail\` varchar(500) NULL, \`content\` text NOT NULL, \`excerpt\` varchar(500) NULL, \`category\` varchar(100) NOT NULL DEFAULT 'News', \`tags\` json NULL, \`author_id\` varchar(36) NULL, \`views_count\` int NOT NULL DEFAULT '0', \`is_published\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_7b18faaddd461656ff66f32e2d\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`admin_audit_logs\` (\`id\` varchar(36) NOT NULL, \`admin_id\` varchar(255) NOT NULL, \`action\` varchar(255) NOT NULL, \`resource\` varchar(255) NOT NULL, \`old_value\` text NULL, \`new_value\` text NULL, \`ip_address\` varchar(255) NULL, \`user_agent\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_01a78e07962ed72eaf9ccae990\` (\`admin_id\`), INDEX \`IDX_5d49c245604bbfa780a30ae97d\` (\`action\`), INDEX \`IDX_ee43923e8ce21dbe10bccaba85\` (\`created_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`admins\` (\`id\` varchar(36) NOT NULL, \`user_name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`two_factor_secret\` varchar(255) NULL, \`is_two_factor_enabled\` tinyint NOT NULL DEFAULT 0, \`role\` enum ('ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'ADMIN', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_f6c068d1489100b8ea30e10f00\` (\`user_name\`), UNIQUE INDEX \`IDX_051db7d37d478a69a7432df147\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_settings\` ADD CONSTRAINT \`FK_4ed056b9344e6f7d8d46ec4b302\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ws_connections\` ADD CONSTRAINT \`FK_0b0c39a306971b7c3bc376fc195\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`wallets\` ADD CONSTRAINT \`FK_92558c08091598f7a4439586cda\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_178199805b901ccd220ab7740ec\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_17022daf3f885f7d35423e9971e\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_87b8888186ca9769c960e926870\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_b23c65e50a758245a33ee35fda1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_table_settings\` ADD CONSTRAINT \`FK_2f33eda67ad23f8801e38de7404\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_table_settings\` ADD CONSTRAINT \`FK_19bc0a427413b8d56560f0de03d\` FOREIGN KEY (\`table_id\`) REFERENCES \`tables\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_e9acc6efa76de013e8c1553ed2b\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`table_sessions\` ADD CONSTRAINT \`FK_73328bc5dcedce124fa829375bb\` FOREIGN KEY (\`table_id\`) REFERENCES \`tables\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`table_sessions\` ADD CONSTRAINT \`FK_4c4b324799e2564f42bb49f41be\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`game_hands\` ADD CONSTRAINT \`FK_d8d9d15b2f49b150bc2402e9fc4\` FOREIGN KEY (\`table_id\`) REFERENCES \`tables\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`system_revenue\` ADD CONSTRAINT \`FK_aeb0ebc516ceff28f100f0ce083\` FOREIGN KEY (\`room_id\`) REFERENCES \`tables\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`system_revenue\` ADD CONSTRAINT \`FK_80f409d74f89015db235ec17567\` FOREIGN KEY (\`hand_id\`) REFERENCES \`game_hands\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`room_admin_logs\` ADD CONSTRAINT \`FK_0ac4c532a124aeca6bb3ca7e0c1\` FOREIGN KEY (\`room_id\`) REFERENCES \`tables\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`room_admin_logs\` ADD CONSTRAINT \`FK_368a6f64407a5dec6b871f98a12\` FOREIGN KEY (\`actor_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`room_admin_logs\` ADD CONSTRAINT \`FK_40348039134899fe7ae5c26564a\` FOREIGN KEY (\`target_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_tokens\` ADD CONSTRAINT \`FK_3ddc983c5f7bcf132fd8732c3f4\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`push_tokens\` ADD CONSTRAINT \`FK_94c371aff70dedeb89dae39f440\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`hand_positions\` ADD CONSTRAINT \`FK_8c439424774c7dbe0573abd627c\` FOREIGN KEY (\`hand_id\`) REFERENCES \`game_hands\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`hand_positions\` ADD CONSTRAINT \`FK_3acbd5923aabfae0e972ee37d1f\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`hand_players\` ADD CONSTRAINT \`FK_ffc76ab81146a13e6a400dc4fca\` FOREIGN KEY (\`hand_id\`) REFERENCES \`game_hands\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`hand_players\` ADD CONSTRAINT \`FK_dfdf590412f8e3361ad56d3ae7b\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`hand_actions\` ADD CONSTRAINT \`FK_2ca69e0182d96d9dac86a269bea\` FOREIGN KEY (\`hand_id\`) REFERENCES \`game_hands\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`hand_actions\` ADD CONSTRAINT \`FK_3422386f0f59957df8ca89461af\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`blogs\` ADD CONSTRAINT \`FK_b324119dcb71e877cee411f7929\` FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`blogs\` DROP FOREIGN KEY \`FK_b324119dcb71e877cee411f7929\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`hand_actions\` DROP FOREIGN KEY \`FK_3422386f0f59957df8ca89461af\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`hand_actions\` DROP FOREIGN KEY \`FK_2ca69e0182d96d9dac86a269bea\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`hand_players\` DROP FOREIGN KEY \`FK_dfdf590412f8e3361ad56d3ae7b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`hand_players\` DROP FOREIGN KEY \`FK_ffc76ab81146a13e6a400dc4fca\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`hand_positions\` DROP FOREIGN KEY \`FK_3acbd5923aabfae0e972ee37d1f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`hand_positions\` DROP FOREIGN KEY \`FK_8c439424774c7dbe0573abd627c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`push_tokens\` DROP FOREIGN KEY \`FK_94c371aff70dedeb89dae39f440\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_tokens\` DROP FOREIGN KEY \`FK_3ddc983c5f7bcf132fd8732c3f4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`room_admin_logs\` DROP FOREIGN KEY \`FK_40348039134899fe7ae5c26564a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`room_admin_logs\` DROP FOREIGN KEY \`FK_368a6f64407a5dec6b871f98a12\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`room_admin_logs\` DROP FOREIGN KEY \`FK_0ac4c532a124aeca6bb3ca7e0c1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`system_revenue\` DROP FOREIGN KEY \`FK_80f409d74f89015db235ec17567\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`system_revenue\` DROP FOREIGN KEY \`FK_aeb0ebc516ceff28f100f0ce083\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`game_hands\` DROP FOREIGN KEY \`FK_d8d9d15b2f49b150bc2402e9fc4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`table_sessions\` DROP FOREIGN KEY \`FK_4c4b324799e2564f42bb49f41be\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`table_sessions\` DROP FOREIGN KEY \`FK_73328bc5dcedce124fa829375bb\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_e9acc6efa76de013e8c1553ed2b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_table_settings\` DROP FOREIGN KEY \`FK_19bc0a427413b8d56560f0de03d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_table_settings\` DROP FOREIGN KEY \`FK_2f33eda67ad23f8801e38de7404\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_b23c65e50a758245a33ee35fda1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_87b8888186ca9769c960e926870\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_17022daf3f885f7d35423e9971e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_178199805b901ccd220ab7740ec\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`wallets\` DROP FOREIGN KEY \`FK_92558c08091598f7a4439586cda\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ws_connections\` DROP FOREIGN KEY \`FK_0b0c39a306971b7c3bc376fc195\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_settings\` DROP FOREIGN KEY \`FK_4ed056b9344e6f7d8d46ec4b302\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_051db7d37d478a69a7432df147\` ON \`admins\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_f6c068d1489100b8ea30e10f00\` ON \`admins\``,
    );
    await queryRunner.query(`DROP TABLE \`admins\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_ee43923e8ce21dbe10bccaba85\` ON \`admin_audit_logs\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_5d49c245604bbfa780a30ae97d\` ON \`admin_audit_logs\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_01a78e07962ed72eaf9ccae990\` ON \`admin_audit_logs\``,
    );
    await queryRunner.query(`DROP TABLE \`admin_audit_logs\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_7b18faaddd461656ff66f32e2d\` ON \`blogs\``,
    );
    await queryRunner.query(`DROP TABLE \`blogs\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_450a5294dfde65588ff285fcff\` ON \`transactions\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_da87c55b3bbbe96c6ed88ea7ee\` ON \`transactions\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_2d5fa024a84dceb158b2b95f34\` ON \`transactions\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_e9acc6efa76de013e8c1553ed2\` ON \`transactions\``,
    );
    await queryRunner.query(`DROP TABLE \`transactions\``);
    await queryRunner.query(
      `DROP INDEX \`REL_4ed056b9344e6f7d8d46ec4b30\` ON \`user_settings\``,
    );
    await queryRunner.query(`DROP TABLE \`user_settings\``);
  }
}
