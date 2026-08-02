import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { PredictionType } from '@prisma/client';

interface WasteDataPoint {
  date: string;
  quantity: number;
  cost: number;
}

interface InventoryData {
  id: string;
  name: string;
  quantity: number;
  expiryDate?: Date;
}

@Injectable()
export class AiService {
  constructor(
    private db: DatabaseService,
    private notificationsService: NotificationsService,
  ) {}

  async generatePredictions(
    organizationId: string,
    daysToAnalyze: number = 30,
    predictionTypes?: string[],
  ) {
    const typesToGenerate = predictionTypes || [
      PredictionType.WASTE,
      PredictionType.DEMAND,
      PredictionType.RISK_SCORE,
      PredictionType.EXPIRY,
      PredictionType.PURCHASE,
    ];

    const predictions = [];

    for (const type of typesToGenerate) {
      try {
        const prediction = await this.generatePredictionByType(
          organizationId,
          type as PredictionType,
          daysToAnalyze,
        );
        if (prediction) {
          predictions.push(prediction);
          // Trigger notification for high-confidence predictions
          if (prediction.confidence >= 0.7) {
            await this.notificationsService.onPredictionGenerated(
              organizationId,
              prediction,
            );
          }
        }
      } catch (error) {
        console.error(`Error generating ${type} prediction:`, error);
      }
    }

    return predictions;
  }

  private async generatePredictionByType(
    organizationId: string,
    type: PredictionType,
    daysToAnalyze: number,
  ) {
    switch (type) {
      case PredictionType.WASTE:
        return this.predictWasteTrend(organizationId, daysToAnalyze);
      case PredictionType.DEMAND:
        return this.predictDemand(organizationId, daysToAnalyze);
      case PredictionType.RISK_SCORE:
        return this.calculateRiskScore(organizationId, daysToAnalyze);
      case PredictionType.EXPIRY:
        return this.predictExpiry(organizationId);
      case PredictionType.PURCHASE:
        return this.recommendPurchases(organizationId, daysToAnalyze);
      default:
        return null;
    }
  }

