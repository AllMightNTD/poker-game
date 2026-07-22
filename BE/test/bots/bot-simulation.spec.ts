import { BotProfileGenerator } from '../../src/v1/bots/services/bot-profile.generator';
import { PotOddsCalculator } from '../../src/v1/bots/engines/utils/pot-odds.calculator';
import { EVCalculator } from '../../src/v1/bots/engines/utils/ev.calculator';
import { EasyBotStrategy } from '../../src/v1/bots/engines/strategies/easy-bot.strategy';
import { MediumBotStrategy } from '../../src/v1/bots/engines/strategies/medium-bot.strategy';
import { HardBotStrategy } from '../../src/v1/bots/engines/strategies/hard-bot.strategy';
import { BotDecisionEngine } from '../../src/v1/bots/engines/bot-decision.engine';
import { BotActionScheduler } from '../../src/v1/bots/schedulers/bot-action.scheduler';
import { BotDifficulty } from '../../src/v1/bots/dto/bot-config.dto';
import { BotDecisionContext } from '../../src/v1/bots/engines/strategies/bot-strategy.interface';

describe('Bot System Unit & Simulation Test Suite', () => {
  let profileGenerator: BotProfileGenerator;
  let easyStrategy: EasyBotStrategy;
  let mediumStrategy: MediumBotStrategy;
  let hardStrategy: HardBotStrategy;
  let decisionEngine: BotDecisionEngine;
  let scheduler: BotActionScheduler;

  beforeEach(() => {
    profileGenerator = new BotProfileGenerator();
    easyStrategy = new EasyBotStrategy();
    mediumStrategy = new MediumBotStrategy();
    hardStrategy = new HardBotStrategy();
    decisionEngine = new BotDecisionEngine(
      easyStrategy,
      mediumStrategy,
      hardStrategy,
    );
    scheduler = new BotActionScheduler();
  });

  describe('BotProfileGenerator', () => {
    it('should generate a valid bot profile with default values', () => {
      const profile = profileGenerator.generateProfile();
      expect(profile.id).toMatch(/^bot-/);
      expect(profile.displayName).toBeDefined();
      expect(profile.avatar).toContain('https://api.dicebear.com');
      expect(profile.isBot).toBe(true);
      expect(profile.country).toBeDefined();
    });

    it('should accept custom parameters for displayName and avatar', () => {
      const profile = profileGenerator.generateProfile(
        'Custom_Bot',
        'https://example.com/avatar.png',
        'VN',
      );
      expect(profile.displayName).toBe('Custom_Bot');
      expect(profile.avatar).toBe('https://example.com/avatar.png');
      expect(profile.country).toBe('VN');
    });
  });

  describe('PotOddsCalculator & EVCalculator', () => {
    it('should calculate pot odds correctly', () => {
      // Pot = 100, Call = 50 => 50 / 150 = 0.3333
      const potOdds = PotOddsCalculator.calculatePotOdds(100, 50);
      expect(potOdds).toBeCloseTo(0.3333, 3);
    });

    it('should calculate EV correctly', () => {
      // Equity = 0.6, Pot = 200, Call = 50 => (0.6 * 200) - (0.4 * 50) = 120 - 20 = 100
      const ev = EVCalculator.calculateEV(0.6, 200, 50);
      expect(ev).toBe(100);
    });
  });

  describe('BotDecisionEngine', () => {
    const dummyContext: BotDecisionContext = {
      roomId: 'room-1',
      botSeatNumber: 1,
      botSeat: {
        seat_number: 1,
        user_id: 'bot-1',
        username: 'Bot1',
        stack: '100000',
        current_bet: '0',
        status: 'active',
        is_bot: '1',
      },
      allSeats: [
        {
          seat_number: 1,
          user_id: 'bot-1',
          username: 'Bot1',
          stack: '100000',
          current_bet: '0',
          status: 'active',
          is_bot: '1',
        },
        {
          seat_number: 2,
          user_id: 'user-2',
          username: 'Player2',
          stack: '100000',
          current_bet: '500',
          status: 'active',
          is_bot: '0',
        },
      ],
      tableState: {
        current_highest_bet: '500',
        big_blind: '100',
        main_pot: '750',
        game_stage: 'flop',
        dealer_seat: '1',
      } as any,
      pocketCards: ['As', 'Ah'], // Pocket Aces
      communityCards: ['Ad', 'Kd', '2c'], // Three of a kind Aces
      currentHighestBet: 500,
      currentBotBet: 0,
      bigBlindAmount: 100,
      potSize: 750,
      gameStage: 'flop',
    };

    it('should make an aggressive decision with Easy strategy for Three of a Kind', () => {
      const result = decisionEngine.decideAction(
        BotDifficulty.EASY,
        dummyContext,
      );
      expect(['fold', 'check', 'call', 'raise']).toContain(result.action);
    });

    it('should make a value raise decision with Medium strategy for Three of a Kind', () => {
      const result = decisionEngine.decideAction(
        BotDifficulty.MEDIUM,
        dummyContext,
      );
      expect(result.action).toBe('raise');
      expect(result.amount).toBeGreaterThan(0);
    });

    it('should make a strong raise decision with Hard strategy for Three of a Kind', () => {
      const result = decisionEngine.decideAction(
        BotDifficulty.HARD,
        dummyContext,
      );
      expect(result.action).toBe('raise');
      expect(result.amount).toBeGreaterThan(0);
    });
  });

  describe('BotActionScheduler', () => {
    it('should calculate realistic human thinking delay', () => {
      const delayEasy = scheduler.calculateHumanThinkingDelay(
        BotDifficulty.EASY,
      );
      const delayHard = scheduler.calculateHumanThinkingDelay(
        BotDifficulty.HARD,
      );

      expect(delayEasy).toBeGreaterThanOrEqual(500);
      expect(delayEasy).toBeLessThanOrEqual(10000);

      expect(delayHard).toBeGreaterThanOrEqual(500);
      expect(delayHard).toBeLessThanOrEqual(10000);
    });
  });
});
