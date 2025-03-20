import { IsString, IsNotEmpty, IsObject, IsUUID } from 'class-validator';

export class RenderBodyDto {
  @IsString()
  @IsNotEmpty()
  compositionId: string;

  @IsObject()
  inputProps: Record<string, any>;

  @IsUUID()
  userId: string
}

export class CompositionListResponse {
  @IsString()
  message: string;
}