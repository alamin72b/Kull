import { Transform, Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";

const PRICE_PATTERN =
  /^(?:0|[1-9]\d{0,7})(?:\.\d{1,2})?$/;

const cleanText = ({ value }: { value: unknown }): unknown => {
  if (typeof value === "string") {
    return value.trim().replace(/\s+/g, " ");
  }

  return value;
};

export class MedicineTransactionItemDto {
  @Transform(cleanText)
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  actualMedicineName!: string;

  @Transform(cleanText)
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  genericName!: string;

  @IsString()
  @Matches(PRICE_PATTERN, {
    message:
      "MRP per tablet must be a valid non-negative price with at most two decimal places.",
  })
  mrpPerTablet!: string;

  @IsString()
  @Matches(PRICE_PATTERN, {
    message:
      "Bought price per tablet must be a valid non-negative price with at most two decimal places.",
  })
  boughtPricePerTablet!: string;
}

export class CreateMedicineTransactionDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MedicineTransactionItemDto)
  medicines!: MedicineTransactionItemDto[];
}