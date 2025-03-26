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
    console.log("Step 2: Select the composition")
    const composition = await this.selectComposition(bundled, compositionId, inputProps);

    // Step 3: Render the media file
    console.log("Step 3: Render the media file")
    const filename = this.generateOutputFileName(composition.id, inputProps?.title);
    console.log(`Info: Rendering with ${JSON.stringify(inputProps, null, 2)}`)
    const { buffer } = await this.renderMediaFile(composition, bundled, undefined, inputProps);
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
