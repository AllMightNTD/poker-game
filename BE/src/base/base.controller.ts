import { Body, Delete, Get, Param } from '@nestjs/common';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { BaseEntity } from 'typeorm';
import { DeleteByIdsDto } from './base.dto';
import { BaseService } from './base.service';

// @UseGuards(JwtAuthGuard)
export class BaseController<T extends BaseEntity> {
  constructor(private readonly service: BaseService<T, any>) {
    // empty
  }

  @Get()
  public findAll(@Paginate() query: PaginateQuery) {
    return this.service.findAll(query);
  }

  @Get(':id')
  public findOne(@Param('id') id: number) {
    return this.service.findOne({ id: id });
  }

  @Delete()
  public deleteByIds(@Body() { ids }: DeleteByIdsDto) {
    return this.service.deleteByIds(ids);
  }

  @Delete(':id')
  public delete(@Param('id') id: number) {
    return this.service.delete(id);
  }
}
