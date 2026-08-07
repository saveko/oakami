import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryItemDto {
  @IsString()
  ingredientId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minThreshold?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxThreshold?: number;

  @IsOptional()
  @IsString()
  batch?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  expiryDate?: string;
}
