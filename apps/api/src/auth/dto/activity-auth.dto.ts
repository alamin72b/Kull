import {
    IsString, 
    Length, 
    Matches,
} from "class-validator";

export class ActivityAuthDto {
  @IsString()
  @Length(3, 30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message:
      "Username can contain only letters, numbers, and underscores.",
  })
  username!: string;


  @IsString()
  @Length(6, 72)
  password!: string;
}
