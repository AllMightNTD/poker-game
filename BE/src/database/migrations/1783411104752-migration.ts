import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1783411104752 implements MigrationInterface {
    name = 'Migration1783411104752'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`mode\` varchar(20) NOT NULL DEFAULT 'CUSTOM'`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`custom_settings\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`tables\` ADD \`tournament_settings\` json NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`tournament_settings\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`custom_settings\``);
        await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`mode\``);
    }

}
