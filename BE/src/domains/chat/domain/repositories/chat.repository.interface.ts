export interface IChatRepository {
  getOrCreateConversation(userId: string, friendId: string): Promise<any>;
  checkParticipant(userId: string, conversationId: string): Promise<boolean>;
  getMessages(conversationId: string, page: number, limit: number): Promise<any>;
  getConversations(userId: string, page: number, limit: number, search?: string, tab?: string): Promise<any>;
  markAsRead(userId: string, conversationId: string, messageId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  togglePinConversation(userId: string, conversationId: string, isPinned: boolean): Promise<boolean>;
  getMedia(conversationId: string, page: number, limit: number, type?: string): Promise<any>;
  leaveConversation(userId: string, conversationId: string): Promise<boolean>;
  toggleMuteConversation(userId: string, conversationId: string, isMuted: boolean): Promise<boolean>;
  toggleArchiveConversation(userId: string, conversationId: string, isArchived: boolean): Promise<boolean>;
  toggleHideConversation(userId: string, conversationId: string, isHidden: boolean): Promise<boolean>;
  toggleSpamConversation(userId: string, conversationId: string, isSpam: boolean): Promise<boolean>;
  toggleRequestConversation(userId: string, conversationId: string, isRequest: boolean): Promise<boolean>;
  markAsUnread(userId: string, conversationId: string): Promise<boolean>;
  blockUser(userId: string, blockedId: string): Promise<boolean>;
  unblockUser(userId: string, blockedId: string): Promise<boolean>;
}
