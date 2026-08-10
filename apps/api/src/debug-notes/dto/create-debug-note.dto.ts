import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

function toArray(value: unknown): unknown[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  // Add the 'as unknown[]' assertion to the true branch
  return Array.isArray(value) ? (value as unknown[]) : [value];
}
function toBoolean({ value }: { value: unknown }): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  return value === true || value === 'true';
}

export class CreateDebugNoteDto {
  @IsString()
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  summary?: string | null;

  @IsString()
  @MaxLength(50000)
  errorMessage!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  context?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  stepsToReproduce?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  environment?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  rootCause?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  solution?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  verification?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  findings?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  learnings?: string | null;

  @IsOptional()
  @IsIn(['UNSOLVED', 'IN_PROGRESS', 'SOLVED'])
  status?: 'UNSOLVED' | 'IN_PROGRESS' | 'SOLVED';

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsDateString()
  occurredAt?: string | null;

  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];
}
