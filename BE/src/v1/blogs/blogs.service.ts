import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';
import { GameHand } from '../entities/game_hand.entity';
import { HandAction } from '../entities/hand_action.entity';
import { HandPlayer } from '../entities/hand_player.entity';

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
    @InjectRepository(GameHand)
    private readonly gameHandRepository: Repository<GameHand>,
    @InjectRepository(HandPlayer)
    private readonly handPlayerRepository: Repository<HandPlayer>,
    @InjectRepository(HandAction)
    private readonly handActionRepository: Repository<HandAction>,
    private readonly configService: ConfigService,
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

    const qb = this.blogRepository
      .createQueryBuilder('blog')
      .where('blog.is_published = :isPublished', { isPublished: true })
      .select([
        'blog.id',
        'blog.title',
        'blog.slug',
        'blog.thumbnail',
        'blog.excerpt',
        'blog.category',
        'blog.tags',
        'blog.views_count',
        'blog.created_at',
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

  async findOne(id: string) {
    const blog = await this.blogRepository.findOne({ where: { id } });
    if (!blog) {
      throw new NotFoundException('Blog post not found');
    }
    return blog;
  }

  async adminFindAll(query: BlogListQuery) {
    const limit = Math.min(parseInt(query.limit as string) || 12, 50);
    const category = query.category;

    let cursorDate: Date | null = null;
    let cursorId: string | null = null;

    if (query.cursor) {
      try {
        const decoded = Buffer.from(query.cursor, 'base64').toString('utf-8');
        const [dateStr, id] = decoded.split('__');
        cursorDate = new Date(dateStr);
        cursorId = id;
      } catch {
        // Invalid cursor
      }
    }

    const qb = this.blogRepository
      .createQueryBuilder('blog')
      .orderBy('blog.created_at', 'DESC')
      .addOrderBy('blog.id', 'DESC')
      .take(limit + 1);

    if (category) {
      qb.andWhere('blog.category = :category', { category });
    }

    if (cursorDate && cursorId) {
      qb.andWhere(
        '(blog.created_at < :cursorDate OR (blog.created_at = :cursorDate AND blog.id < :cursorId))',
        { cursorDate, cursorId },
      );
    }

    const items = await qb.getMany();

    const hasNextPage = items.length > limit;
    const data = hasNextPage ? items.slice(0, limit) : items;

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

  async create(data: any, authorId: string) {
    const slugBase = this.slugify(data.title);
    const slug = `${slugBase}-${Date.now()}`;
    const blog = this.blogRepository.create({
      ...data,
      slug,
      author_id: authorId,
    });
    return this.blogRepository.save(blog);
  }

  async update(id: string, data: any) {
    const blog = await this.findOne(id);

    if (data.title) {
      const slugBase = this.slugify(data.title);
      blog.slug = `${slugBase}-${Date.now()}`;
    }

    Object.assign(blog, data);
    return this.blogRepository.save(blog);
  }

  async delete(id: string) {
    const blog = await this.findOne(id);
    await this.blogRepository.remove(blog);
    return { success: true };
  }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  /**
   * Export full hand history for the Blog Hand Replayer.
   * Returns the GameHand, list of HandPlayers with user info, and all HandActions sorted by action_order.
   */
  async getHandDetail(handId: string) {
    const hand = await this.gameHandRepository.findOne({
      where: { id: handId },
      relations: ['table'],
    });
    if (!hand) {
      throw new NotFoundException(`Hand ${handId} not found`);
    }

    const players = await this.handPlayerRepository.find({
      where: { hand_id: handId },
      relations: ['user'],
    });

    const actions = await this.handActionRepository.find({
      where: { hand_id: handId },
      order: { action_order: 'ASC' },
      relations: ['user'],
    });

    return {
      hand: {
        id: hand.id,
        table_name: hand.table?.name ?? null,
        dealer_seat: hand.dealer_seat,
        small_blind_seat: hand.small_blind_seat,
        big_blind_seat: hand.big_blind_seat,
        community_cards: hand.community_cards,
        total_pot: hand.total_pot,
        hand_stage: hand.hand_stage,
        started_at: hand.started_at,
        ended_at: hand.ended_at,
      },
      players: players.map((p) => ({
        user_id: p.user_id,
        user_name: p.user?.user_name ?? 'Player',
        avatar_url: p.user?.avatar_url ?? null,
        seat_number: p.seat_number,
        hole_cards: p.hole_cards,
        initial_stack: p.initial_stack,
        chips_won: p.chips_won,
        net_gain_loss: p.net_gain_loss,
        is_winner: p.is_winner,
      })),
      actions: actions.map((a) => ({
        id: a.id,
        user_id: a.user_id,
        user_name: a.user?.user_name ?? 'Player',
        seat_number: a.seat_number,
        stage: a.stage,
        action_type: a.action_type,
        amount: a.amount,
        action_order: a.action_order,
        is_all_in: a.is_all_in,
      })),
    };
  }

  /**
   * Call Gemini REST API to generate AI coaching commentary for a hand.
   * Requires GEMINI_API_KEY in environment variables.
   */
  async getAiCoachAnalysis(handId: string) {
    const handData = await this.getHandDetail(handId);
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException(
        'GEMINI_API_KEY is not configured on the server.',
      );
    }

    const prompt = [
      `You are an expert poker coach. Analyse the following Texas Hold'em hand history and provide concise tactical commentary for each betting round.`,
      ``,
      `== HAND SUMMARY ==`,
      `Community cards: ${handData.hand.community_cards ?? 'none revealed'}`,
      `Total pot: ${handData.hand.total_pot} chips`,
      ``,
      `== PLAYERS ==`,
      ...handData.players.map(
        (p) =>
          `Seat ${p.seat_number} (${p.user_name}): hole_cards=${p.hole_cards ?? '??'}, initial_stack=${p.initial_stack}, net=${p.net_gain_loss} [${p.is_winner ? 'WINNER' : 'loser'}]`,
      ),
      ``,
      `== ACTION TIMELINE ==`,
      ...handData.actions.map(
        (a) =>
          `[${a.stage.toUpperCase()}] Seat ${a.seat_number} (${a.user_name}): ${a.action_type}${Number(a.amount) > 0 ? ' ' + a.amount + ' chips' : ''}`,
      ),
      ``,
      `Provide commentary in 3-5 bullet points, one per betting round (Preflop, Flop, Turn, River). Focus on key decision points, mistakes, and what the optimal play would have been. Be direct and concise.`,
    ].join('\n');

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new InternalServerErrorException(`Gemini API error: ${errBody}`);
    }

    const result = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text =
      result.candidates?.[0]?.content?.parts?.[0]?.text ??
      'No analysis available.';

    return {
      hand_id: handId,
      analysis: text,
      model: 'gemini-1.5-flash',
      generated_at: new Date().toISOString(),
    };
  }
}
