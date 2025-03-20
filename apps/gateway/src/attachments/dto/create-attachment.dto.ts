import { fileTypeEnum } from '@vidzy/database';
import { IsBoolean, IsEnum, IsUrl, IsUUID } from 'class-validator';

export class CreateAttachmentDto {
  @IsUUID()
  userId: string;

  @IsEnum(fileTypeEnum)
  fileType: typeof fileTypeEnum.enumValues[number];

  @IsBoolean()
  public: boolean;

  @IsUrl()
  fileUrl: string

  fileName: string
}
