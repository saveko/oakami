import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ListReportsDto } from './dto/list-reports.dto';

@Injectable()
export class ReportsService {
  constructor(private db: DatabaseService) {}

  async createTemplate(organizationId: string, userId: string, createReportDto: CreateReportDto) {
    const { name, type, frequency, startDate, endDate, filters } = createReportDto;

    const report = await this.db.report.create({
      data: {
        organizationId,
        name,
        type,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        filters: filters ? JSON.stringify(filters) : null,
        createdById: userId,
        format: 'PDF',
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return report;
  }

  async listReports(organizationId: string, listReportsDto: ListReportsDto) {
    const {
      skip = 0,
      take = 20,
      type,
      frequency,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = listReportsDto;

    const where: any = { organizationId };

    if (type) where.type = type;
    if (frequency) where.frequency = frequency;

    const [reports, total] = await Promise.all([
      this.db.report.findMany({
        where,
        include: {
          createdBy: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder.toLowerCase(),
        },
        skip,
        take,
      }),
      this.db.report.count({ where }),
    ]);

    return {
      data: reports,
      pagination: {
        total,
        skip,
        take,
        pages: Math.ceil(total / take),
      },
    };
  }

  async findById(organizationId: string, id: string) {
    const report = await this.db.report.findFirst({
      where: { id, organizationId },
      include: {
        createdBy: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async generateReport(organizationId: string, id: string) {
    const report = await this.findById(organizationId, id);

    // Fetch waste data for the report period
    const wasteRecords = await this.db.wasteRecord.findMany({
      where: {
        organizationId,
        createdAt: {
          gte: report.startDate,
          lte: report.endDate || new Date(),
        },
        status: 'APPROVED',
      },
      include: {
        ingredient: {
          include: {
            category: true,
            supplier: true,
          },
        },
        category: true,
      },
    });

    const reportData = this.generateReportData(report.type, wasteRecords);

    // Update report with generated data and file URL
    const updatedReport = await this.db.report.update({
      where: { id },
      data: {
        fileUrl: `/reports/${id}-${Date.now()}.pdf`,
        lastSentAt: new Date(),
      },
    });

    return {
      report: updatedReport,
      data: reportData,
    };
  }

  async scheduleReport(organizationId: string, id: string, scheduleDto: any) {
    const { scheduledFor, sentTo } = scheduleDto;

    return this.db.report.update({
      where: { id },
      data: {
        scheduledFor: new Date(scheduledFor),
        sentTo,
      },
    });
  }

  async deleteReport(organizationId: string, id: string) {
    await this.findById(organizationId, id);

    return this.db.report.delete({
      where: { id },
    });
  }

  private generateReportData(reportType: string, wasteRecords: any[]) {
    const summary = {
      totalRecords: wasteRecords.length,
      totalWasteCost: wasteRecords.reduce((sum, r) => sum + r.costImpact, 0),
      totalQuantity: wasteRecords.reduce((sum, r) => sum + r.quantity, 0),
      averageWasteCost: 0,
      period: 'N/A',
    };

    if (wasteRecords.length > 0) {
      summary.averageWasteCost = summary.totalWasteCost / wasteRecords.length;
    }

    // Category breakdown
    const categoryBreakdown = wasteRecords.reduce((acc, record) => {
      const existing = acc.find((c) => c.categoryId === record.categoryId);
      if (existing) {
        existing.cost += record.costImpact;
        existing.quantity += record.quantity;
        existing.count += 1;
      } else {
        acc.push({
          categoryId: record.categoryId,
          categoryName: record.category.name,
          cost: record.costImpact,
          quantity: record.quantity,
          count: 1,
        });
      }
      return acc;
    }, []);

    // Top ingredients
    const topIngredients = wasteRecords
      .reduce((acc, record) => {
        const existing = acc.find((i) => i.ingredientId === record.ingredientId);
        if (existing) {
          existing.cost += record.costImpact;
          existing.quantity += record.quantity;
          existing.count += 1;
        } else {
          acc.push({
            ingredientId: record.ingredientId,
            ingredientName: record.ingredient.name,
            categoryName: record.ingredient.category.name,
            cost: record.costImpact,
            quantity: record.quantity,
            count: 1,
          });
        }
        return acc;
      }, [])
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 15);

    // Supplier analysis
    const supplierAnalysis = wasteRecords
      .filter((r) => r.ingredient.supplier)
      .reduce((acc, record) => {
        const existing = acc.find((s) => s.supplierId === record.ingredient.supplierId);
        if (existing) {
          existing.wastedQuantity += record.quantity;
          existing.wastedCost += record.costImpact;
          existing.count += 1;
        } else {
          acc.push({
            supplierId: record.ingredient.supplierId,
            supplierName: record.ingredient.supplier.name,
            wastedQuantity: record.quantity,
            wastedCost: record.costImpact,
            count: 1,
          });
        }
        return acc;
      }, []);

    return {
      summary,
      categoryBreakdown: categoryBreakdown.sort((a, b) => b.cost - a.cost),
      topIngredients,
      supplierAnalysis: supplierAnalysis.sort((a, b) => b.wastedCost - a.wastedCost),
      records: wasteRecords,
    };
  }

  async getDailyReport(organizationId: string, date?: string) {
    const reportDate = date ? new Date(date) : new Date();
    reportDate.setHours(0, 0, 0, 0);

    const endOfDay = new Date(reportDate);
    endOfDay.setHours(23, 59, 59, 999);

    const records = await this.db.wasteRecord.findMany({
      where: {
        organizationId,
        createdAt: {
          gte: reportDate,
          lte: endOfDay,
        },
        status: 'APPROVED',
      },
      include: {
        ingredient: {
          include: {
            category: true,
          },
        },
        category: true,
      },
    });

    return this.generateReportData('DAILY', records);
  }

  async getWeeklyReport(organizationId: string) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const records = await this.db.wasteRecord.findMany({
      where: {
        organizationId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'APPROVED',
      },
      include: {
        ingredient: {
          include: {
            category: true,
          },
        },
        category: true,
      },
    });

    return this.generateReportData('WEEKLY', records);
  }

  async getMonthlyReport(organizationId: string, month?: number, year?: number) {
    const now = new Date();
    const reportMonth = month || now.getMonth();
    const reportYear = year || now.getFullYear();

    const startDate = new Date(reportYear, reportMonth, 1);
    const endDate = new Date(reportYear, reportMonth + 1, 0);

    const records = await this.db.wasteRecord.findMany({
      where: {
        organizationId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'APPROVED',
      },
      include: {
        ingredient: {
          include: {
            category: true,
          },
        },
        category: true,
      },
    });

    return this.generateReportData('MONTHLY', records);
  }
}
