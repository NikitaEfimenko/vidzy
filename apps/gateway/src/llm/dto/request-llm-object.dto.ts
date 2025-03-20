import { IsJSON, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { CoreMessage } from 'ai';

export class RequestLLMObjectDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsString()
  provider: 'yandex' | 'ollama'

  schema?: Record<any, any>
}
