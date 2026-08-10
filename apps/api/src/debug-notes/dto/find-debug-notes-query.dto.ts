import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class FindDebugNotesQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tag?: string;

  @IsOptional()
  @IsIn(["UNSOLVED", "IN_PROGRESS", "SOLVED"])
  status?: "UNSOLVED" | "IN_PROGRESS" | "SOLVED";
}
