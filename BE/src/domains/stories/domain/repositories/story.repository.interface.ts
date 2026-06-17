export interface IStoryRepository {
  createStory(userId: string, createStoryDto: any): Promise<any>;
  getStoryFeed(userId: string): Promise<any>;
  getStoryArchive(userId: string): Promise<any>;
  viewStory(userId: string, storyId: string): Promise<any>;
  getStoryViewers(userId: string, storyId: string): Promise<any>;
  reactStory(userId: string, storyId: string, emoji: string): Promise<any>;
  deleteStory(userId: string, storyId: string): Promise<any>;
  searchZingMp3(query: string): Promise<any>;
  getZingMp3SongStream(songId: string): Promise<any>;
  getZingMp3SongLyrics(songId: string): Promise<any>;
}
