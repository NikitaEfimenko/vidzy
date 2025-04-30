import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { RenderService } from 'src/renderer/renderer.service';
import { BullQueue } from './bull-queue.enum';
import { Logger } from '@nestjs/common';

const RENDER_ESTIMATED_MS = 30000;
const PROGRESS_STEPS = 10;
const MAX_PROGRESS = 90;

@Processor(BullQueue.RENDER)
export class RenderConsumer extends WorkerHost {
  constructor(private readonly renderService: RenderService) {
    super();
  }

  private readonly logger = new Logger(RenderConsumer.name);

  async process(job: Job<any, any, string>): Promise<any> {
    const taskData = job.data;
    this.logger.log(`Start render for job ${job.id}`);
    try {
      // ⏳ Симулируем прогресс до 90%
      for (let i = 1; i <= PROGRESS_STEPS; i++) {
        const progress = Math.floor((MAX_PROGRESS / PROGRESS_STEPS) * i);
        await job.updateProgress(progress);
        await new Promise((res) => setTimeout(res, RENDER_ESTIMATED_MS / PROGRESS_STEPS));
      }

      // 🧠 Реальный рендер
      const result = await this.renderService.renderComposition(taskData);

      // ✅ Завершаем на 100%
      await job.updateProgress(100);
      this.logger.log(`Success render for job ${job.id}!`);
      return result;
    } catch (error) {
      console.error("RENDER FAILED", error);
      if (job.token) {
        await job.moveToFailed(error, job.token);
      }
      return Promise.reject(error);
    }
  }
}
