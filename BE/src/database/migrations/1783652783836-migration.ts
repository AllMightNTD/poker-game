import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1783652783836 implements MigrationInterface {
  name = 'Migration1783652783836';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`club_members\` (\`id\` varchar(36) NOT NULL, \`club_id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`role\` enum ('OWNER', 'AGENT', 'MEMBER') NOT NULL DEFAULT 'MEMBER', \`credit_balance\` bigint NOT NULL DEFAULT '0', \`total_hands\` int NOT NULL DEFAULT '0', \`total_rake_paid\` bigint NOT NULL DEFAULT '0', \`status\` enum ('active', 'pending', 'banned') NOT NULL DEFAULT 'active', \`joined_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_96506fe68b3cffd38760ba3050\` (\`club_id\`, \`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`clubs\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`code\` varchar(10) NOT NULL, \`owner_id\` varchar(255) NOT NULL, \`description\` text NULL, \`max_members\` int NOT NULL DEFAULT '50', \`club_rake_rate\` decimal(4,2) NOT NULL DEFAULT '5.00', \`credit_pool\` bigint NOT NULL DEFAULT '0', \`status\` enum ('active', 'suspended', 'closed') NOT NULL DEFAULT 'active', \`settings\` json NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_23d07c54a2769ed7e6edba0321\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`agent_rakebacks\` (\`id\` varchar(36) NOT NULL, \`club_id\` varchar(255) NOT NULL, \`agent_id\` varchar(255) NOT NULL, \`period\` varchar(7) NOT NULL, \`total_rake\` bigint NOT NULL DEFAULT '0', \`rakeback_pct\` decimal(4,2) NOT NULL DEFAULT '10.00', \`rakeback_amount\` bigint NOT NULL DEFAULT '0', \`status\` enum ('pending', 'paid') NOT NULL DEFAULT 'pending', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`player_stats\` (\`user_id\` varchar(255) NOT NULL, \`hands_played\` int NOT NULL DEFAULT '0', \`hands_won\` int NOT NULL DEFAULT '0', \`total_chips_won\` bigint NOT NULL DEFAULT '0', \`total_rake_paid\` bigint NOT NULL DEFAULT '0', \`biggest_pot\` bigint NOT NULL DEFAULT '0', \`current_xp\` int NOT NULL DEFAULT '0', \`level\` varchar(20) NOT NULL DEFAULT 'bronze', \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`leaderboard_entries\` (\`id\` varchar(36) NOT NULL, \`period_type\` varchar(10) NOT NULL, \`period\` varchar(15) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`rank\` int NOT NULL, \`chips_won\` bigint NOT NULL DEFAULT '0', \`hands_played\` int NOT NULL DEFAULT '0', \`rake_paid\` bigint NOT NULL DEFAULT '0', \`snapshot_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`achievements\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`type\` varchar(50) NOT NULL, \`unlocked_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_5343de911e51c8a7efa69423fa\` (\`user_id\`, \`type\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tables\` ADD \`club_id\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`club_members\` ADD CONSTRAINT \`FK_eb8c3ab7481d80579c96f26aeef\` FOREIGN KEY (\`club_id\`) REFERENCES \`clubs\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`club_members\` ADD CONSTRAINT \`FK_898da09d81b2b69882052c92c3e\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`clubs\` ADD CONSTRAINT \`FK_b208f1bfca28ae915ab2557e75e\` FOREIGN KEY (\`owner_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tables\` ADD CONSTRAINT \`FK_389756d75398e1d653b4993bb4a\` FOREIGN KEY (\`club_id\`) REFERENCES \`clubs\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`agent_rakebacks\` ADD CONSTRAINT \`FK_1775ae56c5fc49c4e643bb3bbc8\` FOREIGN KEY (\`club_id\`) REFERENCES \`clubs\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`agent_rakebacks\` ADD CONSTRAINT \`FK_14fcca9b0328ccea158500edb55\` FOREIGN KEY (\`agent_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`player_stats\` ADD CONSTRAINT \`FK_f6d777852a4a0e0416afbcdf6a5\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`leaderboard_entries\` ADD CONSTRAINT \`FK_1c6886ea7af50f939576cfec934\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`achievements\` ADD CONSTRAINT \`FK_0c0cd24bc6e722c12cd45750434\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`achievements\` DROP FOREIGN KEY \`FK_0c0cd24bc6e722c12cd45750434\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`leaderboard_entries\` DROP FOREIGN KEY \`FK_1c6886ea7af50f939576cfec934\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`player_stats\` DROP FOREIGN KEY \`FK_f6d777852a4a0e0416afbcdf6a5\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`agent_rakebacks\` DROP FOREIGN KEY \`FK_14fcca9b0328ccea158500edb55\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`agent_rakebacks\` DROP FOREIGN KEY \`FK_1775ae56c5fc49c4e643bb3bbc8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tables\` DROP FOREIGN KEY \`FK_389756d75398e1d653b4993bb4a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`clubs\` DROP FOREIGN KEY \`FK_b208f1bfca28ae915ab2557e75e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`club_members\` DROP FOREIGN KEY \`FK_898da09d81b2b69882052c92c3e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`club_members\` DROP FOREIGN KEY \`FK_eb8c3ab7481d80579c96f26aeef\``,
    );
    await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`club_id\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_5343de911e51c8a7efa69423fa\` ON \`achievements\``,
    );
    await queryRunner.query(`DROP TABLE \`achievements\``);
    await queryRunner.query(`DROP TABLE \`leaderboard_entries\``);
    await queryRunner.query(`DROP TABLE \`player_stats\``);
    await queryRunner.query(`DROP TABLE \`agent_rakebacks\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_23d07c54a2769ed7e6edba0321\` ON \`clubs\``,
    );
    await queryRunner.query(`DROP TABLE \`clubs\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_96506fe68b3cffd38760ba3050\` ON \`club_members\``,
    );
    await queryRunner.query(`DROP TABLE \`club_members\``);
  }
}
