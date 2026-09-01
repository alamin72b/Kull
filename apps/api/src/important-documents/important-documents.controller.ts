import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Express } from 'express';

import { ActivityAuthGuard } from '../auth/activity-auth.guard';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { CheckRootFolderDto } from './dto/check-root-folder.dto';
import { ListImportantDocumentsDto } from './dto/list-important-documents.dto';
import { UpdateImportantDocumentDto } from './dto/update-important-document.dto';
import { UploadImportantDocumentDto } from './dto/upload-important-document.dto';
import { ImportantDocumentsService } from './important-documents.service';

@Controller('important-documents')
@UseGuards(ActivityAuthGuard)
export class ImportantDocumentsController {
  constructor(private readonly documentsService: ImportantDocumentsService) {}

  @Post('root')
  prepareRoot(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CheckRootFolderDto,
  ) {
    return this.documentsService.prepareRoot(
      request.activityUser.id,
      dto.rootFolderPath,
    );
  }

  @Get()
  list(
    @Req() request: AuthenticatedRequest,
    @Query() query: ListImportantDocumentsDto,
  ) {
    return this.documentsService.list(request.activityUser.id, query);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    }),
  )
  upload(
    @Req() request: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadImportantDocumentDto,
  ) {
    return this.documentsService.upload(request.activityUser.id, file, dto);
  }

  @Patch(':documentId')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('documentId') documentId: string,
    @Body() dto: UpdateImportantDocumentDto,
  ) {
    return this.documentsService.update(
      request.activityUser.id,
      documentId,
      dto,
    );
  }

  @Delete(':documentId')
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('documentId') documentId: string,
    @Query() query: CheckRootFolderDto,
  ) {
    await this.documentsService.remove(
      request.activityUser.id,
      documentId,
      query.rootFolderPath,
    );

    return undefined;
  }
}
