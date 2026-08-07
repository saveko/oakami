import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';

export class GetPredictionsDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(90)
  days?: number = 7;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  @Min(0)
  skip?: number = 0;
}
