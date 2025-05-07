import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { BullQueue } from 'src/bull/bull-queue.enum';
import { TaskWithQueue } from './dto/task-with-queue.dto';
import { Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TaskService {
  private queueMap: Record<string, Queue>;
  private readonly logger = new Logger(TaskService.name);
  private readonly STUCK_THRESHOLD_MS = 12 * 60 * 60 * 1000; // 12 часов


  constructor(
    @InjectQueue(BullQueue.TTS) private readonly ttsQueue: Queue,
    @InjectQueue(BullQueue.TRANSCRIBE) private readonly transcribeQueue: Queue,
    @InjectQueue(BullQueue.RENDER) private readonly renderQueue: Queue,
  ) {
    this.queueMap = {
      [BullQueue.TTS]: this.ttsQueue,
      [BullQueue.TRANSCRIBE]: this.transcribeQueue,
      [BullQueue.RENDER]: this.renderQueue,
    };
  }

  @Cron(CronExpression.EVERY_11_HOURS)
  async cleanStuckPendingTasks(): Promise<void> {
    const now = Date.now();

    for (const [queueName, queue] of Object.entries(this.queueMap)) {
      const waitingJobs = await queue.getWaiting();

      for (const job of waitingJobs) {
        const age = now - job.timestamp;
        if (age > this.STUCK_THRESHOLD_MS) {
          try {
            await job.remove();
            this.logger.warn(
              `Removed stuck pending job ${job.id} from [${queueName}], age: ${Math.round(age / 1000)}s`,
            );
          } catch (e) {
            this.logger.error(`Failed to remove job ${job.id} from [${queueName}]: ${e.message}`);
          }
        }
      }
    }
  }


  private async getJobsWithQueueName(queueName: string, queue: Queue): Promise<TaskWithQueue[]> {
    const jobs = await queue.getJobs(['waiting', 'active', 'completed', 'failed', 'delayed']);
    return Promise.all(
      jobs.map(async (job) => {
        const state = await job.getState();
        return {
          ...job.toJSON(),
          queueName,
          state,
        };
      }),
    );
  }


  async getTasksByUserId(userId: string): Promise<TaskWithQueue[]> {
    const allJobs = await Promise.all(
      Object.entries(this.queueMap).map(([name, queue]) =>
        this.getJobsWithQueueName(name, queue),
      ),
    );
    return allJobs.flat().filter((job) => {
      const data = job.data as any;

      if (!data || typeof data !== 'object') return false;
      return data?.userId === userId;
    });
  }

  async getTaskById(id: string): Promise<TaskWithQueue> {
    for (const [name, queue] of Object.entries(this.queueMap)) {
      const job = await queue.getJob(id);
      if (job) {
        return {
          ...job.toJSON(),
          queueName: name,
        }
      }
    }
    throw new NotFoundException('Task not found');
  }

  async cancelTask(id: string): Promise<void> {
    const job = await this.getTaskById(id);
    const queue = this.queueMap[job.queueName];
    const realJob = await queue.getJob(id);
    const state = await realJob.getState();

    if (!['waiting', 'delayed', 'active'].includes(state)) {
      throw new BadRequestException(`Cannot cancel task in state: ${state}`);
    }

    await realJob.remove();
  }
}