  private async predictWasteTrend(
    organizationId: string,
    daysToAnalyze: number,
  ) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToAnalyze);

    const records = await this.db.wasteRecord.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate },
      },
      select: {
        quantity: true,
        cost: true,
        createdAt: true,
        unit: true,
      },
    });

    if (records.length === 0) {
      return null;
    }

    const dailyData = this.aggregateByDate(records);
    const avgQuantity = this.calculateAverage(dailyData.map((d) => d.quantity));
    const avgCost = this.calculateAverage(dailyData.map((d) => d.cost));
    const variance = this.calculateVariance(dailyData.map((d) => d.cost));
    const trend = this.calculateTrend(dailyData.map((d) => d.cost));

    const confidence = Math.min(0.95, 0.5 + variance / 1000);
    const projectedCost = avgCost * 7 * (1 + trend);

    const recommendation =
      trend > 0.1
        ? `Waste is increasing. Focus on ${this.topWasteCategory(records)} category to reduce costs.`
        : `Waste levels are stable. Continue current practices in waste management.`;

    return this.createPrediction(
      organizationId,
      PredictionType.WASTE,
      projectedCost,
      confidence,
      '$',
      recommendation,
      `7-day waste forecast: $${projectedCost.toFixed(2)}`,
    );
  }

  private async predictDemand(organizationId: string, daysToAnalyze: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToAnalyze);

    const records = await this.db.wasteRecord.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate },
      },
      select: {
        quantity: true,
        unit: true,
        createdAt: true,
        ingredientId: true,
      },
    });

    if (records.length === 0) {
      return null;
    }

    const dailyQuantity = this.aggregateByDate(records).reduce(
      (sum, d) => sum + d.quantity,
      0,
    );
    const avgDailyDemand = dailyQuantity / (daysToAnalyze || 1);

    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
    const demandMultiplier = isWeekend ? 1.3 : 1.0;
    const projectedDemand = avgDailyDemand * demandMultiplier;

    const recommendation = `Prepare ${projectedDemand.toFixed(1)} kg of ingredients daily. Higher demand expected on weekends.`;

    return this.createPrediction(
      organizationId,
      PredictionType.DEMAND,
      projectedDemand,
      0.78,
      'kg',
      recommendation,
      `Daily demand forecast`,
    );
  }

  private async calculateRiskScore(
    organizationId: string,
    daysToAnalyze: number,
  ) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToAnalyze);

    const records = await this.db.wasteRecord.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate },
      },
      select: {
        cost: true,
      },
    });

    if (records.length === 0) {
      return null;
    }

    const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
    const avgDailyCost = totalCost / daysToAnalyze;
    const riskPercentage = Math.min(100, (avgDailyCost / 500) * 100);

    const highRiskLevel = riskPercentage > 20 ? 'HIGH' : 'MEDIUM';
    const recommendation =
      riskPercentage > 20
        ? `High waste risk detected. Immediate action needed. Implement waste reduction strategy immediately.`
        : `Waste is within acceptable range. Continue monitoring and optimize highest waste categories.`;

    return this.createPrediction(
      organizationId,
      PredictionType.RISK_SCORE,
      riskPercentage,
      1.0,
      '%',
      recommendation,
      `Risk assessment: ${highRiskLevel}`,
    );
  }

  private async predictExpiry(organizationId: string) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + 3);

    const expiringItems = await this.db.inventoryItem.findMany({
      where: {
        organizationId,
        expiryDate: {
          lte: thresholdDate,
          gt: new Date(),
        },
      },
      select: {
        name: true,
        expiryDate: true,
      },
    });

    if (expiringItems.length === 0) {
      return null;
    }

    const daysUntilExpiry = expiringItems[0].expiryDate
      ? Math.ceil(
          (expiringItems[0].expiryDate.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

    const recommendation = `${expiringItems.length} items expiring within 3 days. Prioritize using ${expiringItems[0].name} before ${expiringItems[0].expiryDate?.toLocaleDateString()}.`;

    return this.createPrediction(
      organizationId,
      PredictionType.EXPIRY,
      daysUntilExpiry,
      1.0,
      'days',
      recommendation,
      `${expiringItems.length} items expiring soon`,
    );
  }

  private async recommendPurchases(
    organizationId: string,
    daysToAnalyze: number,
  ) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToAnalyze);

    const records = await this.db.wasteRecord.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate },
      },
      select: {
        quantity: true,
        ingredientId: true,
      },
    });

    if (records.length === 0) {
      return null;
    }

    const avgDailyUsage = records.reduce((sum, r) => sum + r.quantity, 0) / daysToAnalyze;
    const safetyBuffer = 1;
    const recommendedQuantity = avgDailyUsage * 7 + safetyBuffer;

    const recommendation = `Purchase approximately ${recommendedQuantity.toFixed(1)} kg to maintain 7-day supply with safety buffer.`;

    return this.createPrediction(
      organizationId,
      PredictionType.PURCHASE,
      recommendedQuantity,
      0.75,
      'kg',
      recommendation,
      `Purchase recommendation`,
    );
  }

  async getOrganizationPredictions(
    organizationId: string,
    type?: string,
    limit: number = 20,
    skip: number = 0,
  ) {
    const where: any = { organizationId };
    if (type) {
      where.predictionType = type;
    }

    const predictions = await this.db.aIPrediction.findMany({
      where,
      orderBy: { predictedFor: 'desc' },
      take: limit,
      skip,
    });

    const total = await this.db.aIPrediction.count({ where });

    return {
      data: predictions,
      pagination: { total, skip, take: limit, pages: Math.ceil(total / limit) },
    };
  }

  private async createPrediction(
    organizationId: string,
    type: PredictionType,
    value: number,
    confidence: number,
    unit: string,
    recommendation: string,
    reason?: string,
  ) {
    return this.db.aIPrediction.create({
      data: {
        organizationId,
        predictionType: type,
        value,
        confidence: Math.min(Math.max(confidence, 0), 1),
        unit,
        recommendation,
        reason: reason || recommendation,
        predictedFor: new Date(),
      },
    });
  }

  private aggregateByDate(
    records: Array<{ quantity?: number; cost?: number; createdAt: Date }>,
  ): WasteDataPoint[] {
    const aggregated = new Map<string, WasteDataPoint>();

    records.forEach((record) => {
      const dateKey = record.createdAt.toISOString().split('T')[0];
      if (!aggregated.has(dateKey)) {
        aggregated.set(dateKey, { date: dateKey, quantity: 0, cost: 0 });
      }
      const data = aggregated.get(dateKey)!;
      data.quantity += record.quantity || 0;
      data.cost += record.cost || 0;
    });

    return Array.from(aggregated.values());
  }

  private calculateAverage(values: number[]): number {
    return values.length === 0 ? 0 : values.reduce((a, b) => a + b) / values.length;
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = this.calculateAverage(values);
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    return Math.sqrt(this.calculateAverage(squaredDiffs));
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const avgFirst = this.calculateAverage(firstHalf);
    const avgSecond = this.calculateAverage(secondHalf);
    return (avgSecond - avgFirst) / (avgFirst || 1);
  }

  private topWasteCategory(
    records: Array<{ quantity: number; unit: string }>,
  ): string {
    return records.length > 0 ? 'produce' : 'general';
  }
}
