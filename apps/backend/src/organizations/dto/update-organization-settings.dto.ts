import { IsOptional, IsString, IsNumber, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOrganizationSettingsDto {
  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  dateFormat?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  wasteAlertThreshold?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  expiryAlertDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  inventoryLowThreshold?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  enableNotifications?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  enableAIPredictions?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  enableSustainabilityTracking?: boolean;
}
