import { Controller, Get,Res, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, HttpException, UseGuards, Req } from '@nestjs/common';
import { VoiceService } from './voice.service';
import { GenerateVoiceDto } from './dto/generate-voice.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('generate')
  generateVoice(
    @Body() dto: GenerateVoiceDto,
    @Req() req: Request,
  ) {
    const userEl = req.user as any
    return this.voiceService.generateTTS(dto, userEl.sub);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/transcribe')
  @UseInterceptors(FileInterceptor('file'))
  async transcribe(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    console.log(file)
    if (!file) {
      throw new HttpException('File is required', 400);
    }
    const userEl = req.user as any
    return this.voiceService.transcribe(file, userEl.sub);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/separate-instrumental')
  @UseInterceptors(FileInterceptor('file'))
  async separateInstrumental(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {

    if (!file) {
      throw new HttpException('File is required', 400);
    }
    const userEl = req.user as any
    const result = await this.voiceService.separateInstrumental(file, userEl.sub);
    return result
  }

}
