import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateImportantDocumentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  rootFolderPath!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  fileName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  folderPath?: string;
}
