import { Injectable } from '@nestjs/common';
import { ReportScheduleService } from './report-schedule.service';
import { DatabaseService } from '@/database/database.service';

@Injectable()
export class ReportSchedulerService {
  constructor(
    private reportScheduleService: ReportScheduleService,
    private db: DatabaseService,
  ) {}

  async executeScheduledReports(): Promise<any[]> {
    const schedulesToExecute = await this.reportScheduleService.getSchedulesForExecution();

    const results = [];
    for (const schedule of schedulesToExecute) {
      try {
        const result = await this.reportScheduleService.executeSchedule(schedule.id);
        if (result) {
          results.push(result);
        }
      } catch (error) {
        console.error(`Error executing schedule ${schedule.id}:`, error);
      }
    }

    return results;
  }

  async startScheduler(): Promise<void> {
    console.log('Starting report scheduler...');

    // Execute immediately and then every minute
    await this.executeScheduledReports();

    setInterval(async () => {
      try {
        await this.executeScheduledReports();
      } catch (error) {
        console.error('Error in report scheduler:', error);
      }
    }, 60000); // Check every minute
  }

  async stopScheduler(): Promise<void> {
    console.log('Stopping report scheduler...');
    // Note: In a production environment, you'd want to store the interval ID
    // and clear it properly. For this MVP, we rely on the app lifecycle.
  }
}
