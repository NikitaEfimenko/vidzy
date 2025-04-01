// src/render/render.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { RenderBodyDto } from './dto/request-render.dto';
import { bundle, webpack } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { enableTailwind } from '@remotion/tailwind';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { AttachmentsService } from 'src/attachments/attachments.service';

const STUDIO_ENTRYPOINT = path.resolve('../web/src/remotion/index.ts');

@Injectable()
export class RenderService {

  constructor(
    private configService: ConfigService,
    private attachmentsService: AttachmentsService
  ) {}

  private readonly logger = new Logger(RenderService.name);


  private normalizeFormData(formData: Record<string, any>): any {
    const result: Record<string, any> = {};
  
    for (const [key, value] of Object.entries(formData)) {
      this.processKey(key, value, result);
    }
  
    // Пост-обработка: преобразуем объекты с числовыми ключами в массивы
    return this.convertNumberKeysToArrays(result);
  }
  
  private processKey(fullKey: string, value: any, targetObj: Record<string, any>) {
    const parts = fullKey.split('.');
    let current = targetObj;
  
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const nextPart = parts[i + 1];
      const isNextNumber = !isNaN(parseInt(nextPart));
  
      if (isLast) {
        current[part] = value;
      } else {
        if (!current[part]) {
          // Создаем объект или массив в зависимости от следующей части
          current[part] = isNextNumber ? {} : [];
        }
        current = current[part];
      }
    }
  }
  
  private convertNumberKeysToArrays(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.convertNumberKeysToArrays(item));
    }
  
    if (typeof obj === 'object' && obj !== null) {
      // Проверяем, все ли ключи - числа (тогда это массив)
      const keys = Object.keys(obj);
      const allKeysAreNumbers = keys.every(k => !isNaN(parseInt(k)));
  
      if (allKeysAreNumbers && keys.length > 0) {
        // Сортируем по числовым ключам и преобразуем в массив
        return keys
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map(k => this.convertNumberKeysToArrays(obj[k]));
      }
  
      // Рекурсивно обрабатываем обычные объекты
      const result: Record<string, any> = {};
      for (const [key, val] of Object.entries(obj)) {
        result[key] = this.convertNumberKeysToArrays(val);
      }
      return result;
    }
  
    return obj;
  }

  async getCompositions(): Promise<{ message: string }> {
    return { message: 'pong\n' };
  }

  async renderComposition(body: RenderBodyDto): Promise<{ url: string | null }> {
    const { compositionId, inputProps, userId } = body;
    const RENDERER_HOST = this.configService.get<string>('RENDERER_HOST')
    console.log("Step 1: Bundle the composition")
    // Step 1: Bundle the composition
    const bundled = await this.bundleComposition();
    // Step 2: Select the composition
    const normalizedInputProps = this.normalizeFormData(inputProps);
    console.log("Step 2: Select the composition")
    const composition = await this.selectComposition(bundled, compositionId, normalizedInputProps);

    // Step 3: Render the media file
    console.log("Step 3: Render the media file")
    
    const filename = this.generateOutputFileName(composition.id, inputProps?.title);
    console.log(`Info: Rendering with ${JSON.stringify(normalizedInputProps, null, 2)}`)
    const { buffer } = await this.renderMediaFile(composition, bundled, undefined, normalizedInputProps);
    console.log("Step 4: After render")
    if (!buffer) {
      throw new Error(`Failed to generate video: null buffer`);
    }

    const multerFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: filename,
      encoding: '7bit',
      mimetype: "video/mp4",
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
      fileType: "video",
      public: false,
      userId: userId
    })
    
    this.logger.log(`Rendered composition ${composition.id}.`);
    return {
      url: attachment.attachment.at(0)?.fileUrl ?? null
    }
  }

  private async bundleComposition() {
    const NEXT_PUBLIC_WEB_HOST = this.configService.get<string>('NEXT_PUBLIC_WEB_HOST')
    const NEXT_PUBLIC_RENDERER_HOST = this.configService.get<string>('NEXT_PUBLIC_RENDERER_HOST')
    return await bundle({
      entryPoint: STUDIO_ENTRYPOINT,
      webpackOverride: (config) => {
        return enableTailwind({
          ...config,
          plugins: [
            ...(config.plugins || []),
            new webpack.DefinePlugin({
              'process.env.NEXT_PUBLIC_PORTIA_HOST': NEXT_PUBLIC_WEB_HOST,
              'process.env.NEXT_PUBLIC_RENDERER_HOST': NEXT_PUBLIC_RENDERER_HOST,
            }),
          ],
        });
      },
    });
  }

  private async selectComposition(bundled: string, compositionId: string, inputProps: any) {
    const NEXT_PUBLIC_WEB_HOST = this.configService.get<string>('NEXT_PUBLIC_WEB_HOST')
    return await selectComposition({
      serveUrl: bundled,
      id: compositionId,
      inputProps,
      envVariables: {
        NEXT_PUBLIC_WEB_HOST: NEXT_PUBLIC_WEB_HOST || '',
      },
      chromiumOptions: {
        ignoreCertificateErrors: true,
        enableMultiProcessOnLinux: false,
        disableWebSecurity: true,
        gl: "angle-egl" 
      },
    });
  }

  private async renderMediaFile(composition: any, serveUrl: string, outputLocation: string | undefined, inputProps: any) {
    const NEXT_PUBLIC_WEB_HOST = this.configService.get<string>('NEXT_PUBLIC_WEB_HOST')
    return await renderMedia({
      codec: 'h264',
      composition,
      serveUrl,
      envVariables: {
        NEXT_PUBLIC_WEB_HOST: NEXT_PUBLIC_WEB_HOST || '',
      },
      outputLocation,
      chromiumOptions: {
        enableMultiProcessOnLinux: false,
        ignoreCertificateErrors: true,
        disableWebSecurity: true,
        gl: "angle-egl",
      },
      concurrency: 1,
      inputProps,
    });
  }

  private generateOutputFileName(compositionId: string, title: string) {
    return `renderer_${compositionId}_${randomUUID()}.mp4`.toLowerCase();
  }
}
