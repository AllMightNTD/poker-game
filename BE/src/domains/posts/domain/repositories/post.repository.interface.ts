export interface IPostRepository {
  createPost(userId: string, createPostDto: any): Promise<any>;
  getPostById(id: string): Promise<any>;
  getFeedPosts(userId: string, page: number, limit: number): Promise<any>;
  getProfilePosts(
    targetUserId: string,
    currentUserId: string,
    page: number,
    limit: number,
  ): Promise<any>;
  deletePost(userId: string, postId: string): Promise<any>;
  toggleReaction(userId: string, postId: string, type: any): Promise<any>;
  updatePost(userId: string, postId: string, updatePostDto: any): Promise<any>;
  getProfileMedia(
    targetUserId: string,
    currentUserId: string,
    type: 'IMAGE' | 'VIDEO',
    page: number,
    limit: number,
  ): Promise<any>;
  deleteMedia(userId: string, mediaId: string): Promise<any>;
}
