import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class ApiQueryDto {
  @Min(1)
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @Max(100)
  @Min(1)
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;

  @IsString()
  @IsOptional()
  sortBy?: string;

  // only letters, numbers, spaces and underscores
  @Matches(/^[a-zA-Z0-9 _]*$/, { message: 'fields is not valid' })
  @IsString()
  @IsOptional()
  fields?: string;

  @IsString()
  @IsOptional()
  q?: string;

  @IsBoolean()
  @Transform(({ value }) => {
    return value === 'true' || value === true;
  })
  @IsOptional()
  detail?: boolean;
}
