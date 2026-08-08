import {
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";

export class CreateActivityDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "activityDate must use YYYY-MM-DD formate",
  })
  activityDate!: string;

  @IsISO8601({ strict: true })
  startAt!: string;

  @IsISO8601({ strict: true })
  endAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string | null;
}
