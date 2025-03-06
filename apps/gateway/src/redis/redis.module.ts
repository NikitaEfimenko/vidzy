import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Redis from 'redis';
import { REDIS } from './redis.constants';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS,
      useFactory: async (configService: ConfigService) => {
        const redisUrl = process.env.NODE_ENV === 'production' ? configService.get<string>('REDIS_URL') : "redis://localhost:6379";
        const client = Redis.createClient({ url: redisUrl, legacyMode: true  });
        await client.connect()
        return client
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}