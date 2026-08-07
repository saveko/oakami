import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';

@Injectable()
export class ReportGeneratorService {
  constructor(private db: DatabaseService) {}

  async generateDailyReport(organizationId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's waste data
    const wasteRecords = await this.db.wasteRecord.findMany({
      where: {
        organizationId,
        status: 'APPROVED',
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        ingredient: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    const totalCost = wasteRecords.reduce((sum, r) => sum + r.costImpact, 0);
    const totalQuantity = wasteRecords.reduce((sum, r) => sum + r.quantity, 0);
    const recordCount = wasteRecords.length;

    // Group by category
    const byCategory = new Map<string, any>();
    wasteRecords.forEach((record) => {
      const catName = record.category?.name || 'Unknown';
      if (!byCategory.has(catName)) {
        byCategory.set(catName, { count: 0, cost: 0, quantity: 0 });
      }
      const cat = byCategory.get(catName);
      cat.count += 1;
      cat.cost += record.costImpact;
      cat.quantity += record.quantity;
    });

    // Get prediction for tomorrow
    const tomorrow2 = new Date();
    tomorrow2.setDate(tomorrow2.getDate() + 1);
    const prediction = await this.db.aIPrediction.findFirst({
      where: {
        organizationId,
        predictionType: 'WASTE',
        predictedFor: {
          gte: tomorrow,
          lt: new Date(tomorrow2.getTime() + 86400000),
        },
      },
    });

    return {
      date: today.toISOString().split('T')[0],
      summary: {
        totalCost: Math.round(totalCost * 100) / 100,
        totalQuantity,
        recordCount,
      },
      byCategory: Array.from(byCategory.entries()).map(([name, data]) => ({
        name,
        ...data,
      })),
      prediction: prediction ? {
        value: prediction.value,
        unit: prediction.unit,
        recommendation: prediction.recommendation,
      } : null,
    };
  }

  async generateWeeklyReport(organizationId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const wasteRecords = await this.db.wasteRecord.findMany({
      where: {
        organizationId,
        status: 'APPROVED',
        createdAt: {
          gte: weekAgo,
          lt: today,
        },
      },
      include: {
        ingredient: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    const totalCost = wasteRecords.reduce((sum, r) => sum + r.costImpact, 0);
    const avgDaily = totalCost / 7;

    // Group by day
    const byDay = new Map<string, number>();
    wasteRecords.forEach((record) => {
      const day = record.createdAt.toISOString().split('T')[0];
      byDay.set(day, (byDay.get(day) || 0) + record.costImpact);
    });

    // Top categories
    const categories = new Map<string, number>();
    wasteRecords.forEach((record) => {
      const catName = record.category?.name || 'Unknown';
      categories.set(catName, (categories.get(catName) || 0) + record.costImpact);
    });

    const topCategories = Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, cost]) => ({ name, cost }));

    return {
      period: `${weekAgo.toISOString().split('T')[0]} to ${today.toISOString().split('T')[0]}`,
      summary: {
        totalCost: Math.round(totalCost * 100) / 100,
        avgDaily: Math.round(avgDaily * 100) / 100,
        recordCount: wasteRecords.length,
      },
      dailyTrend: Array.from(byDay.entries())
        .map(([day, cost]) => ({ day, cost: Math.round(cost * 100) / 100 }))
        .sort((a, b) => a.day.localeCompare(b.day)),
      topCategories,
    };
  }

  async generateMonthlyReport(organizationId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthAgo = new Date(today);
    monthAgo.setDate(1);

    const wasteRecords = await this.db.wasteRecord.findMany({
      where: {
        organizationId,
        status: 'APPROVED',
        createdAt: {
          gte: monthAgo,
          lt: today,
        },
      },
      include: {
        ingredient: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    const totalCost = wasteRecords.reduce((sum, r) => sum + r.costImpact, 0);
    const totalQuantity = wasteRecords.reduce((sum, r) => sum + r.quantity, 0);

    // Top ingredients
    const ingredients = new Map<string, number>();
    wasteRecords.forEach((record) => {
      const ingName = record.ingredient?.name || 'Unknown';
      ingredients.set(ingName, (ingredients.get(ingName) || 0) + record.costImpact);
    });

    const topIngredients = Array.from(ingredients.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, cost]) => ({ name, cost }));

    return {
      month: monthAgo.toISOString().split('T')[0].slice(0, 7),
      summary: {
        totalCost: Math.round(totalCost * 100) / 100,
        totalQuantity,
        recordCount: wasteRecords.length,
        avgPerRecord: wasteRecords.length > 0 
          ? Math.round((totalCost / wasteRecords.length) * 100) / 100 
          : 0,
      },
      topIngredients,
      costTrend: 'trend_data_here',
    };
  }

  generateHtmlEmail(reportData: any, reportType: string, organizationName: string): string {
    const header = `
      <div style="background: linear-gradient(135deg, #0ea5e9 0%, #10b981 100%); padding: 20px; color: white; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">${organizationName}</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Waste Management Report</p>
      </div>
    `;

    let content = '';

    if (reportType === 'DAILY') {
      content = this.generateDailyHtml(reportData);
    } else if (reportType === 'WEEKLY') {
      content = this.generateWeeklyHtml(reportData);
    } else if (reportType === 'MONTHLY') {
      content = this.generateMonthlyHtml(reportData);
    }

    const footer = `
      <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb;">
        <p>This is an automated report from Oakami Waste Intelligence</p>
        <p>© 2026 Oakami. All rights reserved.</p>
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          .stat { display: inline-block; width: 30%; padding: 15px; text-align: center; }
          .stat-value { font-size: 32px; font-weight: bold; color: #0ea5e9; }
          .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background: white;">
          ${header}
          ${content}
          ${footer}
        </div>
      </body>
      </html>
    `;
  }

  private generateDailyHtml(data: any): string {
    return `
      <div style="padding: 20px;">
        <h2 style="color: #333; margin-top: 0;">Daily Summary - ${data.date}</h2>
        
        <div style="display: flex; justify-content: space-around; margin: 30px 0;">
          <div class="stat">
            <div class="stat-value">$${data.summary.totalCost}</div>
            <div class="stat-label">Total Cost</div>
          </div>
          <div class="stat">
            <div class="stat-value">${data.summary.totalQuantity} kg</div>
            <div class="stat-label">Total Waste</div>
          </div>
          <div class="stat">
            <div class="stat-value">${data.summary.recordCount}</div>
            <div class="stat-label">Records</div>
          </div>
        </div>

        <h3 style="color: #333;">Waste by Category</h3>
        <table>
          <tr><th>Category</th><th>Cost</th><th>Quantity</th><th>Records</th></tr>
          ${data.byCategory.map((cat: any) => `
            <tr>
              <td>${cat.name}</td>
              <td>$${cat.cost.toFixed(2)}</td>
              <td>${cat.quantity} kg</td>
              <td>${cat.count}</td>
            </tr>
          `).join('')}
        </table>

        ${data.prediction ? `
          <h3 style="color: #333;">Tomorrow's Prediction</h3>
          <div style="background: #eff6ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 15px 0;">
            <p style="margin: 0; color: #0c4a6e; font-weight: 600;">
              Predicted Waste: ${data.prediction.value} ${data.prediction.unit}
            </p>
            <p style="margin: 10px 0 0 0; color: #334155; font-size: 14px;">
              ${data.prediction.recommendation}
            </p>
          </div>
        ` : ''}
      </div>
    `;
  }

  private generateWeeklyHtml(data: any): string {
    return `
      <div style="padding: 20px;">
        <h2 style="color: #333; margin-top: 0;">Weekly Report - ${data.period}</h2>
        
        <div style="display: flex; justify-content: space-around; margin: 30px 0;">
          <div class="stat">
            <div class="stat-value">$${data.summary.totalCost}</div>
            <div class="stat-label">Total Cost</div>
          </div>
          <div class="stat">
            <div class="stat-value">$${data.summary.avgDaily}</div>
            <div class="stat-label">Daily Avg</div>
          </div>
          <div class="stat">
            <div class="stat-value">${data.summary.recordCount}</div>
            <div class="stat-label">Records</div>
          </div>
        </div>

        <h3 style="color: #333;">Top 5 Categories</h3>
        <table>
          <tr><th>Category</th><th>Cost</th></tr>
          ${data.topCategories.map((cat: any) => `
            <tr>
              <td>${cat.name}</td>
              <td>$${cat.cost.toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;
  }

  private generateMonthlyHtml(data: any): string {
    return `
      <div style="padding: 20px;">
        <h2 style="color: #333; margin-top: 0;">Monthly Report - ${data.month}</h2>
        
        <div style="display: flex; justify-content: space-around; margin: 30px 0;">
          <div class="stat">
            <div class="stat-value">$${data.summary.totalCost}</div>
            <div class="stat-label">Total Cost</div>
          </div>
          <div class="stat">
            <div class="stat-value">${data.summary.totalQuantity} kg</div>
            <div class="stat-label">Total Waste</div>
          </div>
          <div class="stat">
            <div class="stat-value">$${data.summary.avgPerRecord}</div>
            <div class="stat-label">Avg/Record</div>
          </div>
        </div>

        <h3 style="color: #333;">Top 10 Ingredients</h3>
        <table>
          <tr><th>Ingredient</th><th>Cost</th></tr>
          ${data.topIngredients.map((ing: any) => `
            <tr>
              <td>${ing.name}</td>
              <td>$${ing.cost.toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;
  }
}
