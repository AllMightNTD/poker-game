import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1781838494932 implements MigrationInterface {
  name = 'Migration1781838494932';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_blocks\` DROP FOREIGN KEY \`FK_user_blocks_blocked\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_blocks\` DROP FOREIGN KEY \`FK_user_blocks_blocker\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_reset_password_token\` ON \`users\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`is_active_status\` tinyint NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`message_permission\` enum ('everyone', 'friends', 'followers', 'none') NOT NULL DEFAULT 'everyone'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversation_participants\` ADD \`nickname\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversation_participants\` ADD \`is_pinned\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversations\` ADD \`background_image\` varchar(500) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_ee6419219542371563e0592db5\` (\`reset_password_token\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` CHANGE \`type\` \`type\` enum ('text', 'image', 'file', 'sticker', 'voice', 'video_call_log', 'system', 'video') NOT NULL DEFAULT 'text'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_blocks\` ADD CONSTRAINT \`FK_dfcd8a81016d1de587fbd2d70bf\` FOREIGN KEY (\`blocker_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_blocks\` ADD CONSTRAINT \`FK_7a0806a54f0ad9ced3e247cacd1\` FOREIGN KEY (\`blocked_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_blocks\` DROP FOREIGN KEY \`FK_7a0806a54f0ad9ced3e247cacd1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_blocks\` DROP FOREIGN KEY \`FK_dfcd8a81016d1de587fbd2d70bf\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` CHANGE \`type\` \`type\` enum ('text', 'image', 'file', 'sticker', 'voice', 'video_call_log', 'system') NOT NULL DEFAULT 'text'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP INDEX \`IDX_ee6419219542371563e0592db5\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversations\` DROP COLUMN \`background_image\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversation_participants\` DROP COLUMN \`is_pinned\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`conversation_participants\` DROP COLUMN \`nickname\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`message_permission\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`is_active_status\``,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_reset_password_token\` ON \`users\` (\`reset_password_token\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_blocks\` ADD CONSTRAINT \`FK_user_blocks_blocker\` FOREIGN KEY (\`blocker_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_blocks\` ADD CONSTRAINT \`FK_user_blocks_blocked\` FOREIGN KEY (\`blocked_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
