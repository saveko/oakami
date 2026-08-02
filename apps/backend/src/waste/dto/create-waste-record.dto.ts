import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateWasteRecordDto {
  @IsString()
  ingredientId: string;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  wasteReasonId?: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  @Min(0)
  costImpact: number;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  shift?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  supplierId?: string;
}
