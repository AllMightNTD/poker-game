import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationGateway } from './notification.gateway';

export interface CreateNotificationParams {
  user_id: string;
  actor_id: string;
  type: string;
  payload: Record<string, any>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async createNotification(params: CreateNotificationParams) {
    if (params.user_id === params.actor_id) {
      // Prevent self-notifications
      return null;
    }

    const notification = this.notificationRepository.create(params);
    const savedNotification =
      await this.notificationRepository.save(notification);

    // Fetch with actor details for frontend
    const fullNotification = await this.notificationRepository.findOne({
      where: { id: savedNotification.id },
      relations: ['actor', 'actor.profile'],
    });

    if (fullNotification) {
      this.notificationGateway.sendNotification(
        params.user_id,
        fullNotification,
      );
    }

    return savedNotification;
  }

  async getNotifications(userId: string, page: number = 1, size: number = 20) {
    const [notifications, total] =
      await this.notificationRepository.findAndCount({
        where: { user_id: userId },
        relations: ['actor', 'actor.profile'],
        order: { created_at: 'DESC' },
        take: size,
        skip: (page - 1) * size,
      });

    return {
      data: notifications,
      meta: {
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationRepository.count({
      where: {
        user_id: userId,
        read_at: IsNull(),
      },
    });

    return { count };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id, user_id: userId },
    });

    if (notification && !notification.read_at) {
      notification.read_at = new Date();
      await this.notificationRepository.save(notification);
      return true;
    }
    return false;
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { user_id: userId, read_at: IsNull() },
      { read_at: new Date() },
    );
    return true;
  }
}
