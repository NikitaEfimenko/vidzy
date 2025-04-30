import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { VoiceService } from '../voice/voice.service';

import { BullQueue } from './bull-queue.enum';


@Processor(BullQueue.TTS)
export class TTSConsumer extends WorkerHost {
  constructor(private readonly voiceService: VoiceService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { text, voicePreset, userId } = job.data;

    let progress = 0;
    try {
      // Пример обработки задания TTS
      const result = await this.voiceService.generateTTS({ text, voicePreset, userId }, userId);
      
      // Обновление прогресса
      for (let i = 0; i < 100; i++) {
        progress += 1;
        await job.updateProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return result;
    } catch (error) {
      if (job.token) {
        await job.moveToFailed(error, job.token);
      }
      throw error;
    }
  }
}
