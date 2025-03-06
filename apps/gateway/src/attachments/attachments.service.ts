import { Injectable, Inject } from '@nestjs/common';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { DRIZZLE } from 'src/database/database.module';
import { DrizzleDB } from 'src/database/types'
import { attachments } from '@vidzy/database';
import { eq } from 'drizzle-orm';

@Injectable()
export class AttachmentsService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB
  ) {}
  create(createAttachmentDto: CreateAttachmentDto) {
    return this.db.insert(attachments).values(createAttachmentDto).returning();
  }

  findAll() {
    return this.db.select().from(attachments).execute()
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
