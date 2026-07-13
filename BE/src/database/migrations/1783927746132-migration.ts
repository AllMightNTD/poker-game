import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1783927746132 implements MigrationInterface {
  name = 'Migration1783927746132';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`provably_fair_audits\` (\`id\` varchar(36) NOT NULL, \`table_id\` bigint NOT NULL, \`hand_id\` bigint NOT NULL, \`server_seed_hash\` varchar(64) NOT NULL, \`encrypted_server_seed\` text NOT NULL, \`auth_tag\` varchar(64) NOT NULL, \`client_seed\` varchar(64) NOT NULL, \`nonce\` int NOT NULL, \`deck_hash\` varchar(64) NOT NULL, \`algorithm_version\` varchar(32) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`revealed_at\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`provably_fair_audits\``);
  }
}
