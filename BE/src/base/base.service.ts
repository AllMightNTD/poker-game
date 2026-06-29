import { BadRequestException, NotFoundException } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { DeleteResult, Repository } from 'typeorm';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';

export abstract class BaseService<T = any, ID = string> {
  protected sortableColumns: any = ['id'];
  protected defaultSortBy: any = [['id', 'ASC']];
  protected abstract filterableColumns: any;

  constructor(private readonly repository: Repository<T>) {
    // empty
  }

  public async findAll(
    query: PaginateQuery,
    cache?: boolean,
  ): Promise<Paginated<any>> {
    const queryBuilder = this.prepareQuery(query);

    if (cache) {
      queryBuilder.cache(true);
    }

    return paginate(query, queryBuilder, {
      sortableColumns: this.sortableColumns,
      defaultSortBy: this.defaultSortBy,
      filterableColumns: this.filterableColumns,
    });
  }

  public async findOne(
    conditions: Partial<any>,
    options: FindOneOptions<T> = {},
  ): Promise<any | undefined> {
    const data = await this.repository.findOne({
      where: conditions,
      ...options,
    });
    if (!data) {
      throw new NotFoundException('Data not found');
    }
    return {
      data: data,
    };
  }

  public async create(dto: any): Promise<any> {
    const instance = this.repository.create(dto);
    return await this.repository.save(instance as any);
  }

  public deleteByIds(ids: ID[]): Promise<DeleteResult> {
    return this.repository.delete(ids as any);
  }

  public delete(id: ID): Promise<DeleteResult> {
    return this.repository.delete(id as any);
  }

  protected async mapData(instance: any, dto: object) {
    const data = instanceToPlain(dto);

    for (const key in data) {
      instance[key] = data[key];
    }
  }

  private prepareQuery(query) {
    const tableName = this.repository.metadata.tableName;

    console.log('query', query);

    let queryBuilder = this.repository.createQueryBuilder(tableName);

    // 🧩 Kiểm tra query tồn tại
    if (!query) return queryBuilder;

    if (query.filter && !this.isObjectEmpty(query.filter)) {
      queryBuilder = this.parseFilter(queryBuilder, query.filter);
    }

    if (query.withs && Array.isArray(query.withs)) {
      queryBuilder = this.parseWiths(queryBuilder, query.withs);
    }

    return queryBuilder;
  }

  private parseWiths(queryBuilder, withs) {
    const tableName = this.repository.metadata.tableName;

    for (const w of withs) {
      queryBuilder.leftJoinAndSelect(`${tableName}.${w}`, w);
    }

    return queryBuilder;
  }

  private parseFilter(queryBuilder, filter) {
    const tableName = this.repository.metadata.tableName;

    for (const column of Object.keys(filter)) {
      const input = filter[column];

      if (typeof input !== 'string' || !input.trim()) {
        continue; // bỏ qua filter rỗng hoặc không hợp lệ
      }

      const statements = input.split(':');
      const [operator, value] = statements;

      // nếu không có operator, coi như tìm chính xác bằng giá trị input
      if (statements.length === 1) {
        queryBuilder.andWhere(`${tableName}.${column} = :${column}`, {
          [column]: input,
        });
        continue;
      }

      // Map operator to corresponding query builder strategies (OCP Compliant)
      const filterStrategies: Record<string, (qb: any, val: string) => void> = {
        $like: (qb, val) =>
          qb.andWhere(`${tableName}.${column} LIKE :${column}`, {
            [column]: `%${val}%`,
          }),
        $eq: (qb, val) => {
          if (val !== undefined && val !== 'NaN') {
            qb.andWhere(`${tableName}.${column} = :${column}`, {
              [column]: val,
            });
          }
        },
        $gt: (qb, val) => {
          if (!isNaN(Number(val))) {
            qb.andWhere(`${tableName}.${column} > :${column}`, {
              [column]: Number(val),
            });
          }
        },
        $lt: (qb, val) => {
          if (!isNaN(Number(val))) {
            qb.andWhere(`${tableName}.${column} < :${column}`, {
              [column]: Number(val),
            });
          }
        },
      };

      const strategy = filterStrategies[operator];
      if (strategy) {
        strategy(queryBuilder, value);
      }
    }

    return queryBuilder;
  }

  protected async uploadImage(fnUpload: any): Promise<string> {
    try {
      return await fnUpload;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  protected async deleteImage(fnDel: any): Promise<boolean> {
    try {
      return await fnDel;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  private isObjectEmpty(obj: Record<string, any>): boolean {
    return Object.keys(obj).length === 0;
  }
}
