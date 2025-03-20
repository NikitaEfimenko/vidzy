import { Body, Controller, HttpException, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { GenerateVoiceDto } from './dto/generate-voice.dto';
import { VoiceService } from './voice.service';

@Controller('voice')
export class VoiceController {
  constructor(
    private readonly voiceService: VoiceService
  ) { }

  // @UseGuards(AuthGuard('jwt'))
  @Post('generate')
  async generateVoice(
    @Body() dto: GenerateVoiceDto,
    @Req() req: Request,
  ) {
    // const userEl = req.user as any
    const userId = dto.userId
    // return this.voiceService.generateTTS(dto, userEl.sub);
    return this.voiceService.generateTTS(dto, userId);
  }

  // @UseGuards(AuthGuard('jwt'))
  @Post('transcribe')
  @UseInterceptors(FileInterceptor('file'))
  async transcribe(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: {
      userId: string
    },
    @Req() req: Request,
  ) {
    if (!file) {
      throw new HttpException('File is required', 400);
    }
    // const userEl = req.user as any
    const userId = dto.userId
    console.log(userId, "is userId")
    // return this.voiceService.transcribe(file, userEl.sub);
    return this.voiceService.transcribe(file, userId);
  }

  // @UseGuards(AuthGuard('jwt'))
  @Post('separate')
  @UseInterceptors(FileInterceptor('file'))
  async separate(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: {
      userId: string
    },
    @Req() req: Request,
  ) {
    if (!file) {
      throw new HttpException('File is required', 400);
    }
    // const userEl = req.user as any
    const userId = dto.userId
    console.log(userId, "is userId")
    // return this.voiceService.transcribe(file, userEl.sub);
    return this.voiceService.separateInstrumental(file, userId);
  }

}
