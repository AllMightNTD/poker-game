export interface ICommentRepository {
  getComments(targetType: any, targetId: string, query: any): Promise<any>;
  getReplies(commentId: string, query: any): Promise<any>;
  createComment(userId: string, createCommentDto: any): Promise<any>;
  updateComment(userId: string, commentId: string, updateCommentDto: any): Promise<any>;
  deleteComment(userId: string, commentId: string): Promise<any>;
}
