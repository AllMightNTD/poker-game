import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1782465594496 implements MigrationInterface {
  name = 'Migration1782465594496';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`wallets\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`user_id\` varchar(255) NOT NULL, \`chips_balance\` bigint NOT NULL DEFAULT '0', \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`tables\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`game_type\` varchar(20) NOT NULL, \`small_blind\` bigint NOT NULL DEFAULT '0', \`big_blind\` bigint NOT NULL DEFAULT '0', \`max_players\` int NOT NULL DEFAULT '9', \`min_buyin\` bigint NOT NULL DEFAULT '0', \`max_buyin\` bigint NOT NULL DEFAULT '0', \`is_active\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`voice_room_sessions\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`table_id\` bigint NOT NULL, \`user_id\` varchar(255) NOT NULL, \`is_mic_muted\` tinyint NOT NULL DEFAULT 0, \`is_deafened\` tinyint NOT NULL DEFAULT 0, \`is_speaking\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_table_settings\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`user_id\` varchar(255) NOT NULL, \`table_id\` bigint NOT NULL, \`table_background\` varchar(50) NULL, \`card_deck_style\` varchar(50) NULL, \`dealer_voice_vol\` int NOT NULL DEFAULT '100', \`sound_effects_vol\` int NOT NULL DEFAULT '100', \`mute_all_voice\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`table_sessions\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`table_id\` bigint NOT NULL, \`user_id\` varchar(255) NOT NULL, \`seat_number\` int NOT NULL, \`chips_at_table\` bigint NOT NULL DEFAULT '0', \`joined_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`in_room_chats\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`table_id\` bigint NOT NULL, \`user_id\` varchar(255) NOT NULL, \`message_type\` varchar(20) NOT NULL, \`message_content\` text NOT NULL, \`sent_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`game_hands\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`table_id\` bigint NOT NULL, \`community_cards\` varchar(20) NULL, \`total_pot\` bigint NOT NULL DEFAULT '0', \`rake_taken\` bigint NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`hand_players\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`hand_id\` bigint NOT NULL, \`user_id\` varchar(255) NOT NULL, \`hole_cards\` varchar(20) NULL, \`chips_before\` bigint NOT NULL DEFAULT '0', \`chips_bet\` bigint NOT NULL DEFAULT '0', \`chips_won\` bigint NOT NULL DEFAULT '0', \`net_gain_loss\` bigint NOT NULL DEFAULT '0', \`is_winner\` tinyint NOT NULL DEFAULT 0, \`vpip\` tinyint NOT NULL DEFAULT 0, \`pfr\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`wallets\` ADD CONSTRAINT \`FK_92558c08091598f7a4439586cda\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`voice_room_sessions\` ADD CONSTRAINT \`FK_f69b9f82215c1535756a3f4af16\` FOREIGN KEY (\`table_id\`) REFERENCES \`tables\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`voice_room_sessions\` ADD CONSTRAINT \`FK_83125d849e3ca0af81c97173099\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_table_settings\` ADD CONSTRAINT \`FK_2f33eda67ad23f8801e38de7404\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_table_settings\` ADD CONSTRAINT \`FK_19bc0a427413b8d56560f0de03d\` FOREIGN KEY (\`table_id\`) REFERENCES \`tables\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`table_sessions\` ADD CONSTRAINT \`FK_73328bc5dcedce124fa829375bb\` FOREIGN KEY (\`table_id\`) REFERENCES \`tables\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`table_sessions\` ADD CONSTRAINT \`FK_4c4b324799e2564f42bb49f41be\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`in_room_chats\` ADD CONSTRAINT \`FK_4858139f3d827465f42c2768ea5\` FOREIGN KEY (\`table_id\`) REFERENCES \`tables\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`in_room_chats\` ADD CONSTRAINT \`FK_7fe3a340d075fdfaca4121e7a4f\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`game_hands\` ADD CONSTRAINT \`FK_d8d9d15b2f49b150bc2402e9fc4\` FOREIGN KEY (\`table_id\`) REFERENCES \`tables\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`hand_players\` ADD CONSTRAINT \`FK_ffc76ab81146a13e6a400dc4fca\` FOREIGN KEY (\`hand_id\`) REFERENCES \`game_hands\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`hand_players\` ADD CONSTRAINT \`FK_dfdf590412f8e3361ad56d3ae7b\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`hand_players\` DROP FOREIGN KEY \`FK_dfdf590412f8e3361ad56d3ae7b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`hand_players\` DROP FOREIGN KEY \`FK_ffc76ab81146a13e6a400dc4fca\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`game_hands\` DROP FOREIGN KEY \`FK_d8d9d15b2f49b150bc2402e9fc4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`in_room_chats\` DROP FOREIGN KEY \`FK_7fe3a340d075fdfaca4121e7a4f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`in_room_chats\` DROP FOREIGN KEY \`FK_4858139f3d827465f42c2768ea5\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`table_sessions\` DROP FOREIGN KEY \`FK_4c4b324799e2564f42bb49f41be\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`table_sessions\` DROP FOREIGN KEY \`FK_73328bc5dcedce124fa829375bb\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_table_settings\` DROP FOREIGN KEY \`FK_19bc0a427413b8d56560f0de03d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_table_settings\` DROP FOREIGN KEY \`FK_2f33eda67ad23f8801e38de7404\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`voice_room_sessions\` DROP FOREIGN KEY \`FK_83125d849e3ca0af81c97173099\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`voice_room_sessions\` DROP FOREIGN KEY \`FK_f69b9f82215c1535756a3f4af16\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`wallets\` DROP FOREIGN KEY \`FK_92558c08091598f7a4439586cda\``,
    );
    await queryRunner.query(`DROP TABLE \`hand_players\``);
    await queryRunner.query(`DROP TABLE \`game_hands\``);
    await queryRunner.query(`DROP TABLE \`in_room_chats\``);
    await queryRunner.query(`DROP TABLE \`table_sessions\``);
    await queryRunner.query(`DROP TABLE \`user_table_settings\``);
    await queryRunner.query(`DROP TABLE \`voice_room_sessions\``);
    await queryRunner.query(`DROP TABLE \`tables\``);
    await queryRunner.query(`DROP TABLE \`wallets\``);
  }
}
