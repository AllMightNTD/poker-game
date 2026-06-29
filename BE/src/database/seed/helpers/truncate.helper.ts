import { DataSource, QueryRunner } from 'typeorm';

export async function truncateAllTables(
  dataSource: DataSource,
  queryRunner: QueryRunner,
) {
  await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');

  const entities = dataSource.entityMetadatas;

  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);

    await repository.clear();
  }

  await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
}
