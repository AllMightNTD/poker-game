import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1783059749627 implements MigrationInterface {
    name = 'Migration1783059749627'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`game_hands\` ADD \`server_seed\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`game_hands\` ADD \`client_seed\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`game_hands\` ADD \`shuffled_deck\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`game_hands\` DROP COLUMN \`shuffled_deck\``);
        await queryRunner.query(`ALTER TABLE \`game_hands\` DROP COLUMN \`client_seed\``);
        await queryRunner.query(`ALTER TABLE \`game_hands\` DROP COLUMN \`server_seed\``);
    }

}
