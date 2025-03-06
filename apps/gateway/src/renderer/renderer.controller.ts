import { Controller, Get, Post, Body } from '@nestjs/common';
import { RenderService } from './renderer.service';
import { RenderBodyDto, CompositionListResponse } from './dto/request-render.dto';

@Controller('renderer')
export class RenderController {
  constructor(private readonly renderService: RenderService) {}

  @Get('/compositions')
  async getCompositions(): Promise<CompositionListResponse> {
    return this.renderService.getCompositions();
  }

  @Post()
  async render(@Body() renderBodyDto: RenderBodyDto) {
    return this.renderService.renderComposition(renderBodyDto);
  }
}