import { IsOptional, IsNumber, Min, Max, IsArray, IsEnum } from 'class-validator';

enum PredictionType {
  WASTE = 'WASTE',
  EXPIRY = 'EXPIRY',
  DEMAND = 'DEMAND',
  PURCHASE = 'PURCHASE',
  RISK_SCORE = 'RISK_SCORE',
}

export class GeneratePredictionsDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(90)
  daysToAnalyze?: number = 30;

  @IsOptional()
  @IsArray()
  @IsEnum(PredictionType, { each: true })
  predictionTypes?: PredictionType[];
}
