import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UploadImportantDocumentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  rootFolderPath!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  folderPath?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  fileName!: string;

  @IsString()
  @IsIn(['true'])
  confirmed!: string;
}
