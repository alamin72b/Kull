import { PartialType } from "@nestjs/mapped-types";
import { Transform } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsUUID,
} from "class-validator";
import { CreateDebugNoteDto } from "./create-debug-note.dto";

function toArray({
  value,
}: {
  value: unknown;
}): unknown[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  return Array.isArray(value) ? value : [value];
}

export class UpdateDebugNoteDto extends PartialType(
  CreateDebugNoteDto,
) {
  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @ArrayMaxSize(5)
  @IsUUID("4", { each: true })
  removeScreenshotIds?: string[];
}
