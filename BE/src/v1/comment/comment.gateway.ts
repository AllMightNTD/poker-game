import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
  transports: ['websocket'],
})
export class CommentGateway {
  @WebSocketServer()
  server: Server;

  /**
   * Broadcast comment mới tới những user được phép xem
   */
  broadcastCommentCreated(
    comment: any,
    recipientUserIds?: string[],
    audience?: string,
  ) {
    if (!this.server) return;

    if (audience === 'public') {
      this.server.emit('commentCreated', comment);
    } else if (recipientUserIds && recipientUserIds.length > 0) {
      recipientUserIds.forEach((userId) => {
        this.server.to(`user_${userId}`).emit('commentCreated', comment);
      });
    }
  }

  /**
   * Broadcast comment cập nhật tới những user được phép xem
   */
  broadcastCommentUpdated(
    comment: any,
    recipientUserIds?: string[],
    audience?: string,
  ) {
    if (!this.server) return;

    if (audience === 'public') {
      this.server.emit('commentUpdated', comment);
    } else if (recipientUserIds && recipientUserIds.length > 0) {
      recipientUserIds.forEach((userId) => {
        this.server.to(`user_${userId}`).emit('commentUpdated', comment);
      });
    }
  }

  /**
   * Broadcast xóa comment tới những user được phép xem
   */
  broadcastCommentDeleted(
    payload: { commentId: string; parentId?: string; postId: string },
    recipientUserIds?: string[],
    audience?: string,
  ) {
    if (!this.server) return;

    if (audience === 'public') {
      this.server.emit('commentDeleted', payload);
    } else if (recipientUserIds && recipientUserIds.length > 0) {
      recipientUserIds.forEach((userId) => {
        this.server.to(`user_${userId}`).emit('commentDeleted', payload);
      });
    }
  }
}
