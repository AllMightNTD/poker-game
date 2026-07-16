import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1784185255006 implements MigrationInterface {
  name = 'Migration1784185255006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`game_hands\` ADD \`ai_analysis\` json NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`game_hands\` DROP COLUMN \`ai_analysis\``,
    );
  }
}
