import { Inject, Injectable, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const BULLMQ_REDIS_CONNECTION = 'BULLMQ_REDIS_CONNECTION';

@Injectable()
class BullmqRedisLifecycle implements OnModuleDestroy {
  constructor(@Inject(BULLMQ_REDIS_CONNECTION) private readonly connection: Redis) {}

  async onModuleDestroy() {
    await this.connection.quit();
  }
}

/**
 * Connexion ioredis dédiée à BullMQ (Queue + Worker), distincte du REDIS_CLIENT
 * applicatif partagé (compteurs OTP/login) : le Worker utilise des commandes
 * bloquantes qui ne doivent pas se disputer la même connexion, et BullMQ exige
 * `maxRetriesPerRequest: null` sur la connexion qu'il consomme.
 */
@Module({
  providers: [
    {
      provide: BULLMQ_REDIS_CONNECTION,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Redis(config.get<string>('redis.url')!, { maxRetriesPerRequest: null }),
    },
    BullmqRedisLifecycle,
  ],
  exports: [BULLMQ_REDIS_CONNECTION],
})
export class BullmqConnectionModule {}
