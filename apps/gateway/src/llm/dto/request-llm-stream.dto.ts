import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { CoreMessage } from 'ai';

export class RequestLLMStreamDto {
  @IsString()
  @IsNotEmpty()
  messages: CoreMessage[];

  @IsString()
  provider: 'yandex' | 'ollama'
}
