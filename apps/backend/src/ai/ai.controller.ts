import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { GeneratePredictionsDto } from './dto/generate-predictions.dto';
import { GetPredictionsDto } from './dto/get-predictions.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Get('predictions')
  async getPredictions(
    @Query() dto: GetPredictionsDto,
    @Request() req: any,
  ) {
    return this.aiService.getOrganizationPredictions(
      req.user.organizationId,
      dto.type,
      dto.limit,
      dto.skip,
    );
  }

  @Post('generate')
  async generatePredictions(
    @Body() dto: GeneratePredictionsDto,
    @Request() req: any,
  ) {
    const predictions = await this.aiService.generatePredictions(
      req.user.organizationId,
      dto.daysToAnalyze,
      dto.predictionTypes,
    );
    return {
      success: true,
      count: predictions.length,
      predictions,
    };
  }

  @Get('predictions/:type')
  async getPredictionsByType(
    @Query() dto: GetPredictionsDto,
    @Request() req: any,
  ) {
    return this.aiService.getOrganizationPredictions(
      req.user.organizationId,
      dto.type,
      dto.limit,
      dto.skip,
    );
  }
}
