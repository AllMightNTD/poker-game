import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResetPasswordColumns1778725986650 implements MigrationInterface {
  name = 'AddResetPasswordColumns1778725986650';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`reset_password_token\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_reset_password_token\` (\`reset_password_token\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`reset_password_expires_at\` datetime NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP INDEX \`IDX_reset_password_token\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`reset_password_token\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`reset_password_expires_at\``,
    );
  }
}
