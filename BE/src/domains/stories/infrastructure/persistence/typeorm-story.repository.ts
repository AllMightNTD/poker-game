import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { IStoryRepository } from '../../domain/repositories/story.repository.interface';
import { Story } from 'src/v1/entities/story.entity';
import { StoryView } from 'src/v1/entities/story_view.entity';
import { Friend } from 'src/v1/entities/friend.entity';
import { Reaction } from 'src/v1/entities/reaction.entity';
import { ReactionTargetType, StoryAudience } from 'src/constants/enums';

@Injectable()
export class TypeOrmStoryRepository implements IStoryRepository {
  constructor(
    @InjectRepository(Story)
    private readonly storyRepository: Repository<Story>,
    @InjectRepository(StoryView)
    private readonly storyViewRepository: Repository<StoryView>,
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    @InjectRepository(Reaction)
    private readonly reactionRepository: Repository<Reaction>,
  ) {}

  async createStory(userId: string, createStoryDto: any): Promise<any> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const story = this.storyRepository.create({
      ...createStoryDto,
      user_id: userId,
      expires_at: expiresAt,
    });

    return await this.storyRepository.save(story) as any;
  }

  async getStoryFeed(userId: string) {
    const friends = await this.friendRepository.find({
      where: { user_id: userId },
      select: ['friend_id'],
    });
    const friendIds = friends.map((f) => f.friend_id);

    const now = new Date();
    const stories = await this.storyRepository.find({
      where: [
        {
          user_id: userId,
          expires_at: MoreThan(now),
        },
        ...(friendIds.length > 0
          ? [
              {
                user_id: In(friendIds),
                audience: In([StoryAudience.PUBLIC, StoryAudience.FRIENDS]),
                expires_at: MoreThan(now),
              },
            ]
          : []),
      ],
      relations: ['user', 'user.profile', 'views'],
      order: {
        created_at: 'ASC',
      },
    });

    const storyIds = stories.map((s) => s.id);
    let reactions: any[] = [];
    if (storyIds.length > 0) {
      reactions = await this.reactionRepository.find({
        where: {
          target_type: ReactionTargetType.STORY,
          target_id: In(storyIds),
        },
        relations: ['user', 'user.profile'],
      });
    }

    const groupedFeedMap = new Map<string, any>();

    for (const story of stories) {
      const creator = story.user;
      if (!creator) continue;

      const profile = creator.profile;
      const creatorData = {
        id: creator.id,
        email: creator.email,
        full_name: profile?.full_name || 'Người dùng KnowBlock',
        avatar_url: profile?.avatar_url || null,
        username: profile?.username || creator.id,
      };

      const hasViewed = story.views.some((v) => v.viewer_id === userId);

      if (!groupedFeedMap.has(creator.id)) {
        groupedFeedMap.set(creator.id, {
          user: creatorData,
          stories: [],
          hasUnviewed: false,
        });
      }

      const userFeed = groupedFeedMap.get(creator.id);
      const storyReactions = reactions.filter((r) => r.target_id === story.id);

      const { views, user: _, ...storyData } = story as any;
      storyData.hasViewed = hasViewed;
      storyData.reactions = storyReactions.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        type: r.type,
        emoji: this.getEmojiForReactionType(r.type),
        user: {
          id: r.user.id,
          full_name: r.user.profile?.full_name || 'Người dùng KnowBlock',
          avatar_url: r.user.profile?.avatar_url || null,
        },
      }));

      userFeed.stories.push(storyData);
      if (!hasViewed) {
        userFeed.hasUnviewed = true;
      }
    }

    const feedArray = Array.from(groupedFeedMap.values());
    feedArray.sort((a, b) => {
      if (a.user.id === userId) return -1;
      if (b.user.id === userId) return 1;
      if (a.hasUnviewed && !b.hasUnviewed) return -1;
      if (!a.hasUnviewed && b.hasUnviewed) return 1;
      return 0;
    });

    return feedArray;
  }

  async getStoryArchive(userId: string): Promise<Story[]> {
    const now = new Date();
    return await this.storyRepository.find({
      where: {
        user_id: userId,
        expires_at: LessThanOrEqual(now),
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  async viewStory(userId: string, storyId: string): Promise<{ success: boolean }> {
    const story = await this.storyRepository.findOne({ where: { id: storyId } });
    if (!story) {
      throw new NotFoundException('Story không tồn tại');
    }

    const existingView = await this.storyViewRepository.findOne({
      where: { story_id: storyId, viewer_id: userId },
    });

    if (!existingView) {
      const view = this.storyViewRepository.create({
        story_id: storyId,
        viewer_id: userId,
      });
      await this.storyViewRepository.save(view);

      story.view_count += 1;
      await this.storyRepository.save(story);
    }

    return { success: true };
  }

  async getStoryViewers(userId: string, storyId: string) {
    const story = await this.storyRepository.findOne({ where: { id: storyId } });
    if (!story) {
      throw new NotFoundException('Story không tồn tại');
    }

    if (story.user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem danh sách người xem của story này');
    }

    const views = await this.storyViewRepository.find({
      where: { story_id: storyId },
      relations: ['viewer', 'viewer.profile'],
      order: {
        viewed_at: 'DESC',
      },
    });

    return views.map((v) => {
      const viewer = v.viewer;
      const profile = viewer?.profile;
      return {
        viewed_at: v.viewed_at,
        viewer: {
          id: viewer?.id,
          full_name: profile?.full_name || 'Người dùng KnowBlock',
          avatar_url: profile?.avatar_url || null,
          username: profile?.username || viewer?.id,
        },
      };
    });
  }

  async deleteStory(userId: string, storyId: string): Promise<{ success: boolean }> {
    const story = await this.storyRepository.findOne({ where: { id: storyId } });
    if (!story) {
      throw new NotFoundException('Story không tồn tại');
    }

    if (story.user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa story này');
    }

    await this.storyRepository.remove(story);
    return { success: true };
  }

  private getEmojiForReactionType(type: string): string {
    switch (type) {
      case 'love': return '❤️';
      case 'like': return '👍';
      case 'haha': return '😂';
      case 'sad': return '😢';
      case 'wow': return '😮';
      case 'care': return '🥰';
      case 'angry': return '😡';
      default: return '❤️';
    }
  }

  private getReactionTypeForEmoji(emoji: string): any {
    switch (emoji) {
      case '❤️': return 'love';
      case '👍': return 'like';
      case '😂': case '👏': return 'haha';
      case '😢': return 'sad';
      case '😮': case '🔥': return 'wow';
      case '🥰': return 'care';
      case '😡': return 'angry';
      default: return 'love';
    }
  }

  async reactStory(userId: string, storyId: string, emoji: string) {
    const story = await this.storyRepository.findOne({ where: { id: storyId } });
    if (!story) {
      throw new NotFoundException('Story không tồn tại');
    }

    const reactionType = this.getReactionTypeForEmoji(emoji);

    const existingReaction = await this.reactionRepository.findOne({
      where: {
        user_id: userId,
        target_type: ReactionTargetType.STORY,
        target_id: storyId,
      },
    });

    if (existingReaction) {
      if (existingReaction.type === reactionType) {
        await this.reactionRepository.remove(existingReaction);
      } else {
        existingReaction.type = reactionType;
        await this.reactionRepository.save(existingReaction);
      }
    } else {
      const reaction = this.reactionRepository.create({
        user_id: userId,
        target_type: ReactionTargetType.STORY,
        target_id: storyId,
        type: reactionType,
      });
      await this.reactionRepository.save(reaction);
    }

    const updatedReactions = await this.reactionRepository.find({
      where: {
        target_type: ReactionTargetType.STORY,
        target_id: storyId,
      },
      relations: ['user', 'user.profile'],
    });

    return updatedReactions.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      type: r.type,
      emoji: this.getEmojiForReactionType(r.type),
      user: {
        id: r.user.id,
        full_name: r.user.profile?.full_name || 'Người dùng KnowBlock',
        avatar_url: r.user.profile?.avatar_url || null,
        username: r.user.profile?.username || r.user.id,
      },
    }));
  }

  async searchZingMp3(query: string) {
    try {
      const { ZingMp3 } = require('zingmp3-api-full');
      const res = await ZingMp3.search(query);
      if (!res || !res.data || !res.data.songs) {
        return [];
      }
      return res.data.songs.map((song: any) => ({
        id: song.encodeId,
        title: song.title,
        artist: song.artistsNames,
        coverUrl: song.thumbnail,
        duration: song.duration,
      }));
    } catch (err) {
      console.error('Error searching ZingMp3:', err);
      return [];
    }
  }

  async getZingMp3SongStream(songId: string) {
    try {
      const { ZingMp3 } = require('zingmp3-api-full');
      const res = await ZingMp3.getSong(songId);
      if (res && res.data && res.data['128']) {
        return {
          streamUrl: res.data['128'],
        };
      }
      return { streamUrl: null };
    } catch (err) {
      console.error('Error fetching stream link from ZingMp3:', err);
      return { streamUrl: null };
    }
  }

  async getZingMp3SongLyrics(songId: string) {
    try {
      const { ZingMp3 } = require('zingmp3-api-full');
      const res = await ZingMp3.getLyric(songId);
      if (!res || !res.data || !res.data.sentences) {
        return [];
      }
      return res.data.sentences.map((sentence: any) => {
        const words = Array.isArray(sentence) ? sentence : sentence.words || [];
        const time = words.length > 0 ? words[0].startTime / 1000 : 0;
        const text = words.map((w: any) => w.data).join(' ');
        return {
          time,
          text,
        };
      });
    } catch (err) {
      console.error('Error fetching lyrics from ZingMp3:', err);
      return [];
    }
  }
}
