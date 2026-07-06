import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse,
} from '@nestjs/swagger';
import { BlogsService } from './blogs.service';

@ApiTags('📰 Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  @ApiOperation({
    summary: 'Danh sách bài viết',
    description: `Lấy danh sách bài viết bằng **Cursor Pagination** hiệu suất cao.
- Lần đầu gọi: không cần truyền \`cursor\`.
- Lần tiếp: truyền \`next_cursor\` từ response trước vào param \`cursor\`.
- Không bao giờ bị nhảy/trùng data dù có bài viết mới được thêm vào.`,
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'Cursor opaque token từ response trước (meta.next_cursor). Bỏ trống để bắt đầu từ đầu.',
    example: 'MjAyNi0wNy0wNlQwNTowMDowMC4wMDBaX191dWlkNDU2',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số bài viết mỗi trang (mặc định: 12, tối đa: 50)',
    example: 12,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: ['Strategy', 'Tournament', 'News', 'Lifestyle'],
    description: 'Lọc theo thể loại bài viết',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách bài viết + cursor cho trang tiếp theo',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            title: 'Master the River Bet',
            slug: 'master-the-river-bet',
            thumbnail: 'https://images.unsplash.com/photo-xxx',
            excerpt: 'The river is where fortunes are made...',
            category: 'Strategy',
            tags: ['bluff', 'river', 'advanced'],
            views_count: 4231,
            created_at: '2026-07-06T05:00:00.000Z',
          },
        ],
        meta: {
          limit: 12,
          has_next_page: true,
          next_cursor: 'MjAyNi0wNy0wNlQwNTowMDowMC4wMDBaX191dWlkNDU2',
        },
      },
    },
  })
  async findAll(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
  ) {
    return this.blogsService.findAll({ cursor, limit, category });
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Chi tiết bài viết',
    description: 'Lấy nội dung đầy đủ của một bài viết theo slug. Tự động tăng `views_count` mỗi lần gọi.',
  })
  @ApiParam({
    name: 'slug',
    type: String,
    description: 'URL-friendly identifier của bài viết',
    example: 'master-the-river-bet-1720234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết bài viết đầy đủ',
    schema: {
      example: {
        id: 'uuid',
        title: 'Master the River Bet',
        slug: 'master-the-river-bet',
        thumbnail: 'https://images.unsplash.com/photo-xxx',
        content: '<h2>Introduction</h2><p>The river...</p>',
        excerpt: 'The river is where fortunes are made...',
        category: 'Strategy',
        tags: ['bluff', 'river', 'advanced'],
        author_id: 'user-uuid',
        views_count: 4232,
        created_at: '2026-07-06T05:00:00.000Z',
        updated_at: '2026-07-06T05:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Bài viết không tồn tại hoặc chưa được xuất bản' })
  async findOneBySlug(@Param('slug') slug: string) {
    return this.blogsService.findOneBySlug(slug);
  }
}
