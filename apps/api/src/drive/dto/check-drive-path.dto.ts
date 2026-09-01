import {
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CheckDrivePathDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  folderPath!: string;
}