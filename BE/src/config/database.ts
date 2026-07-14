import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as process from 'node:process';
import { DataSource, DataSourceOptions, getMetadataArgsStorage } from 'typeorm';
import { ColumnMetadataArgs } from 'typeorm/metadata-args/ColumnMetadataArgs';

dotenv.config({ path: '.env' });
const config = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  autoLoadEntities: true,
  synchronize: false,
  retryAttempts: 5,
  retryDelay: 3000,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
  charset: 'utf8mb4',
  logging: false,
  ssl:
    process.env.DB_SSL === 'true' ||
    (process.env.DB_HOST && process.env.DB_HOST.includes('tidbcloud.com'))
      ? { rejectUnauthorized: false }
      : undefined,
};

export default registerAs('database', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);

export function getEntityColumns<T>(entity): (keyof T)[] {
  const columns = getMetadataArgsStorage()
    .columns.filter((column: ColumnMetadataArgs) => column.target == entity)
    .map((d) => d.propertyName);
  return columns as (keyof T)[];
}
