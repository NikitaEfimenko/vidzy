import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class RenderBodyDto {
  @IsString()
  @IsNotEmpty()
  compositionId: string;

  @IsObject()
  inputProps: Record<string, any>;
}

export class CompositionListResponse {
  @IsString()
  message: string;
}