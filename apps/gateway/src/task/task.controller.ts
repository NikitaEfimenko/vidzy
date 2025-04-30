import { Controller, Get, Param, Query, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TaskService } from './task.service';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async getTasksByUserId(@Query('userId') userId: string) {
    return this.taskService.getTasksByUserId(userId);
  }

  @Get(':id')
  async getTask(@Param('id') id: string) {
    return this.taskService.getTaskById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelTask(@Param('id') id: string) {
    await this.taskService.cancelTask(id);
  }
}
