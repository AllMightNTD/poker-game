import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupMember } from '../entities/group_member.entity';
import { User } from '../entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UsersModule } from 'src/domains/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      GroupMember,
    ]),
    UsersModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
