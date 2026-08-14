import {
  DebugNoteSeverity,
  DebugNoteStatus,
} from '../../generated/prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

type TransformValue = { value: unknown };

function trimString({ value }: TransformValue): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class QueryDebugNotesDto {
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  q?: string;

  @IsOptional()
  @IsEnum(DebugNoteStatus)
  status?: DebugNoteStatus;

  @IsOptional()
  @IsEnum(DebugNoteSeverity)
  severity?: DebugNoteSeverity;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(50)
  tag?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 12;
}
