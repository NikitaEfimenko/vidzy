import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { LlmController } from './llm.controller';
import { ConfigModule } from '@nestjs/config';
import { AttachmentsModule } from 'src/attachments/attachments.module';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  controllers: [LlmController],
  providers: [LlmService],
  imports: [ConfigModule, AttachmentsModule, StorageModule]
})
export class LlmModule {}
