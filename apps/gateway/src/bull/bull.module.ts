import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RendererModule } from 'src/renderer/renderer.module';
import { VoiceModule } from 'src/voice/voice.module';
import { BullQueue } from './bull-queue.enum';
import { QueueStatusService } from './queue-status.service';
import { RenderConsumer } from './render.consumer';
import { TranscribeConsumer } from './transcribe.consumer';
import { TTSConsumer } from './tts.consumer';
import { JobsController } from './jobs.controller';
import { JobCreatorService } from './job-creator.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = process.env.NODE_ENV === 'production'
          ? configService.get<string>('REDIS_URL')
          : "redis://localhost:6379";

        return {
          connection: {
            db: 0,
            url: redisUrl,
          },
          prefix: 'bull',
        }
      }
    }),
    BullModule.registerQueue(
      {
        name: BullQueue.TTS,
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false,
        },
      },
      {
        name: BullQueue.TRANSCRIBE,
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false,
        },
      },
      {
        name: BullQueue.RENDER,
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false,
        },
      },
    ),
    VoiceModule,
    RendererModule,

  ],
  providers: [
    JobCreatorService,
    QueueStatusService,
    TTSConsumer,
    TranscribeConsumer,
    RenderConsumer,
  ],
  exports: [
    QueueStatusService,
    JobCreatorService
  ],
  controllers: [
    JobsController
  ]
})
export class BullQueueModule { }
