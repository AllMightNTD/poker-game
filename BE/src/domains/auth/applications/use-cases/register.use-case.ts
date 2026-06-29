import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserStatus } from 'src/constants/enums';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(registerDto: any) {
    const { email, password, full_name, username, phone } = registerDto;

    const existingUser = await this.authRepository.findUserByEmailOrPhone(
      email || phone,
    );
    if (existingUser) {
      throw new BadRequestException('Email or phone already exists');
    }

    const existingProfile =
      await this.authRepository.findProfileByUsername(username);
    if (existingProfile) {
      throw new BadRequestException('Username is already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.authRepository.createRegisterTransaction(
      { email, phone, password: hashedPassword, status: UserStatus.ACTIVE },
      { full_name, username },
    );

    return user;
  }
}
