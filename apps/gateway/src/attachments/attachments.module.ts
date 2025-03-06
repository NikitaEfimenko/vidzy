import { Module } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  controllers: [AttachmentsController],
  providers: [AttachmentsService],
  imports: [ConfigModule, StorageModule],
  exports: [AttachmentsService]
})
export class AttachmentsModule {}
