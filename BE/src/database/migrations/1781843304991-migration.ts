import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1781843304991 implements MigrationInterface {
  name = 'Migration1781843304991';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`search_histories\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`keyword\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`profiles\` ADD \`hobbies\` json NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`profiles\` DROP COLUMN \`hobbies\``);
    await queryRunner.query(`DROP TABLE \`search_histories\``);
  }
}
