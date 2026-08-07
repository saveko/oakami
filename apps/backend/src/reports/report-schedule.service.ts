import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { ReportGeneratorService } from './report-generator.service';
import { EmailService } from '@/email/email.service';

@Injectable()
export class ReportScheduleService {
  constructor(
    private db: DatabaseService,
    private reportGenerator: ReportGeneratorService,
    private emailService: EmailService,
  ) {}

  async createSchedule(
    organizationId: string,
    userId: string,
    data: {
      name: string;
      description?: string;
      enabled: boolean;
      frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
      time: string;
      dayOfWeek?: number;
      dayOfMonth?: number;
      recipientEmails: string[];
    },
  ) {
    const existing = await this.db.reportSchedule.findUnique({
      where: { organizationId_name: { organizationId, name: data.name } },
    });

    if (existing) {
      throw new BadRequestException('Schedule with this name already exists');
    }

    const schedule = await this.db.reportSchedule.create({
      data: {
        organizationId,
        createdBy: userId,
        name: data.name,
        description: data.description,
        enabled: data.enabled,
        frequency: data.frequency,
        time: data.time,
        dayOfWeek: data.dayOfWeek,
        dayOfMonth: data.dayOfMonth,
        recipientEmails: data.recipientEmails,
        nextRunAt: this.calculateNextRunTime(data.frequency, data.time, data.dayOfWeek, data.dayOfMonth),
      },
    });

    return schedule;
  }

  async updateSchedule(
    organizationId: string,
    scheduleId: string,
    data: {
      name?: string;
      description?: string;
      enabled?: boolean;
      frequency?: string;
      time?: string;
      dayOfWeek?: number;
      dayOfMonth?: number;
      recipientEmails?: string[];
    },
  ) {
    const schedule = await this.getSchedule(organizationId, scheduleId);

    // Check for name conflict if updating name
    if (data.name && data.name !== schedule.name) {
      const existing = await this.db.reportSchedule.findUnique({
        where: { organizationId_name: { organizationId, name: data.name } },
      });
      if (existing) {
        throw new BadRequestException('Schedule with this name already exists');
      }
    }

    // Recalculate nextRunAt if schedule params changed
    let nextRunAt = schedule.nextRunAt;
    if (data.frequency || data.time || data.dayOfWeek || data.dayOfMonth) {
      nextRunAt = this.calculateNextRunTime(
        (data.frequency as any) || schedule.frequency,
        data.time || schedule.time,
        data.dayOfWeek ?? schedule.dayOfWeek,
        data.dayOfMonth ?? schedule.dayOfMonth,
      );
    }

    return this.db.reportSchedule.update({
      where: { id: scheduleId },
      data: {
        ...data,
        nextRunAt,
      },
    });
  }

  async getSchedule(organizationId: string, scheduleId: string) {
    const schedule = await this.db.reportSchedule.findFirst({
      where: { id: scheduleId, organizationId },
    });

    if (!schedule) {
      throw new NotFoundException('Report schedule not found');
    }

    return schedule;
  }

  async listSchedules(organizationId: string) {
    return this.db.reportSchedule.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteSchedule(organizationId: string, scheduleId: string) {
    const schedule = await this.getSchedule(organizationId, scheduleId);

    return this.db.reportSchedule.delete({
      where: { id: schedule.id },
    });
  }

  async executeSchedule(scheduleId: string) {
    const schedule = await this.db.reportSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule || !schedule.enabled) {
      return null;
    }

    // Generate report based on frequency
    let reportData;
    const reportType = schedule.frequency.toLowerCase();

    if (reportType === 'daily') {
      reportData = await this.reportGenerator.generateDailyReport(schedule.organizationId);
    } else if (reportType === 'weekly') {
      reportData = await this.reportGenerator.generateWeeklyReport(schedule.organizationId);
    } else if (reportType === 'monthly') {
      reportData = await this.reportGenerator.generateMonthlyReport(schedule.organizationId);
    }

    // Get organization name for email
    const organization = await this.db.organization.findUnique({
      where: { id: schedule.organizationId },
    });

    // Generate HTML email
    const htmlContent = await this.reportGenerator.generateHtmlEmail(
      reportData,
      reportType,
      organization?.name || 'Oakami',
    );

    // Send emails to all recipients
    const emailPromises = schedule.recipientEmails.map((email) =>
      this.emailService.sendReportEmail(
        email,
        `${schedule.name} - ${new Date().toLocaleDateString()}`,
        htmlContent,
      ),
    );

    await Promise.all(emailPromises);

    // Update schedule with last run time and next run time
    const nextRunAt = this.calculateNextRunTime(
      schedule.frequency as any,
      schedule.time,
      schedule.dayOfWeek || undefined,
      schedule.dayOfMonth || undefined,
    );

    await this.db.reportSchedule.update({
      where: { id: scheduleId },
      data: {
        lastRunAt: new Date(),
        nextRunAt,
      },
    });

    return {
      scheduleId,
      executedAt: new Date(),
      recipientsCount: schedule.recipientEmails.length,
    };
  }

  private calculateNextRunTime(
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY',
    time: string,
    dayOfWeek?: number,
    dayOfMonth?: number,
  ): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();

    if (frequency === 'DAILY') {
      const next = new Date();
      next.setHours(hours, minutes, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }

      return next;
    }

    if (frequency === 'WEEKLY') {
      const next = new Date();
      next.setHours(hours, minutes, 0, 0);
      const targetDay = dayOfWeek ?? now.getDay(); // Default to current day

      const daysUntilTarget = (targetDay - next.getDay() + 7) % 7;
      next.setDate(next.getDate() + (daysUntilTarget === 0 && next <= now ? 7 : daysUntilTarget));

      return next;
    }

    if (frequency === 'MONTHLY') {
      const next = new Date();
      next.setHours(hours, minutes, 0, 0);
      const targetDate = dayOfMonth ?? now.getDate();

      if (next.getDate() < targetDate || (next.getDate() === targetDate && next <= now)) {
        next.setDate(targetDate);
      } else {
        next.setMonth(next.getMonth() + 1);
        next.setDate(Math.min(targetDate, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
      }

      return next;
    }

    return now;
  }

  async getSchedulesForExecution(): Promise<any[]> {
    const now = new Date();

    // Get all enabled schedules with nextRunAt <= now
    return this.db.reportSchedule.findMany({
      where: {
        enabled: true,
        nextRunAt: {
          lte: now,
        },
      },
    });
  }
}
