import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportScheduleService } from './report-schedule.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ListReportsDto } from './dto/list-reports.dto';
import { ConfigureReportScheduleDto, UpdateReportScheduleDto } from './dto/configure-report-schedule.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(
    private reportsService: ReportsService,
    private reportScheduleService: ReportScheduleService,
  ) {}

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
  async getDailyReport(@Request() req: any, @Query('date') date?: string) {
    return this.reportsService.getDailyReport(req.user.organizationId, date);
  }

  @Get('weekly/current')
  async getWeeklyReport(@Request() req: any) {
    return this.reportsService.getWeeklyReport(req.user.organizationId);
  }

  @Get('monthly/current')
  async getMonthlyReport(
    @Request() req: any,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.reportsService.getMonthlyReport(
      req.user.organizationId,
      month,
      year,
    );
  }

  @Post('schedules')
  async createSchedule(
    @Body() configureReportScheduleDto: ConfigureReportScheduleDto,
    @Request() req: any,
  ) {
    return this.reportScheduleService.createSchedule(
      req.user.organizationId,
      req.user.id,
      configureReportScheduleDto,
    );
  }

  @Get('schedules')
  async listSchedules(@Request() req: any) {
    return this.reportScheduleService.listSchedules(req.user.organizationId);
  }

  @Get('schedules/:scheduleId')
  async getSchedule(
    @Param('scheduleId') scheduleId: string,
    @Request() req: any,
  ) {
    return this.reportScheduleService.getSchedule(req.user.organizationId, scheduleId);
  }

  @Patch('schedules/:scheduleId')
  async updateSchedule(
    @Param('scheduleId') scheduleId: string,
    @Body() updateReportScheduleDto: UpdateReportScheduleDto,
    @Request() req: any,
  ) {
    return this.reportScheduleService.updateSchedule(
      req.user.organizationId,
      scheduleId,
      updateReportScheduleDto,
    );
  }

  @Delete('schedules/:scheduleId')
  async deleteSchedule(
    @Param('scheduleId') scheduleId: string,
    @Request() req: any,
  ) {
    return this.reportScheduleService.deleteSchedule(req.user.organizationId, scheduleId);
  }
}
