import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from 'src/storage/storage.service';
import { AttachmentsService } from './attachments.service';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';

@Controller('attachments')
export class AttachmentsController {
  constructor(
    private readonly storageService: StorageService,
    private readonly attachmentsService: AttachmentsService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadAttachmentDto
  ) {
    // Загружаем файл в Minio
    const fileName = await this.storageService.uploadFile(file);
    const fileUrl = await this.storageService.getFileUrl(fileName);
    // Фиксируем в БД
    const savedAttachment = await this.attachmentsService.create({
      ...uploadDto,
      public: uploadDto.public == 'true',
      fileUrl,
      fileName
    });

    return { fileName, fileUrl, attachment: savedAttachment };
  }

  @Get('user/:userId')
  async getUserAttachments(@Param('userId') userId: string) {
    return await this.attachmentsService.findByUserId(userId);
  }

  @Get(':id')
  async getAttachment(@Param('id') id: string) {
    return await this.attachmentsService.findOne(id);
  }

  @Get('file/:fileName')
  async getFile(@Param('fileName') fileName: string) {
    const fileUrl = await this.storageService.getFileUrl(fileName);
    return { fileUrl };
  }

  @Patch(':id')
  async updateAttachment(
    @Param('id') id: string,
    @Body() updateAttachmentDto: UpdateAttachmentDto
  ) {
    return await this.attachmentsService.update(id, updateAttachmentDto);
  }

  @Delete(':id')
  async deleteAttachment(@Param('id') id: string) {
    const attachment = await this.attachmentsService.findOne(id);
    if (!attachment || !attachment?.fileUrl) throw new NotFoundException('Attachment not found');

    const url = attachment.fileUrl.split('/').pop()
    if (url) {
      await this.storageService.deleteFile(url);
    }
    await this.attachmentsService.remove(id);

    return { message: 'Attachment deleted successfully' };
  }
}
