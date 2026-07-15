import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';
import { Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';
import { CrawlLog } from '../entities/crawl-log.entity';

@Injectable()
export class BlogsCrawlerService {
  private readonly logger = new Logger(BlogsCrawlerService.name);
  private readonly rssParser = new Parser();
  private readonly rssUrls = [
    'https://www.cardplayer.com/poker-news.rss',
    'https://www.pokerstrategy.com/rss/news/',
  ];

  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(CrawlLog)
    private readonly crawlLogRepository: Repository<CrawlLog>,
    private readonly configService: ConfigService,
  ) { }

  // Chạy Cron Job tự động mỗi 6 tiếng
  @Cron(CronExpression.EVERY_6_HOURS)
  async handleCron() {
    const isCronOn = this.configService.get<string>('POKER_NEWS_CRON_ON') === 'true';
    if (!isCronOn) {
      this.logger.log('Poker News Crawl Cron Job is currently disabled in configuration.');
      return;
    }

    this.logger.log('Starting Poker News Crawl Cron Job...');
    await this.crawlPokerNews();
    this.logger.log('Poker News Crawl Cron Job completed.');
  }

  // Trigger chạy bằng tay cho Admin qua API (nếu cần)
  async crawlPokerNews() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not configured. Cannot process articles.');
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Sử dụng gemini-2.5-flash để đạt hiệu năng tối đa và tối ưu hóa chi phí
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    for (const rssUrl of this.rssUrls) {
      try {
        const rssResponse = await axios.get(rssUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/xml, text/xml, */*'
          },
          timeout: 10000,
        });

        const feed = await this.rssParser.parseString(rssResponse.data);
        // Chỉ xử lý 5 bài báo mới nhất mỗi đợt quét
        const items = feed.items.slice(0, 5);

        for (const item of items) {
          const originalTitle = item.title;
          const originalLink = item.link;

          if (!originalTitle || !originalLink) continue;

          // 1. Kiểm tra xem ván bài/bài viết này đã được crawl thành công trước đó chưa
          const existingLog = await this.crawlLogRepository.findOne({
            where: { title: originalTitle, status: 'SUCCESS' },
          });

          if (existingLog) {
            this.logger.log(`Skipping already processed article: "${originalTitle}"`);
            continue;
          }

          this.logger.log(`Processing article: "${originalTitle}"`);

          let thumbnail: string | null = null;
          let contentHtml: string | null = null;

          // 2. Fetch ảnh thumbnail và nội dung gốc (Fallback 1)
          try {
            // Lấy ảnh Thumbnail từ RSS enclosure trước
            if (item.enclosure?.url) {
              thumbnail = item.enclosure.url;
            }

            const response = await axios.get(originalLink, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              },
              timeout: 10000,
            });

            const $ = cheerio.load(response.data);

            // Bóc tách OpenGraph thumbnail nếu chưa có
            if (!thumbnail) {
              thumbnail = $('meta[property="og:image"]').attr('content') || null;
            }

            // Lấy nội dung chi tiết bài viết (giúp Gemini có nguồn dịch chính xác hơn)
            // Hầu hết các trang tin tức Poker đặt nội dung chính trong class/tag article, .article-content, hoặc main
            const mainContent = $('.article-content, article, .post-content, .entry-content').first();
            if (mainContent.length > 0) {
              contentHtml = mainContent.text().trim();
            } else {
              contentHtml = $('main').text().trim();
            }
          } catch (fetchError) {
            this.logger.warn(`Failed to fetch full HTML content for: ${originalLink}. Activating Fallback to RSS snippet.`);
          }

          // Fallback sang RSS contentSnippet/description nếu không cào được nội dung đầy đủ
          const sourceText = contentHtml && contentHtml.length > 200
            ? contentHtml
            : (item.contentSnippet || item.content || originalTitle);

          // 3. Gọi Gemini API dịch và cấu trúc bài viết
          try {
            const prompt = `
              You are an expert Poker player and a professional SEO Copywriter.
              Write a high-quality news article in Vietnamese based on the following original English source.
              Ensure the tone is professional, engaging, and uses standard Vietnamese Poker terminology.
              Format the content with clean HTML tags (like <h2>, <h3>, <p>, <strong>, <ul>, <li>). Do not include <html> or <body> tags.
              
              Translate the title creatively to attract readers.
              Provide a short, SEO-optimized excerpt (150-200 characters).
              Categorize the article into one of these: Strategy, News, Tournament, Lifestyle.
              Generate 3-5 relevant tags.

              Original Title: "${originalTitle}"
              Original Content Source: "${sourceText}"

              You must respond in strict JSON format matching this schema:
              {
                "title": "Vietnamese title",
                "content": "Clean HTML content formatted with <h2>, <h3>, <p>, <strong>, <ul>, <li>",
                "excerpt": "Short SEO summary",
                "category": "News | Strategy | Tournament | Lifestyle",
                "tags": ["tag1", "tag2", "tag3"]
              }
            `;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            const parsedData = JSON.parse(responseText);

            // 4. Sinh Slug an toàn và Lưu vào CSDL
            const baseSlug = this.slugify(parsedData.title);
            let uniqueSlug = baseSlug;
            let counter = 1;

            while (await this.blogRepository.findOne({ where: { slug: uniqueSlug } })) {
              uniqueSlug = `${baseSlug}-${counter}`;
              counter++;
            }

            const newBlog = this.blogRepository.create({
              title: parsedData.title,
              slug: uniqueSlug,
              thumbnail: thumbnail || 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?q=80&w=1000', // ảnh mặc định Poker
              content: parsedData.content,
              excerpt: parsedData.excerpt,
              category: parsedData.category || 'News',
              tags: parsedData.tags || [],
              is_published: false, // Để Admin kiểm duyệt trước
              views_count: 0,
            });

            const savedBlog = await this.blogRepository.save(newBlog);

            // 5. Ghi log thành công
            await this.crawlLogRepository.save(
              this.crawlLogRepository.create({
                title: originalTitle,
                source_url: originalLink,
                status: 'SUCCESS',
                blog_id: savedBlog.id,
              })
            );

            this.logger.log(`Successfully imported article as Blog: "${parsedData.title}"`);

          } catch (geminiError) {
            this.logger.error(`Failed to process article with Gemini or save to DB: ${originalTitle}`, geminiError.stack);

            // Ghi log thất bại
            await this.crawlLogRepository.save(
              this.crawlLogRepository.create({
                title: originalTitle,
                source_url: originalLink,
                status: 'FAILED',
                error_message: `Gemini/DB Error: ${geminiError.message}`,
              })
            );
          }

          // Delay 15 giây giữa các request để bypass giới hạn 5 RPM (requests per minute) của Gemini Free Tier
          await new Promise(resolve => setTimeout(resolve, 15000));
        }
      } catch (rssError) {
        this.logger.error(`Failed to parse RSS feed: ${rssUrl}`, rssError.stack);
      }
    }
  }

  // Hàm tạo slug từ Tiếng Việt không dấu
  private slugify(text: string): string {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Thay space bằng -
      .replace(/[^\w\-]+/g, '') // Loại bỏ ký tự đặc biệt
      .replace(/\-\-+/g, '-'); // Tránh nhiều dấu gạch ngang liên tiếp
  }
}
