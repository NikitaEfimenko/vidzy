import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from './database/database.module';
import { UsersModule } from './users/users.module';

import { ScheduleModule } from '@nestjs/schedule';
// import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { REDIS, RedisModule } from './redis';

import RedisStore from "connect-redis";

import minioConfig from 'config/minio.config';
import * as session from 'express-session';
import * as passport from 'passport';
import { RedisClientType } from 'redis';
import { AttachmentsModule } from './attachments/attachments.module';
import { RendererModule } from './renderer/renderer.module';
import { StorageModule } from './storage/storage.module';
import { VoiceModule } from './voice/voice.module';

@Module({
  imports: [
    RedisModule,
    ConfigModule.forRoot({
      load: [minioConfig],
      isGlobal: true,
    }),
    DrizzleModule,
    UsersModule,
    ScheduleModule.forRoot(),
    RendererModule,
    VoiceModule,
    AttachmentsModule,
    StorageModule,
  ],
  controllers: [AppController],
  // providers: [AppService, JwtStrategy],
  providers: [AppService],
})
export class AppModule implements NestModule {
  constructor(
    @Inject(REDIS) private readonly redis: RedisClientType,
    private readonly configService: ConfigService
  ) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          store: new RedisStore({ client: this.redis}),
          saveUninitialized: false,
          secret: this.configService.get<string>('REDIS_SECRET')!,
          resave: false,
          cookie: {
            sameSite: 'lax',
            httpOnly: true,
            maxAge: 60000,
          },
        }),
        passport.initialize(),
        passport.session(),
        (req, res, next) => {
          console.log('Authorization Header:', req.headers['authorization']);
          next();
        }
      )
      .forRoutes('*');
  }
}
