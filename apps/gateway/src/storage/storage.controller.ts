import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';

@Controller('attachments')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileName = await this.storage.uploadFile(file);
    const fileUrl = await this.storage.getFileUrl(fileName);
    return { fileName, fileUrl };
  }

  @Get(':fileName')
  async getFile(@Param('fileName') fileName: string) {
    const fileUrl = await this.storage.getFileUrl(fileName);
    return { fileUrl };
  }

  @Delete(':fileName')
  async deleteFile(@Param('fileName') fileName: string) {
    await this.storage.deleteFile(fileName);
    return { message: 'File deleted successfully' };
  }
}
