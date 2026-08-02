import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardMetrics(
    @Query('days') days?: number,
    @Request() req: any,
  ) {
    return this.analyticsService.getDashboardMetrics(
      req.user.organizationId,
      days || 7,
    );
  }

  @Get('waste-trend')
  async getWasteTrendAnalysis(
    @Query('days') days?: number,
    @Request() req: any,
  ) {
    return this.analyticsService.getWasteTrendAnalysis(
      req.user.organizationId,
      days || 30,
    );
  }

  @Get('categories')
  async getCategoryAnalysis(
    @Query('days') days?: number,
    @Request() req: any,
  ) {
    return this.analyticsService.getCategoryAnalysis(
      req.user.organizationId,
      days || 30,
    );
  }

  @Get('top-ingredients')
  async getTopWastedIngredients(
    @Query('days') days?: number,
    @Query('limit') limit?: number,
    @Request() req: any,
  ) {
    return this.analyticsService.getTopWastedIngredients(
      req.user.organizationId,
      days || 30,
      limit || 15,
    );
  }

  @Get('suppliers')
  async getSupplierWasteAnalysis(
    @Query('days') days?: number,
    @Request() req: any,
  ) {
    return this.analyticsService.getSupplierWasteAnalysis(
      req.user.organizationId,
      days || 30,
    );
  }

  @Get('cost-analysis')
  async getCostAnalysis(
    @Query('days') days?: number,
    @Request() req: any,
  ) {
    return this.analyticsService.getCostAnalysis(
      req.user.organizationId,
      days || 30,
    );
  }

  @Get('heatmap')
  async getHeatmapData(
    @Query('metric') metric?: string,
    @Request() req: any,
  ) {
    return this.analyticsService.getHeatmapData(
      req.user.organizationId,
      metric || 'cost',
    );
  }
}
