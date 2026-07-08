import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1783416282769 implements MigrationInterface {
  name = 'Migration1783416282769';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`audit_logs\` ADD \`userId\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`audit_logs\` ADD \`roomId\` bigint NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`audit_logs\` ADD \`actorId\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`audit_logs\` ADD CONSTRAINT \`FK_cfa83f61e4d27a87fcae1e025ab\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`audit_logs\` ADD CONSTRAINT \`FK_3c868775b83bc1eaa72de9251a6\` FOREIGN KEY (\`roomId\`) REFERENCES \`tables\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`audit_logs\` ADD CONSTRAINT \`FK_2dc33f7f3c22e2e7badafca1d12\` FOREIGN KEY (\`actorId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`audit_logs\` DROP FOREIGN KEY \`FK_2dc33f7f3c22e2e7badafca1d12\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`audit_logs\` DROP FOREIGN KEY \`FK_3c868775b83bc1eaa72de9251a6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`audit_logs\` DROP FOREIGN KEY \`FK_cfa83f61e4d27a87fcae1e025ab\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`audit_logs\` DROP COLUMN \`actorId\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`audit_logs\` DROP COLUMN \`roomId\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`audit_logs\` DROP COLUMN \`userId\``,
    );
  }
}
