import {
  IsIn,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class UploadToDriveDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  folderPath!: string;

  @IsString()
  @IsIn(["true"])
  confirmed!: string;
}