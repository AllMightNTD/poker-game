import { Module, forwardRef } from '@nestjs/common';
import { BotController } from './controllers/bot.controller';
import { BotService } from './services/bot.service';
import { BotProfileGenerator } from './services/bot-profile.generator';
import { BotSeatManager } from './services/bot-seat.manager';
import { BotActionScheduler } from './schedulers/bot-action.scheduler';
import { BotDecisionEngine } from './engines/bot-decision.engine';
import { EasyBotStrategy } from './engines/strategies/easy-bot.strategy';
import { MediumBotStrategy } from './engines/strategies/medium-bot.strategy';
import { HardBotStrategy } from './engines/strategies/hard-bot.strategy';
import { BotGameEventListener } from './listeners/bot-game-event.listener';
import { PokerLobbyModule } from '../modules/poker-lobby.module';

@Module({
  imports: [forwardRef(() => PokerLobbyModule)],
  controllers: [BotController],
  providers: [
    BotService,
    BotProfileGenerator,
    BotSeatManager,
    BotActionScheduler,
    BotDecisionEngine,
    EasyBotStrategy,
    MediumBotStrategy,
    HardBotStrategy,
    BotGameEventListener,
  ],
  exports: [BotService, BotSeatManager, BotActionScheduler, BotDecisionEngine],
})
export class BotModule {}
