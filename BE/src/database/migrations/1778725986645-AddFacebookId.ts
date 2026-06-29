import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFacebookId1778725986645 implements MigrationInterface {
  name = 'AddFacebookId1778725986645';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`facebook_id\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_df199bc6e53abe32d64bbcf211\` (\`facebook_id\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP INDEX \`IDX_df199bc6e53abe32d64bbcf211\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`facebook_id\``,
    );
  }
}
