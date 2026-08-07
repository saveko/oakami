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
    @Request() req: any,
    @Query('days') days?: number,
  ) {
    return this.analyticsService.getDashboardMetrics(
      req.user.organizationId,
      days || 7,
    );
  }

  @Get('waste-trend')
  async getWasteTrendAnalysis(
    @Request() req: any,
    @Query('days') days?: number,
  ) {
    return this.analyticsService.getWasteTrendAnalysis(
      req.user.organizationId,
      days || 30,
    );
  }

  @Get('categories')
  async getCategoryAnalysis(
    @Request() req: any,
    @Query('days') days?: number,
  ) {
    return this.analyticsService.getCategoryAnalysis(
      req.user.organizationId,
      days || 30,
    );
  }

  @Get('top-ingredients')
  async getTopWastedIngredients(
    @Request() req: any,
    @Query('days') days?: number,
    @Query('limit') limit?: number,
  ) {
    return this.analyticsService.getTopWastedIngredients(
      req.user.organizationId,
      days || 30,
      limit || 15,
    );
  }

  @Get('suppliers')
  async getSupplierWasteAnalysis(
    @Request() req: any,
    @Query('days') days?: number,
  ) {
    return this.analyticsService.getSupplierWasteAnalysis(
      req.user.organizationId,
      days || 30,
    );
  }

  @Get('cost-analysis')
  async getCostAnalysis(
    @Request() req: any,
    @Query('days') days?: number,
  ) {
    return this.analyticsService.getCostAnalysis(
      req.user.organizationId,
      days || 30,
    );
  }

  @Get('heatmap')
  async getHeatmapData(
    @Request() req: any,
    @Query('metric') metric?: string,
  ) {
    return this.analyticsService.getHeatmapData(
      req.user.organizationId,
      metric || 'cost',
    );
  }
}
