// src/render/render.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { RenderBodyDto } from './dto/request-render.dto';
import { bundle, webpack } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { enableTailwind } from '@remotion/tailwind';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

const STUDIO_ENTRYPOINT = path.resolve('../web/src/remotion/index.ts');

@Injectable()
export class RenderService {

  constructor(
    private configService: ConfigService
  ) {}

  private readonly logger = new Logger(RenderService.name);

  async getCompositions(): Promise<{ message: string }> {
    return { message: 'pong\n' };
  }

  async renderComposition(body: RenderBodyDto): Promise<{ url: string }> {
    const { compositionId, inputProps } = body;
    console.log(compositionId, inputProps)
    const RENDERER_HOST = this.configService.get<string>('RENDERER_HOST')
    // Step 1: Bundle the composition
    const bundled = await this.bundleComposition();

    // Step 2: Select the composition
    const composition = await this.selectComposition(bundled, compositionId, inputProps);

    // Step 3: Render the media file
    const suffix = this.generateOutputFileName(composition.id, inputProps?.title);
    const outputLocation = `public/${suffix}`;
    await this.renderMediaFile(composition, bundled, outputLocation, inputProps);

    this.logger.log(`Rendered composition ${composition.id}.`);
    return { url: `${RENDERER_HOST}/public/${suffix}` };
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

  private async renderMediaFile(composition: any, serveUrl: string, outputLocation: string, inputProps: any) {
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
    return `${compositionId}_${title}_${randomUUID()}.mp4`.toLowerCase();
  }
}
