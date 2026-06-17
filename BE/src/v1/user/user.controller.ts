import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { I18n, I18nLang, I18nService } from 'nestjs-i18n';
import { AuthGuard } from '../guards/auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UserService } from './user.service';
import { MessagePermission } from 'src/constants/enums';

@Controller('')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('/hello')
  getHello(@I18nLang() lang: string, @I18n() i18n: I18nService) {
    return i18n.t('common.GREETING', { lang });
  }

  @UseGuards(AuthGuard)
  @Get('/me')
  async getMe(@Request() req) {
    // req.user is set by AuthGuard
    return this.userService.getMe(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Post('/profile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.sub, updateProfileDto);
  }

  @UseGuards(AuthGuard)
  @Post('/settings')
  async updateSettings(@Request() req, @Body() updateSettingsDto: UpdateSettingsDto) {
    return this.userService.updateSettings(req.user.sub, updateSettingsDto);
  }

  @UseGuards(AuthGuard)
  @Get('/groups')
  async getListGroup(@Request() req) {
    return this.userService.getListGroup(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Put('/user/presence')
  async updatePresence(@Request() req, @Body('is_active_status') isActive: boolean) {
    return this.userService.updatePresence(req.user.sub, isActive);
  }

  @UseGuards(AuthGuard)
  @Put('/user/message-permission')
  async updateMessagePermission(@Request() req, @Body('message_permission') permission: MessagePermission) {
    return this.userService.updateMessagePermission(req.user.sub, permission);
  }

  @UseGuards(AuthGuard)
  @Post('/user/block/:targetUserId')
  async blockUser(@Request() req, @Param('targetUserId') targetUserId: string, @Body('reason') reason?: string) {
    return this.userService.blockUser(req.user.sub, targetUserId, reason);
  }

  @UseGuards(AuthGuard)
  @Delete('/user/block/:targetUserId')
  async unblockUser(@Request() req, @Param('targetUserId') targetUserId: string) {
    return this.userService.unblockUser(req.user.sub, targetUserId);
  }

  @UseGuards(AuthGuard)
  @Get('/user/block')
  async getBlockedUsers(@Request() req) {
    return this.userService.getBlockedUsers(req.user.sub);
  }
}
