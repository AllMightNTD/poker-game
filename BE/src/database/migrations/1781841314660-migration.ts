import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1781841314660 implements MigrationInterface {
  name = 'Migration1781841314660';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD \`type\` enum ('text', 'voice', 'media') NOT NULL DEFAULT 'text'`,
    );
    await queryRunner.query(`ALTER TABLE \`reactions\` DROP COLUMN \`type\``);
    await queryRunner.query(
      `ALTER TABLE \`reactions\` ADD \`type\` varchar(50) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`reactions\` DROP COLUMN \`type\``);
    await queryRunner.query(
      `ALTER TABLE \`reactions\` ADD \`type\` enum ('like', 'love', 'care', 'haha', 'wow', 'sad', 'angry') NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`comments\` DROP COLUMN \`type\``);
  }
}
