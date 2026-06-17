import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UpdateSettingsDto } from '../dtos/update-settings.dto';

@Injectable()
export class UpdateSettingsUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, updateSettingsDto: UpdateSettingsDto) {
    return this.userRepository.updateSettings(userId, updateSettingsDto);
  }
}
