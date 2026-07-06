import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1783312130746 implements MigrationInterface {
    name = 'Migration1783312130746'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`user_name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`avatar_url\` varchar(255) NULL, \`status\` enum ('ACTIVE', 'INACTIVE', 'BANNED') NOT NULL DEFAULT 'ACTIVE', \`is_active_status\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_074a1f262efaca6aba16f7ed92\` (\`user_name\`), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ws_connections\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`socket_id\` varchar(255) NOT NULL, \`server_id\` varchar(255) NOT NULL, \`device_type\` enum ('web', 'ios', 'android') NOT NULL, \`last_ping_at\` datetime NOT NULL, \`connected_at\` datetime NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_b84c7743b69783ceabc65b5592\` (\`socket_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`wallets\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`user_id\` varchar(255) NOT NULL, \`chips_balance\` bigint NOT NULL DEFAULT '0', \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tables\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`game_type\` varchar(20) NOT NULL, \`owner_id\` varchar(255) NOT NULL, \`small_blind\` bigint NOT NULL DEFAULT '0', \`big_blind\` bigint NOT NULL DEFAULT '0', \`ante\` bigint NOT NULL DEFAULT '0', \`max_players\` int NOT NULL DEFAULT '9', \`min_buyin\` bigint NOT NULL DEFAULT '0', \`max_buyin\` bigint NOT NULL DEFAULT '0', \`rake_rate\` decimal(4,2) NOT NULL DEFAULT '5.00', \`rake_cap\` bigint NOT NULL DEFAULT '0', \`status\` varchar(20) NOT NULL DEFAULT 'waiting', \`current_hand_id\` bigint NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`auto_approve\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_table_settings\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`user_id\` varchar(255) NOT NULL, \`table_id\` bigint NOT NULL, \`table_background\` varchar(50) NULL, \`card_deck_style\` varchar(50) NULL, \`dealer_voice_vol\` int NOT NULL DEFAULT '100', \`sound_effects_vol\` int NOT NULL DEFAULT '100', \`mute_all_voice\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`permissions\` (\`id\` varchar(36) NOT NULL, \`code\` varchar(100) NOT NULL, \`description\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_8dad765629e83229da6feda1c1\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role_permissions\` (\`role_id\` varchar(255) NOT NULL, \`permission_id\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`role_id\`, \`permission_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`roles\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`description\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_roles\` (\`user_id\` varchar(255) NOT NULL, \`role_id\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`user_id\`, \`role_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`table_sessions\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`table_id\` bigint NOT NULL, \`user_id\` varchar(255) NOT NULL, \`seat_number\` int NOT NULL, \`chips_at_table\` bigint NOT NULL DEFAULT '0', \`member_status\` varchar(20) NOT NULL DEFAULT 'active', \`chat_muted\` tinyint NOT NULL DEFAULT 0, \`is_dealer\` tinyint NOT NULL DEFAULT 0, \`is_small_blind\` tinyint NOT NULL DEFAULT 0, \`is_big_blind\` tinyint NOT NULL DEFAULT 0, \`joined_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`left_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`game_hands\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`table_id\` bigint NOT NULL, \`dealer_seat\` int NULL, \`small_blind_seat\` int NOT NULL DEFAULT '0', \`big_blind_seat\` int NOT NULL DEFAULT '0', \`community_cards\` varchar(30) NULL, \`remaining_deck\` text NULL, \`total_pot\` bigint NOT NULL DEFAULT '0', \`rake_amount\` bigint NOT NULL DEFAULT '0', \`side_pots_json\` json NULL, \`hand_stage\` varchar(12) NOT NULL DEFAULT 'preflop', \`server_seed\` varchar(255) NULL, \`client_seed\` varchar(255) NULL, \`shuffled_deck\` text NULL, \`current_turn_user_id\` varchar(255) NULL, \`rake_taken\` bigint NOT NULL DEFAULT '0', \`started_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`ended_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`system_revenue\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`room_id\` bigint NOT NULL, \`hand_id\` bigint NOT NULL, \`revenue_amount\` bigint NOT NULL DEFAULT '0', \`rake_rate_applied\` decimal(4,2) NOT NULL DEFAULT '5.00', \`pot_total\` bigint NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`room_admin_logs\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`room_id\` bigint NOT NULL, \`actor_id\` varchar(255) NOT NULL, \`target_id\` varchar(255) NULL, \`log_type\` varchar(20) NOT NULL, \`description\` text NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`refresh_tokens\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`token_hash\` varchar(500) NOT NULL, \`expires_at\` datetime NOT NULL, \`revoked_at\` datetime NULL, \`device_info\` varchar(255) NULL, \`ip_address\` varchar(45) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_a7838d2ba25be1342091b6695f\` (\`token_hash\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`push_tokens\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`token\` varchar(500) NOT NULL, \`platform\` enum ('fcm', 'apns', 'web') NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`last_used_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_869b4a9ba2c9e030aafc4b7dc7\` (\`token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`hand_positions\` (\`hand_id\` bigint NOT NULL, \`user_id\` varchar(255) NOT NULL, \`seat_number\` int NOT NULL, \`position_type\` varchar(20) NOT NULL, \`is_active_in_hand\` tinyint NOT NULL DEFAULT 1, \`stack_at_start\` bigint NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`hand_id\`, \`user_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`hand_players\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`hand_id\` bigint NOT NULL, \`user_id\` varchar(255) NOT NULL, \`hole_cards\` varchar(20) NULL, \`chips_before\` bigint NOT NULL DEFAULT '0', \`chips_bet\` bigint NOT NULL DEFAULT '0', \`chips_won\` bigint NOT NULL DEFAULT '0', \`net_gain_loss\` bigint NOT NULL DEFAULT '0', \`is_winner\` tinyint NOT NULL DEFAULT 0, \`vpip\` tinyint NOT NULL DEFAULT 0, \`pfr\` tinyint NOT NULL DEFAULT 0, \`seat_number\` int NULL, \`initial_stack\` bigint NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`hand_actions\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`hand_id\` bigint NOT NULL, \`user_id\` varchar(255) NOT NULL, \`seat_number\` int NOT NULL, \`stage\` varchar(10) NOT NULL, \`action_type\` varchar(15) NOT NULL, \`amount\` bigint NOT NULL DEFAULT '0', \`action_order\` int NOT NULL DEFAULT '0', \`is_all_in\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_settings\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`user_settings\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`user_settings\` ADD CONSTRAINT \`FK_4ed056b9344e6f7d8d46ec4b302\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ws_connections\` ADD CONSTRAINT \`FK_0b0c39a306971b7c3bc376fc195\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`wallets\` ADD CONSTRAINT \`FK_92558c08091598f7a4439586cda\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_table_settings\` ADD CONSTRAINT \`FK_2f33eda67ad23f8801e38de7404\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_table_settings\` ADD CONSTRAINT \`FK_19bc0a427413b8d56560f0de03d\` FOREIGN KEY (\`table_id\`) REFERENCES \`tables\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_178199805b901ccd220ab7740ec\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_17022daf3f885f7d35423e9971e\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_87b8888186ca9769c960e926870\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_b23c65e50a758245a33ee35fda1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`table_sessions\` ADD CONSTRAINT \`FK_73328bc5dcedce124fa829375bb\` FOREIGN KEY (\`table_id\`) REFERENCES \`tables\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`table_sessions\` ADD CONSTRAINT \`FK_4c4b324799e2564f42bb49f41be\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`game_hands\` ADD CONSTRAINT \`FK_d8d9d15b2f49b150bc2402e9fc4\` FOREIGN KEY (\`table_id\`) REFERENCES \`tables\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`system_revenue\` ADD CONSTRAINT \`FK_aeb0ebc516ceff28f100f0ce083\` FOREIGN KEY (\`room_id\`) REFERENCES \`tables\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`system_revenue\` ADD CONSTRAINT \`FK_80f409d74f89015db235ec17567\` FOREIGN KEY (\`hand_id\`) REFERENCES \`game_hands\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`room_admin_logs\` ADD CONSTRAINT \`FK_0ac4c532a124aeca6bb3ca7e0c1\` FOREIGN KEY (\`room_id\`) REFERENCES \`tables\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`room_admin_logs\` ADD CONSTRAINT \`FK_368a6f64407a5dec6b871f98a12\` FOREIGN KEY (\`actor_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`room_admin_logs\` ADD CONSTRAINT \`FK_40348039134899fe7ae5c26564a\` FOREIGN KEY (\`target_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` ADD CONSTRAINT \`FK_3ddc983c5f7bcf132fd8732c3f4\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`push_tokens\` ADD CONSTRAINT \`FK_94c371aff70dedeb89dae39f440\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`hand_positions\` ADD CONSTRAINT \`FK_8c439424774c7dbe0573abd627c\` FOREIGN KEY (\`hand_id\`) REFERENCES \`game_hands\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`hand_positions\` ADD CONSTRAINT \`FK_3acbd5923aabfae0e972ee37d1f\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`hand_players\` ADD CONSTRAINT \`FK_ffc76ab81146a13e6a400dc4fca\` FOREIGN KEY (\`hand_id\`) REFERENCES \`game_hands\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`hand_players\` ADD CONSTRAINT \`FK_dfdf590412f8e3361ad56d3ae7b\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`hand_actions\` ADD CONSTRAINT \`FK_2ca69e0182d96d9dac86a269bea\` FOREIGN KEY (\`hand_id\`) REFERENCES \`game_hands\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`hand_actions\` ADD CONSTRAINT \`FK_3422386f0f59957df8ca89461af\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`hand_actions\` DROP FOREIGN KEY \`FK_3422386f0f59957df8ca89461af\``);
        await queryRunner.query(`ALTER TABLE \`hand_actions\` DROP FOREIGN KEY \`FK_2ca69e0182d96d9dac86a269bea\``);
        await queryRunner.query(`ALTER TABLE \`hand_players\` DROP FOREIGN KEY \`FK_dfdf590412f8e3361ad56d3ae7b\``);
        await queryRunner.query(`ALTER TABLE \`hand_players\` DROP FOREIGN KEY \`FK_ffc76ab81146a13e6a400dc4fca\``);
        await queryRunner.query(`ALTER TABLE \`hand_positions\` DROP FOREIGN KEY \`FK_3acbd5923aabfae0e972ee37d1f\``);
        await queryRunner.query(`ALTER TABLE \`hand_positions\` DROP FOREIGN KEY \`FK_8c439424774c7dbe0573abd627c\``);
        await queryRunner.query(`ALTER TABLE \`push_tokens\` DROP FOREIGN KEY \`FK_94c371aff70dedeb89dae39f440\``);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` DROP FOREIGN KEY \`FK_3ddc983c5f7bcf132fd8732c3f4\``);
        await queryRunner.query(`ALTER TABLE \`room_admin_logs\` DROP FOREIGN KEY \`FK_40348039134899fe7ae5c26564a\``);
        await queryRunner.query(`ALTER TABLE \`room_admin_logs\` DROP FOREIGN KEY \`FK_368a6f64407a5dec6b871f98a12\``);
        await queryRunner.query(`ALTER TABLE \`room_admin_logs\` DROP FOREIGN KEY \`FK_0ac4c532a124aeca6bb3ca7e0c1\``);
        await queryRunner.query(`ALTER TABLE \`system_revenue\` DROP FOREIGN KEY \`FK_80f409d74f89015db235ec17567\``);
        await queryRunner.query(`ALTER TABLE \`system_revenue\` DROP FOREIGN KEY \`FK_aeb0ebc516ceff28f100f0ce083\``);
        await queryRunner.query(`ALTER TABLE \`game_hands\` DROP FOREIGN KEY \`FK_d8d9d15b2f49b150bc2402e9fc4\``);
        await queryRunner.query(`ALTER TABLE \`table_sessions\` DROP FOREIGN KEY \`FK_4c4b324799e2564f42bb49f41be\``);
        await queryRunner.query(`ALTER TABLE \`table_sessions\` DROP FOREIGN KEY \`FK_73328bc5dcedce124fa829375bb\``);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_b23c65e50a758245a33ee35fda1\``);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_87b8888186ca9769c960e926870\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_17022daf3f885f7d35423e9971e\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_178199805b901ccd220ab7740ec\``);
        await queryRunner.query(`ALTER TABLE \`user_table_settings\` DROP FOREIGN KEY \`FK_19bc0a427413b8d56560f0de03d\``);
        await queryRunner.query(`ALTER TABLE \`user_table_settings\` DROP FOREIGN KEY \`FK_2f33eda67ad23f8801e38de7404\``);
        await queryRunner.query(`ALTER TABLE \`wallets\` DROP FOREIGN KEY \`FK_92558c08091598f7a4439586cda\``);
        await queryRunner.query(`ALTER TABLE \`ws_connections\` DROP FOREIGN KEY \`FK_0b0c39a306971b7c3bc376fc195\``);
        await queryRunner.query(`ALTER TABLE \`user_settings\` DROP FOREIGN KEY \`FK_4ed056b9344e6f7d8d46ec4b302\``);
        await queryRunner.query(`ALTER TABLE \`user_settings\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`user_settings\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`DROP TABLE \`hand_actions\``);
        await queryRunner.query(`DROP TABLE \`hand_players\``);
        await queryRunner.query(`DROP TABLE \`hand_positions\``);
        await queryRunner.query(`DROP INDEX \`IDX_869b4a9ba2c9e030aafc4b7dc7\` ON \`push_tokens\``);
        await queryRunner.query(`DROP TABLE \`push_tokens\``);
        await queryRunner.query(`DROP INDEX \`IDX_a7838d2ba25be1342091b6695f\` ON \`refresh_tokens\``);
        await queryRunner.query(`DROP TABLE \`refresh_tokens\``);
        await queryRunner.query(`DROP TABLE \`room_admin_logs\``);
        await queryRunner.query(`DROP TABLE \`system_revenue\``);
        await queryRunner.query(`DROP TABLE \`game_hands\``);
        await queryRunner.query(`DROP TABLE \`table_sessions\``);
        await queryRunner.query(`DROP TABLE \`user_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` ON \`roles\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
        await queryRunner.query(`DROP TABLE \`role_permissions\``);
        await queryRunner.query(`DROP INDEX \`IDX_8dad765629e83229da6feda1c1\` ON \`permissions\``);
        await queryRunner.query(`DROP TABLE \`permissions\``);
        await queryRunner.query(`DROP TABLE \`user_table_settings\``);
        await queryRunner.query(`DROP TABLE \`tables\``);
        await queryRunner.query(`DROP TABLE \`wallets\``);
        await queryRunner.query(`DROP INDEX \`IDX_b84c7743b69783ceabc65b5592\` ON \`ws_connections\``);
        await queryRunner.query(`DROP TABLE \`ws_connections\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_074a1f262efaca6aba16f7ed92\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}
