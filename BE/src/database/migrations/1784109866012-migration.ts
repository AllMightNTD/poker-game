import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1784109866012 implements MigrationInterface {
  name = 'Migration1784109866012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`crawl_logs\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`source_url\` varchar(500) NULL, \`status\` varchar(50) NOT NULL, \`error_message\` text NULL, \`blog_id\` varchar(36) NULL, \`processed_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`status\` \`status\` enum ('ACTIVE', 'INACTIVE', 'BANNED', 'MEMORIALIZED') NOT NULL DEFAULT 'ACTIVE'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`crawl_logs\` ADD CONSTRAINT \`FK_dd2957dfb5d6fe7beabeba9979d\` FOREIGN KEY (\`blog_id\`) REFERENCES \`blogs\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`crawl_logs\` DROP FOREIGN KEY \`FK_dd2957dfb5d6fe7beabeba9979d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`status\` \`status\` enum ('ACTIVE', 'INACTIVE', 'BANNED') NOT NULL DEFAULT 'ACTIVE'`,
    );
    await queryRunner.query(`DROP TABLE \`crawl_logs\``);
  }
}
