import { Module, OnModuleInit } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';
import { EmailModule } from '@/email/email.module';
import { ReportsService } from './reports.service';
import { ReportGeneratorService } from './report-generator.service';
import { ReportScheduleService } from './report-schedule.service';
import { ReportSchedulerService } from './report-scheduler.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [DatabaseModule, EmailModule],
  providers: [
    ReportsService,
    ReportGeneratorService,
    ReportScheduleService,
    ReportSchedulerService,
  ],
  controllers: [ReportsController],
  exports: [ReportGeneratorService, ReportSchedulerService],
})
export class ReportsModule implements OnModuleInit {
  constructor(private schedulerService: ReportSchedulerService) {}

  async onModuleInit() {
    // Start the report scheduler on app startup
    if (process.env.ENABLE_REPORT_SCHEDULER !== 'false') {
      await this.schedulerService.startScheduler();
    }
  }
}

