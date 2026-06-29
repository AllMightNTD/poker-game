import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1782462998658 implements MigrationInterface {
  name = 'Migration1782462998658';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE TABLE \`comments\``);
    await queryRunner.query(
      `ALTER TABLE \`comments\` DROP COLUMN \`target_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` DROP COLUMN \`target_type\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD \`post_id\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_259bf9825d9d198608d1b46b0b5\` FOREIGN KEY (\`post_id\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_259bf9825d9d198608d1b46b0b5\``,
    );
    await queryRunner.query(`ALTER TABLE \`comments\` DROP COLUMN \`post_id\``);
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD \`target_type\` enum ('post', 'article', 'photo') NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD \`target_id\` varchar(255) NOT NULL`,
    );
  }
}
