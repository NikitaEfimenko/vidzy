import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res } from '@nestjs/common';
import { LlmService } from './llm.service';
import { ImageRequestDto } from './dto/send-image-request.dto';
import { createOllama } from 'ollama-ai-provider';
import { streamText, pipeDataStreamToResponse } from 'ai';
import { Response } from 'express';
import { RequestLLMStreamDto } from './dto/request-llm-stream.dto';
import { RequestLLMObjectDto } from './dto/request-llm-object.dto';

@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {

  }

  @Get('check-image-status')
  checkImageStatus(@Query('requestId') requestId: string) {
    return this.llmService.checkImageRequestStatus(requestId);
  }

  @Post('generate-image')
  generateImage(@Body() requestImageDto: ImageRequestDto) {
    return this.llmService.sendGenerateImageRequest(requestImageDto)
  }

  @Post('chat')
  async generateChat(@Body() requestDto: RequestLLMStreamDto, @Res() res: Response) {
    pipeDataStreamToResponse(res, {
      execute: async dataStreamWriter => {
        dataStreamWriter.writeData(`Thinking... response for prompts: ${requestDto.messages.join(",")}`);

        const result = await this.llmService.requestLLMStream(requestDto)
        if (result) {
          result.mergeIntoDataStream(dataStreamWriter);
        }
      },
      onError: error => {
        console.log(error)
        // Error messages are masked by default for security reasons.
        // If you want to expose the error message to the client, you can do so here:
        return error instanceof Error ? error.message : String(error);
      },
    });
  }

  @Post('generate-json')
  async generateJson(@Body() requestDto: RequestLLMObjectDto) {
    let relativeSchema = requestDto.schema
    try {
      const result = await this.llmService.requestLLMObject({
        provider: "ollama",
        prompt: requestDto.prompt ?? '',
        schema: relativeSchema ?? undefined
      })
      return result?.object
    } catch (error: any) {
      console.log('Cause:', error?.cause);
      console.log(error?.message)
      console.log(error?.errors)
      return {}
    }
  }
}
