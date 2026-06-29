import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PageService } from './page.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { UpdateAutoReplyDto } from './dto/update-auto-reply.dto';
import { AuthGuard } from 'src/v1/guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Pages')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('pages')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Post()
  create(@Body() createPageDto: CreatePageDto, @Req() req: any) {
    return this.pageService.create(createPageDto, req.user.sub);
  }

  @Get()
  findAll() {
    return this.pageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pageService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto,
    @Req() req: any,
  ) {
    return this.pageService.update(id, updatePageDto, req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.pageService.remove(id, req.user.sub);
  }

  // --- Follow System ---
  @Post(':id/follow')
  followPage(@Param('id') id: string, @Req() req: any) {
    return this.pageService.followPage(id, req.user.sub);
  }

  @Delete(':id/follow')
  unfollowPage(@Param('id') id: string, @Req() req: any) {
    return this.pageService.unfollowPage(id, req.user.sub);
  }

  @Get(':id/admins')
  getAdmins(@Param('id') id: string) {
    return this.pageService.getAdmins(id);
  }

  // --- Auto-Reply System ---
  @Put(':id/auto-reply')
  updateAutoReply(
    @Param('id') id: string,
    @Body() updateAutoReplyDto: UpdateAutoReplyDto,
    @Req() req: any,
  ) {
    return this.pageService.updateAutoReply(
      id,
      updateAutoReplyDto,
      req.user.sub,
    );
  }

  @Post(':id/message')
  sendMessageToPage(
    @Param('id') id: string,
    @Body('message') message: string,
    @Req() req: any,
  ) {
    return this.pageService.sendMessageToPage(id, message, req.user.sub);
  }
}
