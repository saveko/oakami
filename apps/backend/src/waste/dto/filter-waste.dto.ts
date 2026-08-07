import { IsOptional, IsString, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { WasteStatus } from '@prisma/client';

export class FilterWasteDto {
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  ingredientId?: string;

  @IsOptional()
  @IsEnum(WasteStatus)
  status?: WasteStatus;

  @IsOptional()
  @IsNumber()
  costMin?: number;

  @IsOptional()
  @IsNumber()
  costMax?: number;

  @IsOptional()
  @IsString()
  searchText?: string;

  @IsOptional()
  @IsNumber()
  skip?: number;

  @IsOptional()
  @IsNumber()
  take?: number;

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'costImpact' | 'quantity';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
