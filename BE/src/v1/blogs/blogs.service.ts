import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  async findAll(query: any) {
    const limit = query.limit ? parseInt(query.limit) : 10;
    const page = query.page ? parseInt(query.page) : 1;
    const skip = (page - 1) * limit;

    const queryBuilder = this.blogRepository.createQueryBuilder('blog')
      .where('blog.is_published = :isPublished', { isPublished: true })
      .select([
        'blog.id', 'blog.title', 'blog.slug', 'blog.thumbnail', 
        'blog.excerpt', 'blog.category', 'blog.tags', 
        'blog.views_count', 'blog.created_at'
      ])
      .orderBy('blog.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.category) {
      queryBuilder.andWhere('blog.category = :category', { category: query.category });
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      data: items,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findOneBySlug(slug: string) {
    const blog = await this.blogRepository.findOne({
      where: { slug, is_published: true },
    });

    if (!blog) {
      throw new NotFoundException('Blog post not found');
    }

    // Increment views safely
    await this.blogRepository.increment({ id: blog.id }, 'views_count', 1);
    
    // Return with incremented view count
    blog.views_count += 1;
    return blog;
  }
}
