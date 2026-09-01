import {
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CheckRootFolderDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  rootFolderPath!: string;
}
