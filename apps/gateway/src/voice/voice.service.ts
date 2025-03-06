import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { GenerateVoiceDto } from './dto/generate-voice.dto';
import * as FormData from 'form-data';
import { AttachmentsService } from 'src/attachments/attachments.service';
import { randomUUID } from 'crypto';

@Injectable()
export class VoiceService {
  constructor(
    private configService: ConfigService,
    private attachmentsService: AttachmentsService
  ) { }
  async generateTTS(generateVoice: GenerateVoiceDto, userId: string) {
    const { text, voicePreset } = generateVoice
    const VOICE_SERVICE_HOST = this.configService.get<string>('VOICE_SERVICE_HOST')
    const RENDERER_HOST = this.configService.get<string>('RENDERER_HOST')

    const response = await fetch(`${VOICE_SERVICE_HOST}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice_preset: voicePreset }),

    });

    if (!response.ok) {
      throw new Error(`Failed to generate TTS: ${response.statusText}`);
    }
    const fileName = `${Date.now()}_output.mp3`;
    const outputLocation = `public/${fileName}`;

    const fileStream = fs.createWriteStream(outputLocation);

    const readableStream = response.body

    if (!readableStream) {
      throw new Error('No response body');
    }

    await pipeline(readableStream, fileStream);

    const res = {
      url: `${RENDERER_HOST}/${outputLocation}`
    }
    await this.attachmentsService.create({
      fileType: "music",
      fileUrl: res.url,
      public: true,
      userId: userId,
      fileName: String(randomUUID())
    })

    return res
  }

  async transcribe(file: Express.Multer.File, userId: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', Buffer.from(file.buffer), {
      filename: file.originalname,
    });

    const VOICE_SERVICE_HOST = this.configService.get<string>('VOICE_SERVICE_HOST')
    const RENDERER_HOST = this.configService.get<string>('RENDERER_HOST')

    const response = await fetch(`${VOICE_SERVICE_HOST}/transcribe`, {
      method: 'POST',
      body: formData.getBuffer(),
      headers: formData.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to generate transcribe: ${response.statusText}`);
    }
    const fileName = `${Date.now()}_output.srt`;
    const outputLocation = `public/${fileName}`;

    const fileStream = fs.createWriteStream(outputLocation);

    const readableStream = response.body

    if (!readableStream) {
      throw new Error('No response body');
    }

    await pipeline(readableStream, fileStream);

    const res = {
      url: `${RENDERER_HOST}/${outputLocation}`
    }

    await this.attachmentsService.create({
      fileType: "srt",
      fileUrl: res.url,
      userId: userId,
      public: true,
      fileName: String(randomUUID())
    })
    return res
  }

  async separateInstrumental(file: Express.Multer.File, userId: string) {
    const formData = new FormData();
    formData.append('file', Buffer.from(file.buffer), {
      filename: file.originalname,
    });
    const VOICE_SERVICE_HOST = this.configService.get<string>('VOICE_SERVICE_HOST')
    const RENDERER_HOST = this.configService.get<string>('RENDERER_HOST')
    console.log(formData.getHeaders())
    console.log(formData)
    const response = await fetch(`${VOICE_SERVICE_HOST}/separate-instumental`, {
      method: "POST",
      body: formData.getBuffer(),
      headers: formData.getHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Failed to generate separateInstrumental: ${response.statusText}`);
    }
    const fileName = `${Date.now()}_output.wav`;
    const outputLocation = `public/${fileName}`;

    const fileStream = fs.createWriteStream(outputLocation);

    const readableStream = response.body

    if (!readableStream) {
      throw new Error('No response body');
    }

    await pipeline(readableStream, fileStream);

    const res = {
      url: `${RENDERER_HOST}/${outputLocation}`
    }

    await this.attachmentsService.create({
      fileType: "music",
      fileUrl: res.url,
      public: true,
      userId: userId,
      fileName: String(randomUUID())
    })

    return res
    
  }
}
