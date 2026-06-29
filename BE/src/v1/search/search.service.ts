import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchHistory } from '../entities/search_history.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(SearchHistory)
    private searchHistoryRepo: Repository<SearchHistory>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async searchUsers(query: string, userId: string) {
    if (!query) return [];

    const users = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('profile.full_name LIKE :query OR profile.username LIKE :query', {
        query: `%${query}%`,
      })
      .take(10)
      .getMany();

    return users.map((user) => ({
      id: user.id,
      name: user.profile?.full_name,
      username: user.profile?.username,
      avatar: user.profile?.avatar_url,
    }));
  }

  async getHistory(userId: string) {
    const history = await this.searchHistoryRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: 20,
    });

    // Remove duplicates
    const uniqueKeywords = new Set();
    const result = [];
    for (const item of history) {
      if (!uniqueKeywords.has(item.keyword)) {
        uniqueKeywords.add(item.keyword);
        result.push(item);
      }
    }
    return result.slice(0, 10); // Keep max 10 recent
  }

  async saveHistory(userId: string, keyword: string) {
    const existing = await this.searchHistoryRepo.findOne({
      where: { user_id: userId, keyword },
    });
    if (existing) {
      existing.created_at = new Date();
      await this.searchHistoryRepo.save(existing);
    } else {
      const history = this.searchHistoryRepo.create({
        user_id: userId,
        keyword,
      });
      await this.searchHistoryRepo.save(history);
    }
  }

  async deleteHistory(id: string, userId: string) {
    await this.searchHistoryRepo.delete({ id, user_id: userId });
  }
}
