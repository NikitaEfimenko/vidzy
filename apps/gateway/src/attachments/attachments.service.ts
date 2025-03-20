import { Injectable, Inject } from '@nestjs/common';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { DRIZZLE } from 'src/database/database.module';
import { DrizzleDB } from 'src/database/types'
import { attachments } from '@vidzy/database';
import { eq } from 'drizzle-orm';
import { StorageService } from 'src/storage/storage.service';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';

@Injectable()
export class AttachmentsService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private storageService: StorageService
  ) {}
  create(createAttachmentDto: CreateAttachmentDto) {
    return this.db.insert(attachments).values(createAttachmentDto).returning();
  }

  findAll() {
    return this.db.select().from(attachments).execute()
  }

  async upload(file: Express.Multer.File, dto: UploadAttachmentDto) {
    const fileName = await this.storageService.uploadFile(file);
    const fileUrl = await this.storageService.getFileUrl(fileName);
    const savedAttachment = await this.create({
      ...dto,
      public: dto.public == 'true',
      fileUrl,
      fileName
    });

    return { fileName, fileUrl, attachment: savedAttachment };
  }

  async findByUserId(userId: string) {
    return this.db.select().from(attachments).where(eq(attachments.userId, userId)).execute();
  }

  async findOne(id: string) {
    const result = await this.db.select().from(attachments).where(eq(attachments.id, id)).execute(); 
    return result[0];
  }

  async update(id: string, updateAttachmentDto: UpdateAttachmentDto) {
    await this.db
      .update(attachments).set(updateAttachmentDto)
      .where(eq(attachments.id, id))
      .execute();
  }

  async remove(id: string) {
    await this.db
    .delete(attachments)
    .where(eq(attachments.id, id))
    .execute();
  }
}
