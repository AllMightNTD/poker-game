import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1783051570703 implements MigrationInterface {
    name = 'Migration1783051570703'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`table_type\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`visibility\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`password\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`action_time\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`time_bank\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`allow_straddle\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`allow_auto_topup\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`allow_chat\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`enable_waiting_list\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`reserve_timeout\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`allow_spectator\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`hide_hole_cards\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`block_multi_account\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`vpn_detection\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`display_stats\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`allow_hand_history\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`disconnect_grace_period\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`table_theme\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`late_reg_minutes\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`max_reentries\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`bad_beat_jackpot\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`high_hand_bonus\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`enable_achievements\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`stream_delay_minutes\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`enable_analytics\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`allow_rabbit_hunting\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`allow_dynamic_blinds\``);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`user_table_settings\` ADD \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`user_table_settings\` ADD \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`table_sessions\` ADD \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`table_sessions\` ADD \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`system_revenue\` ADD \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`room_admin_logs\` ADD \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`in_room_chats\` ADD \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`in_room_chats\` ADD \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`hand_positions\` ADD \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`hand_players\` ADD \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`hand_players\` ADD \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`hand_actions\` ADD \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`system_revenue\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`system_revenue\` ADD \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`room_admin_logs\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`room_admin_logs\` ADD \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`hand_positions\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`hand_positions\` ADD \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`hand_actions\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`hand_actions\` ADD \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`hand_actions\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`hand_actions\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`hand_positions\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`hand_positions\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`room_admin_logs\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`room_admin_logs\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`system_revenue\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`system_revenue\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`hand_actions\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`hand_players\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`hand_players\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`hand_positions\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`in_room_chats\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`in_room_chats\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`room_admin_logs\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`system_revenue\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`table_sessions\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`table_sessions\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`user_table_settings\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`user_table_settings\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`allow_dynamic_blinds\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`allow_rabbit_hunting\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`enable_analytics\` tinyint NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`stream_delay_minutes\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`enable_achievements\` tinyint NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`high_hand_bonus\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`bad_beat_jackpot\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`max_reentries\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`late_reg_minutes\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`table_theme\` varchar(50) NOT NULL DEFAULT 'classic_green'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`disconnect_grace_period\` int NOT NULL DEFAULT '60'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`allow_hand_history\` tinyint NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`display_stats\` tinyint NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`vpn_detection\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`block_multi_account\` tinyint NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`hide_hole_cards\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`allow_spectator\` tinyint NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`reserve_timeout\` int NOT NULL DEFAULT '60'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`enable_waiting_list\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`allow_chat\` tinyint NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`allow_auto_topup\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`allow_straddle\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`time_bank\` int NOT NULL DEFAULT '30'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`action_time\` int NOT NULL DEFAULT '15'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`password\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`visibility\` varchar(20) NOT NULL DEFAULT 'public'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`table_type\` varchar(20) NOT NULL DEFAULT 'cash_game'`);
    }

}
