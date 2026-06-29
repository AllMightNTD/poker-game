import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Notification } from '../entities/notification.entity';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
  transports: ['websocket'],
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  sendNotification(userId: string, notification: Notification) {
    if (!this.server) return;
    this.server.to(`user_${userId}`).emit('NEW_NOTIFICATION', notification);
    console.log(
      `[NotificationGateway] Broadcasted notification to user_${userId}`,
    );
  }
}
