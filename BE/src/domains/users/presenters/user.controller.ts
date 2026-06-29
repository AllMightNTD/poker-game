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
import { AuthGuard } from 'src/v1/guards/auth.guard';
import { MessagePermission } from 'src/constants/enums';

import { UpdateProfileDto } from '../applications/dtos/update-profile.dto';
import { UpdateSettingsDto } from '../applications/dtos/update-settings.dto';

import { GetMeUseCase } from '../applications/use-cases/get-me.use-case';
import { UpdateProfileUseCase } from '../applications/use-cases/update-profile.use-case';
import { UpdateSettingsUseCase } from '../applications/use-cases/update-settings.use-case';
import { GetListGroupUseCase } from '../applications/use-cases/get-list-group.use-case';
import { UpdatePresenceUseCase } from '../applications/use-cases/update-presence.use-case';
import { UpdateMessagePermissionUseCase } from '../applications/use-cases/update-message-permission.use-case';
import { BlockUserUseCase } from '../applications/use-cases/block-user.use-case';
import { UnblockUserUseCase } from '../applications/use-cases/unblock-user.use-case';
import { GetBlockedUsersUseCase } from '../applications/use-cases/get-blocked-users.use-case';

@Controller('')
export class UserController {
  constructor(
    private readonly getMeUseCase: GetMeUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly updateSettingsUseCase: UpdateSettingsUseCase,
    private readonly getListGroupUseCase: GetListGroupUseCase,
    private readonly updatePresenceUseCase: UpdatePresenceUseCase,
    private readonly updateMessagePermissionUseCase: UpdateMessagePermissionUseCase,
    private readonly blockUserUseCase: BlockUserUseCase,
    private readonly unblockUserUseCase: UnblockUserUseCase,
    private readonly getBlockedUsersUseCase: GetBlockedUsersUseCase,
  ) {}

  @Get('/hello')
  getHello(@I18nLang() lang: string, @I18n() i18n: I18nService) {
    return i18n.t('common.GREETING', { lang });
  }

  @UseGuards(AuthGuard)
  @Get('/me')
  async getMe(@Request() req) {
    return this.getMeUseCase.execute(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Post('/profile')
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.updateProfileUseCase.execute(req.user.sub, updateProfileDto);
  }

  @UseGuards(AuthGuard)
  @Post('/settings')
  async updateSettings(
    @Request() req,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    return this.updateSettingsUseCase.execute(req.user.sub, updateSettingsDto);
  }

  @UseGuards(AuthGuard)
  @Get('/groups')
  async getListGroup(@Request() req) {
    return this.getListGroupUseCase.execute(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Put('/user/presence')
  async updatePresence(
    @Request() req,
    @Body('is_active_status') isActive: boolean,
  ) {
    return this.updatePresenceUseCase.execute(req.user.sub, isActive);
  }

  @UseGuards(AuthGuard)
  @Put('/user/message-permission')
  async updateMessagePermission(
    @Request() req,
    @Body('message_permission') permission: MessagePermission,
  ) {
    return this.updateMessagePermissionUseCase.execute(
      req.user.sub,
      permission,
    );
  }

  @UseGuards(AuthGuard)
  @Post('/user/block/:targetUserId')
  async blockUser(
    @Request() req,
    @Param('targetUserId') targetUserId: string,
    @Body('reason') reason?: string,
  ) {
    return this.blockUserUseCase.execute(req.user.sub, targetUserId, reason);
  }

  @UseGuards(AuthGuard)
  @Delete('/user/block/:targetUserId')
  async unblockUser(
    @Request() req,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.unblockUserUseCase.execute(req.user.sub, targetUserId);
  }

  @UseGuards(AuthGuard)
  @Get('/user/block')
  async getBlockedUsers(@Request() req) {
    return this.getBlockedUsersUseCase.execute(req.user.sub);
  }
}
