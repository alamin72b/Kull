import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateDebugNoteDto } from './dto/create-debug-note.dto';
import { QueryDebugNotesDto } from './dto/query-debug-notes.dto';
import { UpdateDebugNoteDto } from './dto/update-debug-note.dto';
import { debugNoteUploadOptions } from './debug-note-upload.config';
import { DebugNotesService } from './debug-notes.service';

@Controller('debug-notes')
export class DebugNotesController {
  constructor(private readonly debugNotesService: DebugNotesService) {}

  @Get()
  findAll(@Query() query: QueryDebugNotesDto) {
    return this.debugNotesService.findAll(query);
  }

  @Get('tags')
  findTags() {
    return this.debugNotesService.findTags();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.debugNotesService.findOne(id);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('screenshots', 5, debugNoteUploadOptions))
  create(
    @Body() dto: CreateDebugNoteDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    return this.debugNotesService.create(dto, files);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('screenshots', 5, debugNoteUploadOptions))
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateDebugNoteDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    return this.debugNotesService.update(id, dto, files);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.debugNotesService.remove(id);
  }
}
