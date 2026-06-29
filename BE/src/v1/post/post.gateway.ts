import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Post } from '../entities/post.entity';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
  transports: ['websocket'],
})
export class PostGateway {
  @WebSocketServer()
  server: Server;

  /**
   * Broadcast bài viết mới tới những user được phân quyền
   * @param post Thông tin bài viết
   * @param recipientUserIds Danh sách user_id được xem (đối với Friends, Only Me)
   * @param audience Quyền riêng tư (public, friends, only_me)
   */
  broadcastNewPost(post: any, recipientUserIds?: string[], audience?: string) {
    if (!this.server) {
      console.warn('[PostGateway] WebSocket server is not initialized yet.');
      return;
    }

    if (audience === 'public') {
      // Gửi toàn cục tới tất cả client đang online
      this.server.emit('newPost', post);
      console.log(`[PostGateway] Broadcasted public post ${post.id} globally.`);
    } else if (recipientUserIds && recipientUserIds.length > 0) {
      // Gửi đích danh tới từng phòng riêng user_${userId}
      recipientUserIds.forEach((userId) => {
        this.server.to(`user_${userId}`).emit('newPost', post);
      });
      console.log(
        `[PostGateway] Broadcasted post ${post.id} to ${recipientUserIds.length} recipient rooms:`,
        recipientUserIds,
      );
    }
  }

  /**
   * Broadcast sự kiện reaction (thả cảm xúc) mới tới những user được xem
   * @param postId ID bài viết
   * @param reactionData Thống kê reaction mới
   * @param recipientUserIds Danh sách user_id được xem (đối với Friends, Only Me)
   * @param audience Quyền riêng tư (public, friends, only_me)
   */
  broadcastPostReaction(
    postId: string,
    reactionData: any,
    recipientUserIds?: string[],
    audience?: string,
  ) {
    if (!this.server) {
      return;
    }

    const payload = { postId, ...reactionData };

    if (audience === 'public') {
      this.server.emit('postReaction', payload);
      console.log(
        `[PostGateway] Broadcasted reaction for post ${postId} globally.`,
      );
    } else if (recipientUserIds && recipientUserIds.length > 0) {
      recipientUserIds.forEach((userId) => {
        this.server.to(`user_${userId}`).emit('postReaction', payload);
      });
      console.log(
        `[PostGateway] Broadcasted reaction for post ${postId} to ${recipientUserIds.length} recipient rooms.`,
      );
    }
  }

  /**
   * Broadcast bài viết được chỉnh sửa tới những user được xem
   * @param post Thông tin bài viết
   * @param recipientUserIds Danh sách user_id được xem (đối với Friends, Only Me)
   * @param audience Quyền riêng tư (public, friends, only_me)
   */
  broadcastPostUpdate(
    post: any,
    recipientUserIds?: string[],
    audience?: string,
  ) {
    if (!this.server) {
      return;
    }

    if (audience === 'public') {
      this.server.emit('postUpdated', post);
      console.log(
        `[PostGateway] Broadcasted updated public post ${post.id} globally.`,
      );
    } else if (recipientUserIds && recipientUserIds.length > 0) {
      recipientUserIds.forEach((userId) => {
        this.server.to(`user_${userId}`).emit('postUpdated', post);
      });
      console.log(
        `[PostGateway] Broadcasted updated post ${post.id} to ${recipientUserIds.length} recipient rooms.`,
      );
    }
  }
}
