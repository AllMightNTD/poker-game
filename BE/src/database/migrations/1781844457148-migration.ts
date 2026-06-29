import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1781844457148 implements MigrationInterface {
  name = 'Migration1781844457148';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`profiles\` ADD \`address\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`profiles\` ADD \`postcode\` varchar(50) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`profiles\` DROP COLUMN \`postcode\``,
    );
    await queryRunner.query(`ALTER TABLE \`profiles\` DROP COLUMN \`address\``);
  }
}
