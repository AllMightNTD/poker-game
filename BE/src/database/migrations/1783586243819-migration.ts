import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1783586243819 implements MigrationInterface {
  name = 'Migration1783586243819';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`promo_events\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`subtitle\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`badge\` varchar(100) NOT NULL, \`color_gradient\` varchar(255) NOT NULL, \`icon_type\` varchar(50) NOT NULL, \`link_url\` varchar(255) NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`start_date\` timestamp NULL, \`end_date\` timestamp NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`promo_events\``);
  }
}
