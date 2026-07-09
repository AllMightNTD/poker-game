import { Injectable, NotFoundException } from '@nestjs/common';
import { PromoEvent } from '../../entities/event.entity';
import { CreateEventDto, UpdateEventDto } from '../dto/event.dto';

@Injectable()
export class AdminEventsService {
  async getActiveEvents(): Promise<PromoEvent[]> {
    const now = new Date();
    // Query active events: is_active is true, and current time is between start_date and end_date
    const query = PromoEvent.createQueryBuilder('event').where(
      'event.is_active = :isActive',
      { isActive: true },
    );

    // Filter by start_date and end_date using SQL conditions
    query.andWhere('(event.start_date IS NULL OR event.start_date <= :now)', {
      now,
    });
    query.andWhere('(event.end_date IS NULL OR event.end_date >= :now)', {
      now,
    });

    query.orderBy('event.created_at', 'DESC');

    return query.getMany();
  }

  async getAllEvents(
    search?: string,
    activeOnly?: boolean,
  ): Promise<PromoEvent[]> {
    const query = PromoEvent.createQueryBuilder('event');

    if (search) {
      query.where(
        '(event.title LIKE :search OR event.subtitle LIKE :search OR event.badge LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (activeOnly !== undefined) {
      query.andWhere('event.is_active = :isActive', { isActive: activeOnly });
    }

    query.orderBy('event.created_at', 'DESC');

    return query.getMany();
  }

  async createEvent(dto: CreateEventDto): Promise<PromoEvent> {
    const event = new PromoEvent();
    event.title = dto.title;
    event.subtitle = dto.subtitle;
    event.description = dto.description;
    event.badge = dto.badge;
    event.color_gradient = dto.color_gradient;
    event.icon_type = dto.icon_type;
    event.link_url = dto.link_url || null;
    event.is_active = dto.is_active !== undefined ? dto.is_active : true;
    event.start_date = dto.start_date ? new Date(dto.start_date) : null;
    event.end_date = dto.end_date ? new Date(dto.end_date) : null;

    return event.save();
  }

  async updateEvent(id: string, dto: UpdateEventDto): Promise<PromoEvent> {
    const event = await PromoEvent.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (dto.title !== undefined) event.title = dto.title;
    if (dto.subtitle !== undefined) event.subtitle = dto.subtitle;
    if (dto.description !== undefined) event.description = dto.description;
    if (dto.badge !== undefined) event.badge = dto.badge;
    if (dto.color_gradient !== undefined)
      event.color_gradient = dto.color_gradient;
    if (dto.icon_type !== undefined) event.icon_type = dto.icon_type;
    if (dto.link_url !== undefined) event.link_url = dto.link_url || null;
    if (dto.is_active !== undefined) event.is_active = dto.is_active;
    if (dto.start_date !== undefined)
      event.start_date = dto.start_date ? new Date(dto.start_date) : null;
    if (dto.end_date !== undefined)
      event.end_date = dto.end_date ? new Date(dto.end_date) : null;

    return event.save();
  }

  async toggleEvent(id: string): Promise<PromoEvent> {
    const event = await PromoEvent.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    event.is_active = !event.is_active;
    return event.save();
  }

  async deleteEvent(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const event = await PromoEvent.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await event.remove();
    return { success: true, message: 'Event deleted successfully' };
  }
}
