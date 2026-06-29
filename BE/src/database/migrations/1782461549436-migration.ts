import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1782461549436 implements MigrationInterface {
  name = 'Migration1782461549436';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`pages\` ADD \`auto_reply_enabled\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`pages\` ADD \`welcome_message\` text NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`pages\` ADD \`faq_data\` json NULL`);
    await queryRunner.query(
      `ALTER TABLE \`posts\` ADD \`status\` enum ('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`status\``);
    await queryRunner.query(`ALTER TABLE \`pages\` DROP COLUMN \`faq_data\``);
    await queryRunner.query(
      `ALTER TABLE \`pages\` DROP COLUMN \`welcome_message\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`pages\` DROP COLUMN \`auto_reply_enabled\``,
    );
  }
}
