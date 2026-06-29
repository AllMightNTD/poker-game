import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpgradeChatFeatures1778725986670 implements MigrationInterface {
  name = 'UpgradeChatFeatures1778725986670';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Thêm các cột vào conversation_participants
    await queryRunner.query(
      `ALTER TABLE \`conversation_participants\` ADD \`is_archived\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversation_participants\` ADD \`is_hidden\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversation_participants\` ADD \`is_spam\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversation_participants\` ADD \`is_request\` tinyint NOT NULL DEFAULT 0`,
    );

    // 2. Tạo bảng user_blocks
    await queryRunner.query(`
            CREATE TABLE \`user_blocks\` (
                \`blocker_id\` varchar(255) NOT NULL,
                \`blocked_id\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`blocker_id\`, \`blocked_id\`),
                CONSTRAINT \`FK_user_blocks_blocker\` FOREIGN KEY (\`blocker_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT \`FK_user_blocks_blocked\` FOREIGN KEY (\`blocked_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop bảng user_blocks
    await queryRunner.query(`DROP TABLE IF EXISTS \`user_blocks\``);

    // Drop các cột ở conversation_participants
    await queryRunner.query(
      `ALTER TABLE \`conversation_participants\` DROP COLUMN \`is_archived\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversation_participants\` DROP COLUMN \`is_hidden\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversation_participants\` DROP COLUMN \`is_spam\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversation_participants\` DROP COLUMN \`is_request\``,
    );
  }
}
