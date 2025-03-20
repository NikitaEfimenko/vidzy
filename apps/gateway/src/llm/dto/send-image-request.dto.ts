import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class ImageRequestDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsPositive()
  widthRatio?: string

  @IsPositive()
  heightRatio?: string
}
