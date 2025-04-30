import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { VoiceService } from '../voice/voice.service';  // Импортируем сервис для транскрипции
import { BullQueue } from './bull-queue.enum';

@Processor(BullQueue.TRANSCRIBE) // Очередь для обработки транскрипции
export class TranscribeConsumer extends WorkerHost {
  constructor(private readonly voiceService: VoiceService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { file, userId } = job.data;

    let progress = 0;
    try {
      // Пример обработки задания транскрипции
      const result = await this.voiceService.transcribe(file, userId);

      // Обновление прогресса
      for (let i = 0; i < 100; i++) {
        progress += 1;
        await job.updateProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 100));  // Пример задержки между обновлениями
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
