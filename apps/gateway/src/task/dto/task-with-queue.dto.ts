import { JobJson } from 'bullmq';

export interface TaskWithQueue extends JobJson {
  queueName: string;
}