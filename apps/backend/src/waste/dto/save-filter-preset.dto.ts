import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class SaveFilterPresetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description?: string;

  @IsObject()
  @IsNotEmpty()
  filterCriteria: Record<string, any>;
}

export class UpdateFilterPresetDto {
  @IsString()
  name?: string;

  @IsString()
  description?: string;

  @IsObject()
  filterCriteria?: Record<string, any>;
}
