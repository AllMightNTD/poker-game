import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPostBackgroundColumn1778725986660 implements MigrationInterface {
  name = 'AddPostBackgroundColumn1778725986660';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`posts\` ADD \`post_background\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`posts\` DROP COLUMN \`post_background\``,
    );
  }
}
