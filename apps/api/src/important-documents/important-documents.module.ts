import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { DriveModule } from '../drive/drive.module';
import { ImportantDocumentsController } from './important-documents.controller';
import { ImportantDocumentsService } from './important-documents.service';

@Module({
  imports: [AuthModule, DriveModule],
  controllers: [ImportantDocumentsController],
  providers: [ImportantDocumentsService],
})
export class ImportantDocumentsModule {}
