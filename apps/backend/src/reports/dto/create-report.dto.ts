import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateReportDto {
  @IsString()
  name: string;

  @IsString()
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'COST' | 'WASTE' | 'CATEGORY' | 'INGREDIENT' | 'SHIFT' | 'STAFF' | 'CUSTOM';

  @IsString()
  frequency: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}
