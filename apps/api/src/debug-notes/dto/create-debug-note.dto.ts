import {
  DebugNoteSeverity,
  DebugNoteStatus,
} from '../../generated/prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

type TransformValue = { value: unknown };

function trimString({ value }: TransformValue): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function emptyStringToNull({ value }: TransformValue): unknown {
  return value === '' ? null : value;
}

export class CreateDebugNoteDto {
  @Transform(trimString)
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  summary?: string;

  @IsOptional()
  @IsEnum(DebugNoteStatus)
  status?: DebugNoteStatus;

  @IsOptional()
  @IsEnum(DebugNoteSeverity)
  severity?: DebugNoteSeverity;

  @IsString()
  @MinLength(1)
  @MaxLength(30000)
  errorMessage!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  context?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  stepsToReproduce?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  environment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  attemptedSolutions?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  rootCause?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30000)
  solution?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30000)
  codeSnippet?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  verification?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  findings?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  learnings?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  thoughts?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  references?: string;

  @Transform(emptyStringToNull)
  @IsOptional()
  @IsDateString()
  occurredAt?: string | null;

  @IsOptional()
  @IsIn(['true', 'false'])
  isPinned?: 'true' | 'false';

  /**
   * JSON string:
   * ["nextjs", "prisma", "postgresql"]
   */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  tags?: string;

  /**
   * JSON string containing one caption for each new screenshot.
   */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  screenshotCaptions?: string;
}
