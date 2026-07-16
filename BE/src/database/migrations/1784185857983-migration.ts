import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1784185857983 implements MigrationInterface {
  name = 'Migration1784185857983';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`game_hands\` ADD \`replay_json\` json NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`game_hands\` DROP COLUMN \`replay_json\``,
    );
  }
}
