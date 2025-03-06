import { fileTypeEnum } from '@vidzy/database';
import { IsBoolean, IsEnum, IsUrl, IsUUID } from 'class-validator';

export class UploadAttachmentDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  clientId: string;

  @IsEnum(fileTypeEnum)
  fileType: typeof fileTypeEnum.enumValues[number];

  @IsBoolean()
  public: boolean | string;
}
