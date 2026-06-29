export interface IFriendRepository {
  getFriends(userId: string, page: number, limit: number): Promise<any>;
  sendFriendRequest(senderId: string, receiverId: string): Promise<any>;
  acceptFriendRequest(userId: string, requestId: string): Promise<any>;
  declineFriendRequest(userId: string, requestId: string): Promise<any>;
  cancelFriendRequest(userId: string, requestId: string): Promise<any>;
  unfriend(userId: string, friendId: string): Promise<any>;
  getPendingRequests(userId: string, page: number, limit: number): Promise<any>;
  getSentRequests(userId: string, page: number, limit: number): Promise<any>;
  countPendingRequests(userId: string): Promise<number>;
  getFriendSuggestions(
    userId: string,
    page: number,
    limit: number,
  ): Promise<any>;
  searchFriends(
    userId: string,
    keyword: string,
    page: number,
    limit: number,
  ): Promise<any>;
  getMutualFriends(
    currentUserId: string,
    targetUserId: string,
    page: number,
    limit: number,
  ): Promise<any>;
}
