import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1783416067366 implements MigrationInterface {
    name = 'Migration1783416067366'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`audit_logs\` (\`id\` varchar(36) NOT NULL, \`event_type\` varchar(50) NOT NULL, \`user_id\` varchar(255) NULL, \`room_id\` varchar(255) NULL, \`description\` text NOT NULL, \`level\` enum ('INFO', 'WARNING', 'ERROR', 'CRITICAL') NOT NULL DEFAULT 'INFO', \`metadata\` json NULL, \`ip_address\` varchar(255) NULL, \`user_agent\` text NULL, \`actor_id\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_2cd10fda8276bb995288acfbfb\` (\`created_at\`), INDEX \`IDX_b7bcf678ce319b50261be9a8d0\` (\`room_id\`), INDEX \`IDX_bd2726fd31b35443f2245b93ba\` (\`user_id\`), INDEX \`IDX_d4bbd861731298b2b1488683d4\` (\`event_type\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_d4bbd861731298b2b1488683d4\` ON \`audit_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_bd2726fd31b35443f2245b93ba\` ON \`audit_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_b7bcf678ce319b50261be9a8d0\` ON \`audit_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_2cd10fda8276bb995288acfbfb\` ON \`audit_logs\``);
        await queryRunner.query(`DROP TABLE \`audit_logs\``);
    }

}
