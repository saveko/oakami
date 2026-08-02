import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ListReportsDto } from './dto/list-reports.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  async createTemplate(
    @Body() createReportDto: CreateReportDto,
    @Request() req: any,
  ) {
    return this.reportsService.createTemplate(
      req.user.organizationId,
      req.user.id,
      createReportDto,
    );
  }

  @Get()
  async listReports(
    @Query() listReportsDto: ListReportsDto,
    @Request() req: any,
  ) {
    return this.reportsService.listReports(
      req.user.organizationId,
      listReportsDto,
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Request() req: any) {
    return this.reportsService.findById(req.user.organizationId, id);
  }

  @Post(':id/generate')
  async generateReport(@Param('id') id: string, @Request() req: any) {
    return this.reportsService.generateReport(req.user.organizationId, id);
  }

  @Post(':id/schedule')
  async scheduleReport(
    @Param('id') id: string,
    @Body() scheduleDto: any,
    @Request() req: any,
  ) {
    return this.reportsService.scheduleReport(req.user.organizationId, id, scheduleDto);
  }

  @Delete(':id')
  async deleteReport(@Param('id') id: string, @Request() req: any) {
    return this.reportsService.deleteReport(req.user.organizationId, id);
  }

  @Get('daily/today')
  async getDailyReport(@Query('date') date?: string, @Request() req: any) {
    return this.reportsService.getDailyReport(req.user.organizationId, date);
  }

  @Get('weekly/current')
  async getWeeklyReport(@Request() req: any) {
    return this.reportsService.getWeeklyReport(req.user.organizationId);
  }

  @Get('monthly/current')
  async getMonthlyReport(
    @Query('month') month?: number,
    @Query('year') year?: number,
    @Request() req: any,
  ) {
    return this.reportsService.getMonthlyReport(
      req.user.organizationId,
      month,
      year,
    );
  }
}
