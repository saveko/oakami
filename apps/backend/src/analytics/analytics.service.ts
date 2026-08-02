import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';

@Injectable()
export class AnalyticsService {
  constructor(private db: DatabaseService) {}

  async getDashboardMetrics(organizationId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalWaste,
      wasteRecordCount,
      expiringItems,
      lowStockItems,
      categoryBreakdown,
      dailyTrend,
    ] = await Promise.all([
      this.getTotalWasteByPeriod(organizationId, startDate),
      this.getWasteRecordCount(organizationId, startDate),
      this.getExpiringItemsCount(organizationId),
      this.getLowStockItemsCount(organizationId),
      this.getCategoryBreakdown(organizationId, startDate),
      this.getDailyTrendData(organizationId, days),
    ]);

    return {
      period: `Last ${days} days`,
      startDate,
      endDate: new Date(),
      metrics: {
        totalWasteCost: totalWaste,
        wasteRecordCount,
        expiringItemsAlert: expiringItems,
        lowStockAlert: lowStockItems,
        averageWastePerRecord: wasteRecordCount > 0 ? totalWaste / wasteRecordCount : 0,
      },
      categoryBreakdown,
      dailyTrend,
    };
  }

  async getWasteTrendAnalysis(organizationId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where = {
      organizationId,
      createdAt: { gte: startDate },
      status: 'APPROVED',
    };

    // Fetch raw records and group in application layer (Prisma doesn't support date grouping directly)
    const records = await this.db.wasteRecord.findMany({
      where,
      select: {
        createdAt: true,
        costImpact: true,
        quantity: true,
      },
    });

    // Group by date
    const trendByDate = records.reduce((acc, record) => {
      const date = record.createdAt.toISOString().split('T')[0];
      const existing = acc.find((d) => d.date === date);

      if (existing) {
        existing.totalCost += record.costImpact;
        existing.totalQuantity += record.quantity;
        existing.recordCount += 1;
      } else {
        acc.push({
          date,
          totalCost: record.costImpact,
          totalQuantity: record.quantity,
          recordCount: 1,
        });
      }
      return acc;
    }, []);

    return trendByDate.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getCategoryAnalysis(organizationId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where = {
      organizationId,
      createdAt: { gte: startDate },
      status: 'APPROVED',
    };

    // Use database groupBy for category aggregation
    const categoryStats = await this.db.wasteRecord.groupBy({
      by: ['categoryId'],
      where,
      _sum: { costImpact: true, quantity: true },
      _count: true,
      orderBy: { _sum: { costImpact: 'desc' } },
    });

    const categoryIds = categoryStats.map((c) => c.categoryId);
    const categories = categoryIds.length
      ? await this.db.wasteCategory.findMany({
          where: { id: { in: categoryIds }, organizationId },
          select: { id: true, name: true, color: true },
        })
      : [];

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const categoryAnalysis = categoryStats.map((c) => {
      const cat = categoryMap.get(c.categoryId);
      return {
        categoryId: c.categoryId,
        categoryName: cat?.name || 'Unknown',
        color: cat?.color,
        cost: c._sum.costImpact || 0,
        quantity: c._sum.quantity || 0,
        recordCount: c._count,
      };
    });

    // Calculate percentages
    const totalCost = categoryAnalysis.reduce((sum, c) => sum + c.cost, 0);
    const categoryWithPercentages = categoryAnalysis.map((c) => ({
      ...c,
      percentage: totalCost > 0 ? (c.cost / totalCost) * 100 : 0,
    }));

    return categoryWithPercentages;
  }

  async getTopWastedIngredients(organizationId: string, days: number = 30, limit: number = 15) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await this.db.wasteRecord.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate },
        status: 'APPROVED',
      },
      include: {
        ingredient: {
          include: {
            category: true,
          },
        },
      },
    });

    const ingredientAnalysis = records.reduce((acc, record) => {
      const existing = acc.find((i) => i.ingredientId === record.ingredientId);

      if (existing) {
        existing.cost += record.costImpact;
        existing.quantity += record.quantity;
        existing.recordCount += 1;
      } else {
        acc.push({
          ingredientId: record.ingredientId,
          ingredientName: record.ingredient.name,
          categoryName: record.ingredient.category.name,
          cost: record.costImpact,
          quantity: record.quantity,
          recordCount: 1,
        });
      }
      return acc;
    }, []);

    return ingredientAnalysis
      .sort((a, b) => b.cost - a.cost)
      .slice(0, limit);
  }

  async getSupplierWasteAnalysis(organizationId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await this.db.wasteRecord.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate },
        status: 'APPROVED',
      },
      include: {
        ingredient: {
          include: {
            supplier: true,
          },
        },
      },
    });

    const supplierAnalysis = records
      .filter((r) => r.ingredient.supplier)
      .reduce((acc, record) => {
        const existing = acc.find((s) => s.supplierId === record.ingredient.supplierId);

        if (existing) {
          existing.wastedCost += record.costImpact;
          existing.wastedQuantity += record.quantity;
          existing.recordCount += 1;
        } else {
          acc.push({
            supplierId: record.ingredient.supplierId,
            supplierName: record.ingredient.supplier.name,
            wastedCost: record.costImpact,
            wastedQuantity: record.quantity,
            recordCount: 1,
          });
        }
        return acc;
      }, []);

    return supplierAnalysis.sort((a, b) => b.wastedCost - a.wastedCost);
  }

  async getCostAnalysis(organizationId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where = {
      organizationId,
      createdAt: { gte: startDate },
      status: 'APPROVED',
    };

    // Use database aggregation for totals
    const result = await this.db.wasteRecord.aggregate({
      where,
      _sum: { costImpact: true, quantity: true },
      _count: true,
    });

    const totalWasteCost = result._sum.costImpact || 0;
    const totalQuantity = result._sum.quantity || 0;
    const recordCount = result._count;
    const avgCostPerRecord = recordCount > 0 ? totalWasteCost / recordCount : 0;

    return {
      summary: {
        totalWasteCost,
        totalQuantity,
        avgCostPerRecord,
        avgCostPerDay: totalWasteCost / days,
        recordCount,
      },
      records: [],
    };
  }

  async getHeatmapData(organizationId: string, metric: string = 'cost') {
    // Get last 30 days of data
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const records = await this.db.wasteRecord.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate },
        status: 'APPROVED',
      },
      select: {
        createdAt: true,
        costImpact: true,
        quantity: true,
      },
    });

    // Create heatmap: Day of week x Hour of day
    const heatmapData = Array(7).fill(null).map(() => Array(24).fill(0));

    records.forEach((record) => {
      const dayOfWeek = record.createdAt.getDay();
      const hour = record.createdAt.getHours();
      heatmapData[dayOfWeek][hour] += metric === 'cost' ? record.costImpact : record.quantity;
    });

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const result = heatmapData.map((dayData, dayIndex) => ({
      day: days[dayIndex],
      data: dayData.map((value, hour) => ({
        hour,
        value,
      })),
    }));

    return result;
  }

  private async getTotalWasteByPeriod(organizationId: string, startDate: Date) {
    const result = await this.db.wasteRecord.aggregate({
      where: {
        organizationId,
        createdAt: { gte: startDate },
        status: 'APPROVED',
      },
      _sum: {
        costImpact: true,
      },
    });

    return result._sum.costImpact || 0;
  }

  private async getWasteRecordCount(organizationId: string, startDate: Date) {
    return this.db.wasteRecord.count({
      where: {
        organizationId,
        createdAt: { gte: startDate },
        status: 'APPROVED',
      },
    });
  }

  private async getExpiringItemsCount(organizationId: string) {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return this.db.inventoryItem.count({
      where: {
        organizationId,
        expiryDate: {
          lte: thirtyDaysFromNow,
          gte: new Date(),
        },
      },
    });
  }

  private async getLowStockItemsCount(organizationId: string) {
    // Fetch all items but with selective select to minimize memory usage
    // Note: Database-level column comparison not directly supported in Prisma
    // Consider using raw query or application-level filtering as compromise
    const items = await this.db.inventoryItem.findMany({
      where: { organizationId },
      select: { quantity: true, minThreshold: true },
    });

    return items.filter((item) => item.quantity <= item.minThreshold).length;
  }

  private async getCategoryBreakdown(organizationId: string, startDate: Date) {
    const records = await this.db.wasteRecord.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate },
        status: 'APPROVED',
      },
      include: {
        category: true,
      },
    });

    return records.reduce((acc, record) => {
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
  }

  private async getDailyTrendData(organizationId: string, days: number) {
    const records = await this.db.wasteRecord.findMany({
      where: {
        organizationId,
        createdAt: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        },
        status: 'APPROVED',
      },
      select: {
        createdAt: true,
        costImpact: true,
      },
    });

    const trendByDate = records.reduce((acc, record) => {
      const date = record.createdAt.toISOString().split('T')[0];
      const existing = acc.find((d) => d.date === date);

      if (existing) {
        existing.cost += record.costImpact;
        existing.count += 1;
      } else {
        acc.push({
          date,
          cost: record.costImpact,
          count: 1,
        });
      }
      return acc;
    }, []);

    return trendByDate.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}
