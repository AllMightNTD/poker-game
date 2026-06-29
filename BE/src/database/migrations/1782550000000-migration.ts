import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Poker Game Database — Updated Schema
 * Based on poker_database_diagram_updated.drawio
 *
 * Changes:
 * 1. ALTER `tables` — thêm rake_rate, rake_cap, owner_id, ante, status, current_hand_id, created_at
 * 2. ALTER `game_hands` — thêm dealer_seat, small_blind_seat, big_blind_seat, hand_stage,
 *                          remaining_deck, current_turn_user_id, side_pots_json, rake_amount, started_at, ended_at
 * 3. ALTER `table_sessions` — thêm member_status, chat_muted, is_dealer, is_small_blind, is_big_blind, left_at
 * 4. CREATE `hand_actions` — nhật ký từng hành động (fold/check/call/raise...)
 * 5. CREATE `hand_positions` — vị trí mỗi người trong ván (composite PK)
 * 6. CREATE `system_revenue` — MODULE 5: doanh thu rake hệ thống
 * 7. CREATE `room_admin_logs` — nhật ký quản trị phòng
 */
export class Migration1782550000000 implements MigrationInterface {
  name = 'Migration1782550000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─────────────────────────────────────────────
    // 1. ALTER `tables` — bổ sung cột từ diagram updated
    // ─────────────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE \`tables\`
        ADD COLUMN \`owner_id\` varchar(255) NULL AFTER \`name\`,
        ADD COLUMN \`ante\` bigint NOT NULL DEFAULT '0' AFTER \`big_blind\`,
        ADD COLUMN \`rake_rate\` decimal(4,2) NOT NULL DEFAULT '5.00' AFTER \`max_buyin\`,
        ADD COLUMN \`rake_cap\` bigint NOT NULL DEFAULT '0' AFTER \`rake_rate\`,
        ADD COLUMN \`status\` varchar(20) NOT NULL DEFAULT 'waiting' AFTER \`rake_cap\`,
        ADD COLUMN \`current_hand_id\` bigint NULL AFTER \`status\`,
        ADD COLUMN \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) AFTER \`current_hand_id\``
    );

    // ─────────────────────────────────────────────
    // 2. ALTER `game_hands` — bổ sung cột từ diagram updated
    // ─────────────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE \`game_hands\`
        ADD COLUMN \`dealer_seat\` int NULL AFTER \`table_id\`,
        ADD COLUMN \`small_blind_seat\` int NOT NULL DEFAULT '0' AFTER \`dealer_seat\`,
        ADD COLUMN \`big_blind_seat\` int NOT NULL DEFAULT '0' AFTER \`small_blind_seat\`,
        ADD COLUMN \`hand_stage\` varchar(12) NOT NULL DEFAULT 'preflop' AFTER \`community_cards\`,
        ADD COLUMN \`remaining_deck\` text NULL AFTER \`hand_stage\`,
        ADD COLUMN \`current_turn_user_id\` varchar(255) NULL AFTER \`remaining_deck\`,
        ADD COLUMN \`rake_amount\` bigint NOT NULL DEFAULT '0' AFTER \`total_pot\`,
        ADD COLUMN \`side_pots_json\` json NULL AFTER \`rake_amount\`,
        ADD COLUMN \`started_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) AFTER \`side_pots_json\`,
        ADD COLUMN \`ended_at\` datetime NULL AFTER \`started_at\``
    );
    // Đổi tên created_at → (giữ nguyên vì là cột cũ, started_at là mới)

    // ─────────────────────────────────────────────
    // 3. ALTER `table_sessions` — bổ sung cột theo room_members
    // ─────────────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE \`table_sessions\`
        ADD COLUMN \`member_status\` varchar(20) NOT NULL DEFAULT 'active' AFTER \`chips_at_table\`,
        ADD COLUMN \`chat_muted\` tinyint NOT NULL DEFAULT 0 AFTER \`member_status\`,
        ADD COLUMN \`is_dealer\` tinyint NOT NULL DEFAULT 0 AFTER \`chat_muted\`,
        ADD COLUMN \`is_small_blind\` tinyint NOT NULL DEFAULT 0 AFTER \`is_dealer\`,
        ADD COLUMN \`is_big_blind\` tinyint NOT NULL DEFAULT 0 AFTER \`is_small_blind\`,
        ADD COLUMN \`left_at\` datetime NULL AFTER \`joined_at\``
    );

    // ─────────────────────────────────────────────
    // 4. CREATE `hand_actions`
    // ─────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE \`hand_actions\` (
        \`id\` bigint NOT NULL AUTO_INCREMENT,
        \`hand_id\` bigint NOT NULL,
        \`user_id\` varchar(255) NOT NULL,
        \`seat_number\` int NOT NULL,
        \`stage\` varchar(10) NOT NULL,
        \`action_type\` varchar(15) NOT NULL,
        \`amount\` bigint NOT NULL DEFAULT '0',
        \`action_order\` int NOT NULL DEFAULT '0',
        \`is_all_in\` tinyint NOT NULL DEFAULT 0,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_hand_actions_hand_id\` (\`hand_id\`),
        INDEX \`IDX_hand_actions_user_id\` (\`user_id\`)
      ) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`hand_actions\`
        ADD CONSTRAINT \`FK_hand_actions_hand_id\` FOREIGN KEY (\`hand_id\`) REFERENCES \`game_hands\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`hand_actions\`
        ADD CONSTRAINT \`FK_hand_actions_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    // ─────────────────────────────────────────────
    // 5. CREATE `hand_positions`  (composite PK)
    // ─────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE \`hand_positions\` (
        \`hand_id\` bigint NOT NULL,
        \`user_id\` varchar(255) NOT NULL,
        \`seat_number\` int NOT NULL,
        \`position_type\` varchar(20) NOT NULL,
        \`is_active_in_hand\` tinyint NOT NULL DEFAULT 1,
        \`stack_at_start\` bigint NOT NULL DEFAULT '0',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`hand_id\`, \`user_id\`),
        INDEX \`IDX_hand_positions_hand_id\` (\`hand_id\`)
      ) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`hand_positions\`
        ADD CONSTRAINT \`FK_hand_positions_hand_id\` FOREIGN KEY (\`hand_id\`) REFERENCES \`game_hands\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`hand_positions\`
        ADD CONSTRAINT \`FK_hand_positions_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    // ─────────────────────────────────────────────
    // 6. CREATE `system_revenue`  — MODULE 5
    // ─────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE \`system_revenue\` (
        \`id\` bigint NOT NULL AUTO_INCREMENT,
        \`room_id\` bigint NOT NULL,
        \`hand_id\` bigint NOT NULL,
        \`revenue_amount\` bigint NOT NULL DEFAULT '0',
        \`rake_rate_applied\` decimal(4,2) NOT NULL DEFAULT '5.00',
        \`pot_total\` bigint NOT NULL DEFAULT '0',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_system_revenue_room_id\` (\`room_id\`),
        INDEX \`IDX_system_revenue_created_at\` (\`created_at\`)
      ) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`system_revenue\`
        ADD CONSTRAINT \`FK_system_revenue_room_id\` FOREIGN KEY (\`room_id\`) REFERENCES \`tables\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`system_revenue\`
        ADD CONSTRAINT \`FK_system_revenue_hand_id\` FOREIGN KEY (\`hand_id\`) REFERENCES \`game_hands\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    // ─────────────────────────────────────────────
    // 7. CREATE `room_admin_logs`
    // ─────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE \`room_admin_logs\` (
        \`id\` bigint NOT NULL AUTO_INCREMENT,
        \`room_id\` bigint NOT NULL,
        \`actor_id\` varchar(255) NOT NULL,
        \`target_id\` varchar(255) NULL,
        \`log_type\` varchar(20) NOT NULL,
        \`description\` text NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_room_admin_logs_room_id\` (\`room_id\`)
      ) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`room_admin_logs\`
        ADD CONSTRAINT \`FK_room_admin_logs_room_id\` FOREIGN KEY (\`room_id\`) REFERENCES \`tables\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`room_admin_logs\`
        ADD CONSTRAINT \`FK_room_admin_logs_actor_id\` FOREIGN KEY (\`actor_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`room_admin_logs\`
        ADD CONSTRAINT \`FK_room_admin_logs_target_id\` FOREIGN KEY (\`target_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 7. DROP room_admin_logs
    await queryRunner.query(`ALTER TABLE \`room_admin_logs\` DROP FOREIGN KEY \`FK_room_admin_logs_target_id\``);
    await queryRunner.query(`ALTER TABLE \`room_admin_logs\` DROP FOREIGN KEY \`FK_room_admin_logs_actor_id\``);
    await queryRunner.query(`ALTER TABLE \`room_admin_logs\` DROP FOREIGN KEY \`FK_room_admin_logs_room_id\``);
    await queryRunner.query(`DROP TABLE \`room_admin_logs\``);

    // 6. DROP system_revenue
    await queryRunner.query(`ALTER TABLE \`system_revenue\` DROP FOREIGN KEY \`FK_system_revenue_hand_id\``);
    await queryRunner.query(`ALTER TABLE \`system_revenue\` DROP FOREIGN KEY \`FK_system_revenue_room_id\``);
    await queryRunner.query(`DROP TABLE \`system_revenue\``);

    // 5. DROP hand_positions
    await queryRunner.query(`ALTER TABLE \`hand_positions\` DROP FOREIGN KEY \`FK_hand_positions_user_id\``);
    await queryRunner.query(`ALTER TABLE \`hand_positions\` DROP FOREIGN KEY \`FK_hand_positions_hand_id\``);
    await queryRunner.query(`DROP TABLE \`hand_positions\``);

    // 4. DROP hand_actions
    await queryRunner.query(`ALTER TABLE \`hand_actions\` DROP FOREIGN KEY \`FK_hand_actions_user_id\``);
    await queryRunner.query(`ALTER TABLE \`hand_actions\` DROP FOREIGN KEY \`FK_hand_actions_hand_id\``);
    await queryRunner.query(`DROP TABLE \`hand_actions\``);

    // 3. Revert table_sessions
    await queryRunner.query(
      `ALTER TABLE \`table_sessions\`
        DROP COLUMN \`left_at\`,
        DROP COLUMN \`is_big_blind\`,
        DROP COLUMN \`is_small_blind\`,
        DROP COLUMN \`is_dealer\`,
        DROP COLUMN \`chat_muted\`,
        DROP COLUMN \`member_status\``
    );

    // 2. Revert game_hands
    await queryRunner.query(
      `ALTER TABLE \`game_hands\`
        DROP COLUMN \`ended_at\`,
        DROP COLUMN \`started_at\`,
        DROP COLUMN \`side_pots_json\`,
        DROP COLUMN \`rake_amount\`,
        DROP COLUMN \`current_turn_user_id\`,
        DROP COLUMN \`remaining_deck\`,
        DROP COLUMN \`hand_stage\`,
        DROP COLUMN \`big_blind_seat\`,
        DROP COLUMN \`small_blind_seat\`,
        DROP COLUMN \`dealer_seat\``
    );

    // 1. Revert tables
    await queryRunner.query(
      `ALTER TABLE \`tables\`
        DROP COLUMN \`created_at\`,
        DROP COLUMN \`current_hand_id\`,
        DROP COLUMN \`status\`,
        DROP COLUMN \`rake_cap\`,
        DROP COLUMN \`rake_rate\`,
        DROP COLUMN \`ante\`,
        DROP COLUMN \`owner_id\``
    );
  }
}
