import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateDebugNoteDto } from './create-debug-note.dto';

export class UpdateDebugNoteDto extends PartialType(CreateDebugNoteDto) {
  /**
   * JSON array of screenshot IDs that should be removed.
   */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  removedScreenshotIds?: string;

  /**
   * JSON object:
   * {
   *   "screenshot-id": "Updated caption"
   * }
   */
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  existingScreenshotCaptions?: string;
}
