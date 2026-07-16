import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdminRefreshTokens1784186000000 implements MigrationInterface {
  name = 'CreateAdminRefreshTokens1784186000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`admin_refresh_tokens\` (
        \`id\` varchar(36) NOT NULL,
        \`admin_id\` varchar(255) NOT NULL,
        \`token_hash\` varchar(500) NOT NULL,
        \`expires_at\` datetime NOT NULL,
        \`revoked_at\` datetime NULL,
        \`device_info\` varchar(255) NULL,
        \`ip_address\` varchar(45) NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_admin_token_hash\` (\`token_hash\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`,
    );

    await queryRunner.query(
      `ALTER TABLE \`admin_refresh_tokens\` ADD CONSTRAINT \`FK_admin_refresh_tokens_admin_id\` FOREIGN KEY (\`admin_id\`) REFERENCES \`admins\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`admin_refresh_tokens\` DROP FOREIGN KEY \`FK_admin_refresh_tokens_admin_id\``,
    );
    await queryRunner.query(`DROP TABLE \`admin_refresh_tokens\``);
  }
}
