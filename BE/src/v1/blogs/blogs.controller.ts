import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from '../admin/guards/admin.guard';
import { BlogsService } from './blogs.service';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';

// ---------------------------------------------------------------------------
// Public endpoints — no authentication required
// ---------------------------------------------------------------------------
@ApiTags('📰 Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  @ApiOperation({
    summary: 'Danh sách bài viết (public)',
    description: `Lấy danh sách bài viết bằng **Cursor Pagination** hiệu suất cao.
- Lần đầu gọi: không cần truyền \`cursor\`.
- Lần tiếp: truyền \`next_cursor\` từ response trước vào param \`cursor\`.
- Không bao giờ bị nhảy/trùng data dù có bài viết mới được thêm vào.`,
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'Cursor opaque token từ response trước (meta.next_cursor).',
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
  })
  async findAll(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
  ) {
    return this.blogsService.findAll({ cursor, limit, category });
  }

  // ---------------------------------------------------------------------------
  // Admin CRUD endpoints — AdminGuard required
  // ---------------------------------------------------------------------------
  @Get('admin/all')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Admin] Danh sách tất cả bài viết (kể cả chưa xuất bản)',
  })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  async adminFindAll(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
  ) {
    return this.blogsService.adminFindAll({ cursor, limit, category });
  }

  @Post('admin')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Tạo bài viết mới' })
  @ApiResponse({ status: 201, description: 'Bài viết đã được tạo thành công' })
  async create(@Body() dto: CreateBlogDto, @Request() req) {
    const adminId = req.admin?.sub ?? 'system';
    return this.blogsService.create(dto, adminId);
  }

  @Put('admin/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Cập nhật bài viết theo ID' })
  @ApiParam({ name: 'id', type: String, description: 'Blog UUID' })
  async update(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.blogsService.update(id, dto);
  }

  @Delete('admin/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Xóa bài viết theo ID' })
  @ApiParam({ name: 'id', type: String, description: 'Blog UUID' })
  async delete(@Param('id') id: string) {
    return this.blogsService.delete(id);
  }

  // ---------------------------------------------------------------------------
  // Hand History endpoints (public GET, POST ai-coach requires nothing extra)
  // ---------------------------------------------------------------------------
  @Get('hands/:id')
  @ApiOperation({
    summary: 'Chi tiết ván bài (Hand History Export)',
    description:
      'Trả về toàn bộ thông tin ván bài: community cards, danh sách người chơi, lịch sử hành động. Dùng cho Hand Replayer trên Blog.',
  })
  @ApiParam({ name: 'id', type: String, description: 'GameHand ID' })
  async getHandDetail(@Param('id') id: string) {
    return this.blogsService.getHandDetail(id);
  }

  @Post('hands/:id/ai-coach')
  @ApiOperation({
    summary: 'AI Coach – Phân tích chiến thuật ván bài bằng Gemini',
    description:
      'Gọi Gemini API để bình luận từng vòng cược và đưa ra nhận xét chiến thuật.',
  })
  @ApiParam({ name: 'id', type: String, description: 'GameHand ID' })
  async getAiCoach(@Param('id') id: string) {
    return this.blogsService.getAiCoachAnalysis(id);
  }

  // ---------------------------------------------------------------------------
  // Public — by slug (MUST be last to avoid "admin" being captured as a slug)
  // ---------------------------------------------------------------------------
  @Get(':slug')
  @ApiOperation({
    summary: 'Chi tiết bài viết (public)',
    description:
      'Lấy nội dung đầy đủ của một bài viết theo slug. Tự động tăng `views_count` mỗi lần gọi.',
  })
  @ApiParam({
    name: 'slug',
    type: String,
    example: 'master-the-river-bet-1720234567890',
  })
  @ApiResponse({
    status: 404,
    description: 'Bài viết không tồn tại hoặc chưa được xuất bản',
  })
  async findOneBySlug(@Param('slug') slug: string) {
    return this.blogsService.findOneBySlug(slug);
  }
}
