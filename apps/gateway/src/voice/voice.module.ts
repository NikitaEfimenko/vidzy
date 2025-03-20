import { Module } from '@nestjs/common';
import { VoiceService } from './voice.service';
import { VoiceController } from './voice.controller';
import { ConfigModule } from '@nestjs/config';
import { AttachmentsModule } from 'src/attachments/attachments.module';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  controllers: [VoiceController],
  providers: [VoiceService],
  imports: [ConfigModule, AttachmentsModule, StorageModule]
})
export class VoiceModule {}
