// src/jobs/jobs.controller.ts
import { Controller, Post, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobCreatorService } from 'src/bull/job-creator.service';
import { RenderBodyDto } from 'src/renderer/dto/request-render.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobCreatorService: JobCreatorService) {}

  @Post('tts')
  async createTTSJob(
    @Body() { text, voicePreset, userId }: { text: string; voicePreset: string; userId: string },
  ) {
    const jobId = await this.jobCreatorService.createTTSJob(text, voicePreset, userId);
    return { jobId };
  }

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('file'))
  async createTranscribeJob(
    @UploadedFile() file: Express.Multer.File,
    @Body() { userId }: { userId: string },
  ) {
    const jobId = await this.jobCreatorService.createTranscribeJob(file, userId);
    return { jobId };
  }

  @Post('render')
  async createRenderJob(
    @Body() { compositionId, inputProps, userId }: { compositionId: string, inputProps: Record<string, any>, userId: string}
  ) {
    const jobId = await this.jobCreatorService.createRenderJob(
      compositionId,
      inputProps,
      userId
    );
    return { jobId };
  }
}
