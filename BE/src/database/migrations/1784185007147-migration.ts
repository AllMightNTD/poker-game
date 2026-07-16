import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1784185007147 implements MigrationInterface {
  name = 'Migration1784185007147';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`crawl_logs\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`source_url\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL, \`attempt_count\` int NOT NULL DEFAULT '0', \`error_message\` text NULL, \`blog_id\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_ac2dcc387fa4cd98f26086390e\` (\`title\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_ac2dcc387fa4cd98f26086390e\` ON \`crawl_logs\``,
    );
    await queryRunner.query(`DROP TABLE \`crawl_logs\``);
  }
}
