import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/base/base.service';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService extends BaseService<User, string> {
  protected filterableColumns: string[] = ['email', 'user_name'];

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Omit password
    const { password, ...result } = user;
    return result;
  }

  async getUserProfile(userId: string) {
    return this.getMe(userId);
  }
}
