import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1781839555491 implements MigrationInterface {
  name = 'Migration1781839555491';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`profiles\` ADD \`profile_music_id\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`profiles\` DROP COLUMN \`profile_music_id\``,
    );
  }
}
