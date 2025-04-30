// src/bullmq/job-creator.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BullQueue } from './bull-queue.enum';

@Injectable()
export class JobCreatorService {
  constructor(
    @InjectQueue(BullQueue.TTS) private readonly ttsQueue: Queue,
    @InjectQueue(BullQueue.TRANSCRIBE) private readonly transcribeQueue: Queue,
    @InjectQueue(BullQueue.RENDER) private readonly renderQueue: Queue,
  ) { }

  async createTTSJob(text: string, voicePreset: string, userId: string) {
    const job = await this.ttsQueue.add('generate-voice', { text, voicePreset, userId },
      {
        removeOnComplete: {
          age: 3600, // keep up to 1 hour
          count: 100, // keep up to 100 jobs
        },
        removeOnFail: {
          age: 24 * 3600, // keep up to 24 hours
        },
      }
    );
    return job.id;
  }

  async createTranscribeJob(file: Express.Multer.File, userId: string) {
    const job = await this.transcribeQueue.add('transcribe-file', { file, userId }, {
      removeOnComplete: {
        age: 3600, // keep up to 1 hour
        count: 100, // keep up to 100 jobs
      },
      removeOnFail: {
        age: 24 * 3600, // keep up to 24 hours
      },
    });
    return job.id;
  }

  async createRenderJob(compositionId: string, inputProps: Record<string, any>, userId: string) {
    const job = await this.renderQueue.add('render-composition', { compositionId, inputProps, userId }, 
      {
        removeOnComplete: {
          age: 3600, // keep up to 1 hour
          count: 100, // keep up to 100 jobs
        },
        removeOnFail: {
          age: 24 * 3600, // keep up to 24 hours
        },
      }
    );
    return job.id;
  }
}
