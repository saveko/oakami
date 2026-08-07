import { IsOptional, IsNumber, IsString, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListInventoryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  take?: number;

  @IsOptional()
  @IsString()
  ingredientId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  showLow?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  showExpiring?: boolean;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
