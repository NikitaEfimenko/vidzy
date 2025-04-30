import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job, JobProgress } from 'bullmq';
import { BullQueue } from './bull-queue.enum';

export interface QueueJobStatusResponse {
  status: string;
  progress: JobProgress | object;
  result?: any;
  failedReason?: string;
  queueName: BullQueue;
  jobId: string;
}

@Injectable()
export class QueueStatusService {
  constructor(
    @InjectQueue(BullQueue.TTS) private readonly ttsQueue: Queue,
    @InjectQueue(BullQueue.TRANSCRIBE) private readonly transcribeQueue: Queue,
    @InjectQueue(BullQueue.RENDER) private readonly renderQueue: Queue,
  ) {}

  private getQueue(queueName: BullQueue): Queue {
    switch (queueName) {
      case BullQueue.TTS:
        return this.ttsQueue;
      case BullQueue.TRANSCRIBE:
        return this.transcribeQueue;
      case BullQueue.RENDER:
        return this.renderQueue;
      default:
        throw new Error(`Invalid queue name: ${queueName}`);
    }
  }

  async getStatus(queueName: BullQueue, jobId: string): Promise<QueueJobStatusResponse> {
    const queue = this.getQueue(queueName);

    const job: Job | null = await queue.getJob(jobId);
    if (!job) {
      return {
        status: 'not_found',
        progress: 0,
        queueName,
        jobId,
      };
    }

    const [state, progress] = await Promise.all([
      job.getState(),
      job.progress,
    ]);

    const response: QueueJobStatusResponse = {
      status: state,
      progress: progress,
      queueName,
      jobId,
    };

    if (state === 'completed') {
      response.result = await job.returnvalue;
    }

    if (state === 'failed') {
      response.failedReason = job.failedReason;
    }

    return response;
  }
}
