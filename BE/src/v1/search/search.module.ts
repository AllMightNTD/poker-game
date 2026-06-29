import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchHistory } from '../entities/search_history.entity';
import { User } from '../entities/user.entity';
import { Profile } from '../entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SearchHistory, User, Profile])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
