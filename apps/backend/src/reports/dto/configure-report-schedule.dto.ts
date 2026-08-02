import { IsEnum, IsString, IsArray, IsOptional, IsNumber } from 'class-validator';

export enum ReportFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export class ConfigureReportScheduleDto {
  @IsString()
  name: string;

  @IsEnum(ReportFrequency)
  frequency: ReportFrequency;

  @IsString()
  time: string; // HH:mm format (e.g., "09:00")

  @IsOptional()
  @IsNumber()
  dayOfWeek?: number; // 0-6 for WEEKLY (0 = Sunday)

  @IsOptional()
  @IsNumber()
  dayOfMonth?: number; // 1-31 for MONTHLY

  @IsArray()
  @IsString({ each: true })
  recipientEmails: string[];

  @IsOptional()
  @IsString()
  description?: string;

  enabled: boolean;
}

export class UpdateReportScheduleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(ReportFrequency)
  frequency?: ReportFrequency;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsNumber()
  dayOfWeek?: number;

  @IsOptional()
  @IsNumber()
  dayOfMonth?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipientEmails?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  enabled?: boolean;
}
