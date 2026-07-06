import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';

export interface BlogListQuery {
  cursor?: string;
  limit?: string | number;
  category?: string;
}

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  /**
   * Cursor-based pagination using (created_at, id) as composite cursor.
   * Query param: cursor=<base64(created_at__id)>, limit, category
   */
  async findAll(query: BlogListQuery) {
    const limit = Math.min(parseInt(query.limit as string) || 12, 50);
    const category = query.category;

    // Decode cursor: base64("<ISO_DATE>__<uuid>")
    let cursorDate: Date | null = null;
    let cursorId: string | null = null;

    if (query.cursor) {
      try {
        const decoded = Buffer.from(query.cursor, 'base64').toString('utf-8');
        const [dateStr, id] = decoded.split('__');
        cursorDate = new Date(dateStr);
        cursorId = id;
      } catch {
        // Invalid cursor — start from beginning
      }
    }

    const qb = this.blogRepository.createQueryBuilder('blog')
      .where('blog.is_published = :isPublished', { isPublished: true })
      .select([
        'blog.id', 'blog.title', 'blog.slug', 'blog.thumbnail',
        'blog.excerpt', 'blog.category', 'blog.tags',
        'blog.views_count', 'blog.created_at',
      ])
      .orderBy('blog.created_at', 'DESC')
      .addOrderBy('blog.id', 'DESC')
      .take(limit + 1); // fetch one extra to determine if there is a next page

    if (category) {
      qb.andWhere('blog.category = :category', { category });
    }

    // Apply cursor filter: rows older than cursor point
    if (cursorDate && cursorId) {
      qb.andWhere(
        '(blog.created_at < :cursorDate OR (blog.created_at = :cursorDate AND blog.id < :cursorId))',
        { cursorDate, cursorId },
      );
    }

    const items = await qb.getMany();

    // Determine if next page exists
    const hasNextPage = items.length > limit;
    const data = hasNextPage ? items.slice(0, limit) : items;

    // Build next cursor from the last item in the page
    let nextCursor: string | null = null;
    if (hasNextPage && data.length > 0) {
      const last = data[data.length - 1];
      const raw = `${last.created_at.toISOString()}__${last.id}`;
      nextCursor = Buffer.from(raw).toString('base64');
    }

    return {
      data,
      meta: {
        limit,
        has_next_page: hasNextPage,
        next_cursor: nextCursor,
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
