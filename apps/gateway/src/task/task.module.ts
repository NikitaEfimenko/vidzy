import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { BullModule } from '@nestjs/bullmq';
import { BullQueue } from 'src/bull/bull-queue.enum';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: BullQueue.TTS,
        defaultJobOptions: {
          removeOnComplete: { age: 60 }, // 5min
          removeOnFail: { age: 60 },
        },
      },
      {
        name: BullQueue.TRANSCRIBE,
        defaultJobOptions: {
          removeOnComplete: { age: 60 },
          removeOnFail: { age: 60 },
        },
      },
      {
        name: BullQueue.RENDER,
        defaultJobOptions: {
          removeOnComplete: { age: 60 },
          removeOnFail: { age: 60 },
        },
      },
    ),
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule { }
