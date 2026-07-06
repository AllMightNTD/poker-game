import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogsService } from './blogs.service';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.blogsService.findAll(query);
  }

  @Get(':slug')
  async findOneBySlug(@Param('slug') slug: string) {
    return this.blogsService.findOneBySlug(slug);
  }
}
