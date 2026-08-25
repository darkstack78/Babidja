import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import type Redis from 'ioredis';
import { NotificationsService } from './notifications.service';
import { NotificationsProcessor } from './notifications.processor';
import { SmsService } from './sms.service';
import { PushService } from './push.service';
import { EmailService } from './email.service';
import { NOTIFICATIONS_QUEUE } from './notifications.constants';
import { BULLMQ_REDIS_CONNECTION, BullmqConnectionModule } from './bullmq-connection.module';

@Module({
  imports: [
    BullmqConnectionModule,
    BullModule.registerQueueAsync({
      name: NOTIFICATIONS_QUEUE,
      imports: [BullmqConnectionModule],
      inject: [BULLMQ_REDIS_CONNECTION],
      useFactory: (connection: Redis) => ({ connection }),
    }),
  ],
  providers: [NotificationsService, NotificationsProcessor, SmsService, PushService, EmailService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
