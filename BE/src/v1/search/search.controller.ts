import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { SearchService } from './search.service';

@Controller('')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('history')
  @UseGuards(AuthGuard)
  async getHistory(@Request() req) {
    return this.searchService.getHistory(req.user.sub);
  }

  @Post('history')
  @UseGuards(AuthGuard)
  async saveHistory(@Request() req, @Body('keyword') keyword: string) {
    await this.searchService.saveHistory(req.user.sub, keyword);
    return { success: true };
  }

  @Delete('history/:id')
  @UseGuards(AuthGuard)
  async deleteHistory(@Request() req, @Param('id') id: string) {
    await this.searchService.deleteHistory(id, req.user.sub);
    return { success: true };
  }

  @Get('users')
  @UseGuards(AuthGuard)
  async searchUsers(@Request() req, @Query('q') query: string) {
    return this.searchService.searchUsers(query, req.user.sub);
  }
}
