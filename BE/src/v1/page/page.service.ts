import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from '../entities/page.entity';
import { PageAdmin } from '../entities/page_admin.entity';
import { Follow } from '../entities/follow.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { UpdateAutoReplyDto } from './dto/update-auto-reply.dto';
import {
  PageAdminRole,
  FollowingType,
  FollowStatus,
} from 'src/constants/enums';

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(PageAdmin)
    private readonly pageAdminRepository: Repository<PageAdmin>,
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
  ) {}

  async create(createPageDto: CreatePageDto, userId: string): Promise<Page> {
    const existingUsername = await this.pageRepository.findOne({
      where: { username: createPageDto.username },
    });
    if (existingUsername) {
      throw new BadRequestException('Page username already exists');
    }

    const page = this.pageRepository.create({
      ...createPageDto,
      created_by: userId,
      follower_count: 0,
    });
    const savedPage = await this.pageRepository.save(page);

    const admin = this.pageAdminRepository.create({
      page_id: savedPage.id,
      user_id: userId,
      role: PageAdminRole.ADMIN,
    });
    await this.pageAdminRepository.save(admin);

    return savedPage;
  }

  async findAll(): Promise<Page[]> {
    return this.pageRepository.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: string): Promise<Page> {
    const page = await this.pageRepository.findOne({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async update(
    id: string,
    updatePageDto: UpdatePageDto,
    userId: string,
  ): Promise<Page> {
    const page = await this.findOne(id);
    await this.checkAdmin(id, userId);
    Object.assign(page, updatePageDto);
    return this.pageRepository.save(page);
  }

  async remove(id: string, userId: string): Promise<void> {
    const page = await this.findOne(id);
    await this.checkAdmin(id, userId);
    await this.pageRepository.remove(page);
  }

  // --- Follow System ---

  async followPage(pageId: string, userId: string) {
    const existing = await this.followRepository.findOne({
      where: {
        follower_id: userId,
        following_entity_id: pageId,
        following_type: FollowingType.PAGE,
      },
    });

    if (existing) {
      throw new BadRequestException('Already following this page');
    }

    const follow = this.followRepository.create({
      follower_id: userId,
      following_entity_id: pageId,
      following_type: FollowingType.PAGE,
      status: FollowStatus.ACTIVE,
    });

    await this.followRepository.save(follow);
    await this.pageRepository.increment({ id: pageId }, 'follower_count', 1);

    return follow;
  }

  async unfollowPage(pageId: string, userId: string) {
    const follow = await this.followRepository.findOne({
      where: {
        follower_id: userId,
        following_entity_id: pageId,
        following_type: FollowingType.PAGE,
      },
    });

    if (!follow) {
      throw new BadRequestException('Not following this page');
    }

    await this.followRepository.remove(follow);
    await this.pageRepository.decrement({ id: pageId }, 'follower_count', 1);
  }

  // --- Page Admin System ---
  async getAdmins(pageId: string) {
    return this.pageAdminRepository.find({
      where: { page_id: pageId },
      relations: ['user'],
    });
  }

  // --- Auto-Reply System ---
  async updateAutoReply(
    pageId: string,
    updateAutoReplyDto: UpdateAutoReplyDto,
    userId: string,
  ) {
    const page = await this.findOne(pageId);
    await this.checkAdmin(pageId, userId);

    Object.assign(page, updateAutoReplyDto);
    return this.pageRepository.save(page);
  }

  async sendMessageToPage(pageId: string, message: string, userId: string) {
    const page = await this.findOne(pageId);
    const responses = [];

    // Simulate standard receiving logic
    responses.push({ sender: 'user', content: message });

    if (page.auto_reply_enabled) {
      if (page.welcome_message && message.toLowerCase().includes('hello')) {
        responses.push({ sender: 'page', content: page.welcome_message });
      } else if (page.faq_data && Array.isArray(page.faq_data)) {
        const foundFaq = page.faq_data.find((faq: any) =>
          message.toLowerCase().includes(faq.question.toLowerCase()),
        );
        if (foundFaq) {
          responses.push({ sender: 'page', content: foundFaq.answer });
        } else {
          responses.push({
            sender: 'page',
            content:
              'Xin chào! Cảm ơn bạn đã nhắn tin. Chúng tôi sẽ phản hồi sớm nhất có thể.',
          });
        }
      } else {
        responses.push({
          sender: 'page',
          content:
            page.welcome_message ||
            'Xin chào! Chúng tôi sẽ phản hồi sớm nhất có thể.',
        });
      }
    }

    return responses;
  }

  private async checkAdmin(pageId: string, userId: string) {
    const admin = await this.pageAdminRepository.findOne({
      where: { page_id: pageId, user_id: userId },
    });
    if (!admin) {
      throw new ForbiddenException('Require Admin role for this Page');
    }
  }
}
