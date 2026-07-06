import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Blog } from './src/v1/entities/blog.entity';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const blogRepo = app.get<Repository<Blog>>(getRepositoryToken(Blog));

  const blogs = [
    {
      title: 'Top 5 Bluffing Techniques for High-Stakes Games',
      slug: 'top-5-bluffing-techniques',
      thumbnail: 'https://images.unsplash.com/photo-1541577717466-9b19b780829d?q=80&w=2071&auto=format&fit=crop',
      content: `<h2>Master the Art of Deception</h2>
<p>Bluffing is the cornerstone of Texas Hold'em. If you can't bluff, you can't win. Here are our top 5 strategies:</p>
<ul>
<li><strong>The Semi-Bluff:</strong> Always have an out.</li>
<li><strong>The Squeeze Play:</strong> Attack weakness with aggression.</li>
<li><strong>Blocker Bluffs:</strong> Know what your opponent DOESN'T have.</li>
</ul>
<p>Remember, the best bluff is the one they never see coming.</p>`,
      excerpt: 'Learn the psychological warfare behind the perfect bluff and increase your win rate by 20%.',
      category: 'Strategy',
      tags: ['Bluffing', 'Texas Holdem', 'Psychology'],
    },
    {
      title: 'Global Poker Championship 2026 Announced',
      slug: 'global-poker-championship-2026',
      thumbnail: 'https://images.unsplash.com/photo-1595188846313-11a5b81f1807?q=80&w=2070&auto=format&fit=crop',
      content: `<h2>The Biggest Event of the Year</h2>
<p>Get ready for a massive $10M guaranteed prize pool! The Global Poker Championship returns this winter.</p>
<p>Satellites are running now. Will you be the next champion?</p>`,
      excerpt: 'Qualify now for the $10M guaranteed prize pool in the most anticipated tournament of the year.',
      category: 'Tournament',
      tags: ['News', 'GPC2026', 'High Roller'],
    },
    {
      title: 'Understanding Position: The Ultimate Advantage',
      slug: 'understanding-position',
      thumbnail: 'https://images.unsplash.com/photo-1563203494-dfeb58611116?q=80&w=2071&auto=format&fit=crop',
      content: `<h2>Why Position is Everything</h2>
<p>Money flows towards the button. If you are playing out of position, you are playing blind.</p>
<p>In this guide, we break down positional awareness and how to exploit early position limpers.</p>`,
      excerpt: 'Why the dealer button is your best friend and how to leverage positional advantage to dominate the table.',
      category: 'Strategy',
      tags: ['Basics', 'Position', 'Strategy'],
    }
  ];

  for (const b of blogs) {
    const existing = await blogRepo.findOne({ where: { slug: b.slug } });
    if (!existing) {
      await blogRepo.save(blogRepo.create(b));
      console.log('Seeded:', b.title);
    }
  }

  console.log('Blog seeding completed!');
  await app.close();
}

bootstrap();
