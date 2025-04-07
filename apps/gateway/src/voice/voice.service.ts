import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as FormData from 'form-data';
import { AttachmentsService } from 'src/attachments/attachments.service';
import { Readable } from 'stream';
import { GenerateVoiceDto } from './dto/generate-voice.dto';
import AdmZip from "adm-zip"
import { Multer } from 'multer';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


@Injectable()
export class VoiceService {
  constructor(
    private configService: ConfigService,
    private attachmentsService: AttachmentsService
  ) { }
  async generateTTS(generateVoice: GenerateVoiceDto, userId: string) {
    const { text, voicePreset } = generateVoice;
    const VOICE_SERVICE_HOST = this.configService.get<string>('VOICE_SERVICE_HOST');

    // Шаг 1: Отправляем запрос на генерацию и получаем task_id
    const generateResponse = await fetch(`${VOICE_SERVICE_HOST}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice_preset: voicePreset }),
    });

    if (!generateResponse.ok) {
      throw new Error(`Failed to start TTS generation: ${generateResponse.statusText}`);
    }

    const { task_id } = await generateResponse.json();

    // Шаг 2: Периодически проверяем статус задачи
    let status = 'processing';
    let resultUrl: string | null = null;

    while (status === 'processing') {
      await sleep(2000); // Ждем 5 секунд перед следующей проверкой

      const statusResponse = await fetch(`${VOICE_SERVICE_HOST}/task/tts/${task_id}/result`);
      if (!statusResponse.ok && statusResponse.status !== 202) {
        throw new Error(`Failed to check task status: ${statusResponse.statusText}`);
      }
  
      if (statusResponse.status === 202) {
        // Задача еще не завершена, продолжаем опрашивать
        continue;
      }
  
      // Если статус 200, обрабатываем потоковый ответ
      if (statusResponse.status === 200) {
        // Шаг 3: Получаем результат и сохраняем его
        const fileResponse = await fetch(`${VOICE_SERVICE_HOST}/task/tts/${task_id}/result`);
        if (!fileResponse.status) {
          throw new Error(`Failed to fetch generated file: ${fileResponse.statusText}`);
        }

        const arrayBuffer = await fileResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const filename = `voice-${Date.now()}.mp3`;
        const multerFile: Express.Multer.File = {
          fieldname: 'file',
          originalname: filename,
          encoding: '7bit',
          mimetype: 'audio/mpeg',
          size: buffer.length,
          buffer: buffer,
          destination: '',
          filename: filename,
          path: '',
          stream: new Readable({
            read() {
              this.push(null); // Завершаем поток
            },
          }),
        };

        const attachment = await this.attachmentsService.upload(multerFile, {
          fileType: 'music',
          public: false,
          userId: userId,
        });

        resultUrl = attachment.attachment.at(0)?.fileUrl ?? null;
        status = 'finished';
      } else {
        throw new Error(`Transcription failed: ${statusResponse.status}`);
      }
    }

    return { url: resultUrl };
  }

  async transcribe(file: Express.Multer.File, userId: string): Promise<any> {
    const VOICE_SERVICE_HOST = this.configService.get<string>('VOICE_SERVICE_HOST');
    console.log(file)
    // Шаг 1: Отправляем файл на транскрибацию и получаем task_id
    const formData = new FormData();
    formData.append('file', Buffer.from(file.buffer), {
      filename: file.originalname,
    });

    const transcribeResponse = await fetch(`${VOICE_SERVICE_HOST}/transcribe`, {
      method: 'POST',
      body: formData.getBuffer(),
      headers: formData.getHeaders(),
    });

    if (!transcribeResponse.ok) {
      throw new Error(`Failed to start transcription: ${transcribeResponse.statusText}`);
    }

    const { task_id } = await transcribeResponse.json();

    // Шаг 2: Периодически проверяем статус задачи
    let status = 'processing';
    let resultUrl: string | null = null;

    while (status === 'processing') {
      await sleep(2000); // Ждем 5 секунд перед следующей проверкой

      const statusResponse = await fetch(`${VOICE_SERVICE_HOST}/task/transcribe/${task_id}/result`);
      if (!statusResponse.ok && statusResponse.status !== 202) {
        throw new Error(`Failed to check task status: ${statusResponse.statusText}`);
      }
  
      if (statusResponse.status === 202) {
        // Задача еще не завершена, продолжаем опрашивать
        continue;
      }
  
      // Если статус 200, обрабатываем потоковый ответ
      if (statusResponse.status === 200) {
        // Шаг 3: Получаем результат и сохраняем его
        const fileResponse = await fetch(`${VOICE_SERVICE_HOST}/task/transcribe/${task_id}/result`);
        if (!fileResponse.ok) {
          throw new Error(`Failed to fetch transcription file: ${fileResponse.statusText}`);
        }

        const arrayBuffer = await fileResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const filename = `${file.originalname ?? 'filename'}-srt-${Date.now()}.srt`;
        const multerFile: Express.Multer.File = {
          fieldname: 'file',
          originalname: filename,
          encoding: '7bit',
          mimetype: 'text/plain',
          size: buffer.length,
          buffer: buffer,
          destination: '',
          filename: filename,
          path: '',
          stream: new Readable({
            read() {
              this.push(null); // Завершаем поток
            },
          }),
        };

        const attachment = await this.attachmentsService.upload(multerFile, {
          fileType: 'srt',
          public: false,
          userId: userId,
        });

        resultUrl = attachment.attachment.at(0)?.fileUrl ?? null;
        status = 'finished';
      } else {
        throw new Error(`Transcription failed: ${statusResponse.status}`);
      }
    }

    return { url: resultUrl };
  }

  async separateInstrumental(file: Express.Multer.File, userId: string) {
    const formData = new FormData();
    formData.append('file', Buffer.from(file.buffer), {
      filename: file.originalname,
    });
  
    const VOICE_SERVICE_HOST = this.configService.get<string>('VOICE_SERVICE_HOST');
    const response = await fetch(`${VOICE_SERVICE_HOST}/separate`, {
      method: "POST",
      body: formData.getBuffer(),
      headers: formData.getHeaders(),
    });
  
    if (!response.ok) {
      throw new Error(`Failed to generate separateInstrumental: ${response.statusText}`);
    }
  
    // Получаем ZIP-архив с двумя файлами (вокал и инструментал)
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
  
    // Распаковываем ZIP-архив
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
  
    // Ищем файлы вокала и инструментала
    let voiceBuffer: Buffer | null = null;
    let instrumentalBuffer: Buffer | null = null;
  
    for (const entry of zipEntries) {
      if (entry.entryName === "vocals.wav") {
        voiceBuffer = entry.getData();
      } else if (entry.entryName === "accompaniment.wav") {
        instrumentalBuffer = entry.getData();
      }
    }
  
    if (!voiceBuffer || !instrumentalBuffer) {
      throw new Error("Failed to extract voice or instrumental from the response");
    }
  
    // Загружаем вокал через attachmentsService.upload
    const voiceFilename = `separator-voice-${Date.now()}.wav`;
    const voiceMulterFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: voiceFilename,
      encoding: '7bit',
      mimetype: 'audio/wav',
      size: voiceBuffer.length,
      buffer: voiceBuffer,
      destination: '',
      filename: voiceFilename,
      path: '',
      stream: new Readable({
        read() {
          this.push(null); // Завершаем поток
        },
      }),
    };
  
    const voiceAttachment = await this.attachmentsService.upload(voiceMulterFile, {
      fileType: 'music',
      public: false,
      userId: userId,
    });
    const voiceUrl = voiceAttachment.attachment.at(0)?.fileUrl ?? null;
  
    // Загружаем инструментал через attachmentsService.upload
    const instrumentalFilename = `separator-instrumental-${Date.now()}.wav`;
    const instrumentalMulterFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: instrumentalFilename,
      encoding: '7bit',
      mimetype: 'audio/wav',
      size: instrumentalBuffer.length,
      buffer: instrumentalBuffer,
      destination: '',
      filename: instrumentalFilename,
      path: '',
      stream: new Readable({
        read() {
          this.push(null); // Завершаем поток
        },
      }),
    };
  
    const instrumentalAttachment = await this.attachmentsService.upload(instrumentalMulterFile, {
      fileType: 'music',
      public: false,
      userId: userId,
    });
    const instrumentalUrl = instrumentalAttachment.attachment.at(0)?.fileUrl ?? null;
  
    return {
      voice: voiceUrl,
      instruments: instrumentalUrl,
    };
  }
}