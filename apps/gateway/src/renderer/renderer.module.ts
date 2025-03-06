import { Module } from '@nestjs/common';
import { RenderService } from './renderer.service';
import { RenderController } from './renderer.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [RenderController],
  providers: [RenderService],
  imports: [ConfigModule]
})
export class RendererModule {}
