import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailProcessor } from './mail.processor';
import { MailService } from './services';

@Global()
@Module({
  imports: [
    /**Mail config */
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('mail'),
    }),

    BullModule.registerQueue({
      name: 'mail-queue',
      // Upstash Free does not support CONFIG GET/SET maxmemory-policy
      // skipVersionCheck prevents BullMQ from logging the eviction policy warning
      skipVersionCheck: true,
    }),
  ],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
