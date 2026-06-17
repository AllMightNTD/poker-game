export interface IPostRepository {
  createPost(userId: string, createPostDto: any): Promise<any>;
  getPostById(id: string): Promise<any>;
  getFeedPosts(userId: string, page: number, limit: number): Promise<any>;
  getProfilePosts(targetUserId: string, currentUserId: string): Promise<any>;
  toggleReaction(userId: string, postId: string, type: any): Promise<any>;
  updatePost(userId: string, postId: string, updatePostDto: any): Promise<any>;
}
