import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsPositive, IsString, IsUUID, Min } from 'class-validator';

export class CreateInviteLinkDto {
  @ApiProperty({
    description: 'Optional expiration date for the invite link',
    required: false,
    example: '2023-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @IsString()
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Optional maximum number of uses for the invite link',
    required: false,
    example: 5,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  @Type(() => Number)
  maxUses?: number;

  @ApiProperty({
    description: 'Optional custom token for the invite link (if not provided, will be generated automatically)',
    required: false,
    example: 'custom-unique-token-123',
  })
  @IsOptional()
  token?: string;
}