import {
  Controller,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import { I18n, I18nLang, I18nService } from 'nestjs-i18n';
import { AuthGuard } from '../guards/auth.guard';
import { UserService } from './user.service';
import { Wallet } from '../entities/wallet.entity';

@Controller('')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/hello')
  getHello(@I18nLang() lang: string, @I18n() i18n: I18nService) {
    return i18n.t('common.GREETING', { lang });
  }

  @UseGuards(AuthGuard)
  @Get('/me')
  async getMe(@Request() req) {
    return this.userService.getMe(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Get('/chips')
  async getChips(@Request() req) {
    let wallet = await Wallet.findOne({ where: { user_id: req.user.sub } });
    if (!wallet) {
      wallet = new Wallet();
      wallet.user_id = req.user.sub;
      wallet.chips_balance = '50000000';
      await wallet.save();
    }
    return { chips_balance: wallet.chips_balance };
  }
}
