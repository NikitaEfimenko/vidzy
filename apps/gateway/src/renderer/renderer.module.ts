import { Module } from '@nestjs/common';
import { RenderService } from './renderer.service';
import { RenderController } from './renderer.controller';
import { ConfigModule } from '@nestjs/config';
import { AttachmentsModule } from 'src/attachments/attachments.module';

@Module({
  controllers: [RenderController],
  providers: [RenderService],
  imports: [ConfigModule, AttachmentsModule],
  exports: [RenderService]
})
export class RendererModule {}
