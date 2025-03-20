import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateObject, GenerateObjectResult, JSONValue, streamText, StreamTextResult, ToolSet } from 'ai';
import { createOllama, ollama } from 'ollama-ai-provider';
import { z } from 'zod';
import { RequestLLMObjectDto } from './dto/request-llm-object.dto';
import { RequestLLMStreamDto } from './dto/request-llm-stream.dto';
import { ImageRequestDto } from './dto/send-image-request.dto';


@Injectable()
export class LlmService {
  private readonly ollama: ReturnType<typeof createOllama> | undefined;

  constructor(
    private readonly configService: ConfigService,
  ) {
    try {
      this.ollama = createOllama({
        baseURL: this.configService.get<string>('OLLAMA_API_URL')!,
      });
    } catch (e) {
      console.log(e)
      this.ollama = undefined
    }
  }

  private getYandexApiKey(): string {
    return this.configService.get<string>('YANDEX_MODELS_API_KEY')!;
  }

  private getOllamaModel(): string {
    return this.configService.get<string>('OLLAMA_MODEL_ID')!;
  }

  async requestLLMStream(requestDto: RequestLLMStreamDto): Promise<StreamTextResult<ToolSet, unknown> | undefined> {
    switch (requestDto.provider) {
      case 'yandex': {
        break
      }
      case 'ollama':
      default: {
        if (!this.ollama) return
        const result = streamText({
          model: this.ollama(this.getOllamaModel()),
          messages: requestDto.messages,
        });

        return result
      }
    }
  }

  async requestLLMObject(requestDto: RequestLLMObjectDto): Promise<GenerateObjectResult<JSONValue> | undefined> {
    switch (requestDto.provider) {
      case 'yandex': {
        break
      }
      case 'ollama':
      default: {
        if (!this.ollama) return
        if (requestDto.schema) {
          const result = await generateObject({
            model: this.ollama(
              this.getOllamaModel(),
              { structuredOutputs: true }
            ),
            prompt: requestDto.prompt,
            schema: objectToZodSchema(requestDto.schema),
            output: 'array'
          });
          console.log(JSON.stringify(result.object, null, 2))
          console.log()
          console.log('Token usage:', result.usage)
          console.log('Finish reason:', result.finishReason)
          return result
        } else {
          return generateObject({
            model: this.ollama(this.getOllamaModel(), { structuredOutputs: true }),
            prompt: requestDto.prompt,
            mode: 'json',
            output: 'no-schema',
          });
        }

      }
    }
  }

  async sendGenerateImageRequest(requestDto: ImageRequestDto) {
    const response = await fetch(`https://llm.api.cloud.yandex.net/foundationModels/v1/imageGenerationAsync`, {
      method: "POST",
      body: JSON.stringify(
        {
          "modelUri": "art://b1gqhlrtbbafkf77o20g/yandex-art/latest",
          "generationOptions": {
            "seed": Math.trunc(Math.random() * 2000),
            "aspectRatio": {
              "widthRatio": String(requestDto.widthRatio ?? 2),
              "heightRatio": String(requestDto.heightRatio ?? 1)
            }
          },
          "messages": [
            {
              "weight": "1",
              "text": requestDto.prompt
            }
          ]
        }
      ),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Api-Key ${this.getYandexApiKey()}`
      },
    })
    if (!response.ok) {
      throw new Error(`Failed to Image generation: ${response.statusText}`);
    }
    return response.json()
  }


  async checkImageRequestStatus(requestId: string) {
    const url = `https://llm.api.cloud.yandex.net:443/operations/${requestId}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Api-Key ${this.getYandexApiKey()}`
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to check Image status generation - ${requestId}: ${response.statusText}`);
    }
    return response.json()
  }

}
function objectToZodSchema(obj: Record<string, any>): z.ZodObject<any> {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      // Преобразуем значение в строку для описания
      const description = `Example: ${value.toString()}`;

      // Определяем тип значения и создаем соответствующую Zod-схему
      if (typeof value === 'string') {
        schemaShape[key] = z.string().describe(description);
      } else if (typeof value === 'number') {
        schemaShape[key] = z.number().describe(description);
      } else if (typeof value === 'boolean') {
        schemaShape[key] = z.boolean().describe(description);
      } else if (Array.isArray(value)) {
        // Если значение — массив, проверяем тип его элементов
        if (value.length > 0) {
          const firstElement = value[0];
          if (typeof firstElement === 'string') {
            schemaShape[key] = z.array(z.string()).describe(description);
          } else if (typeof firstElement === 'number') {
            schemaShape[key] = z.array(z.number()).describe(description);
          } else if (typeof firstElement === 'boolean') {
            schemaShape[key] = z.array(z.boolean()).describe(description);
          } else {
            // Если тип элемента массива неизвестен, используем z.any()
            schemaShape[key] = z.array(z.any()).describe(description);
          }
        } else {
          // Если массив пустой, используем z.array(z.any())
          schemaShape[key] = z.array(z.any()).describe(description);
        }
      } else if (value && typeof value === 'object') {
        // Если значение — объект, рекурсивно создаем схему для него
        schemaShape[key] = objectToZodSchema(value).describe(description);
      } else {
        // Если тип неизвестен, используем z.any()
        schemaShape[key] = z.any().describe(description);
      }
    }
  }

  return z.object(schemaShape);
}