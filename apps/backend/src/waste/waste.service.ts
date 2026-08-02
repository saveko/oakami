import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { CreateWasteRecordDto } from './dto/create-waste-record.dto';
import { ListWasteRecordsDto } from './dto/list-waste-records.dto';

@Injectable()
export class WasteService {
  constructor(private db: DatabaseService) {}

  async create(organizationId: string, userId: string, createWasteRecordDto: CreateWasteRecordDto) {
    const { ingredientId, categoryId, wasteReasonId, quantity, unit, costImpact, ...rest } = createWasteRecordDto;

    // Verify ingredient exists
    const ingredient = await this.db.ingredient.findFirst({
      where: {
        id: ingredientId,
        organizationId,
      },
    });

    if (!ingredient) {
      throw new NotFoundException('Ingredient not found');
    }

    // Verify category exists
    const category = await this.db.wasteCategory.findFirst({
      where: {
        id: categoryId,
        organizationId,
      },
    });

    if (!category) {
      throw new NotFoundException('Waste category not found');
    }

    // Calculate percentage waste if available
    let percentageWaste = 0;
    if (ingredient.costPerUnit && quantity > 0) {
      percentageWaste = (costImpact / (ingredient.costPerUnit * quantity)) * 100;
    }

    const wasteRecord = await this.db.wasteRecord.create({
      data: {
        organizationId,
        ingredientId,
        categoryId,
        wasteReasonId: wasteReasonId || null,
        quantity,
        unit,
        costImpact,
        percentageWaste,
        recordedById: userId,
        status: 'PENDING',
        ...rest,
      },
      include: {
        ingredient: true,
        category: true,
        wasteReason: true,
        recordedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return wasteRecord;
  }

  async list(organizationId: string, listWasteRecordsDto: ListWasteRecordsDto) {
    const {
      skip = 0,
      take = 20,
      status,
      categoryId,
      ingredientId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = listWasteRecordsDto;

    const where: any = { organizationId };

    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (ingredientId) where.ingredientId = ingredientId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [records, total] = await Promise.all([
      this.db.wasteRecord.findMany({
        where,
        include: {
          ingredient: true,
          category: true,
          wasteReason: true,
          recordedBy: {
            select: {
              id: true,
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
      this.db.wasteRecord.count({ where }),
    ]);

    return {
      data: records,
      pagination: {
        total,
        skip,
        take,
        pages: Math.ceil(total / take),
      },
    };
  }

  async findById(organizationId: string, id: string) {
    const record = await this.db.wasteRecord.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        ingredient: true,
        category: true,
        wasteReason: true,
        recordedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException('Waste record not found');
    }

    return record;
  }

  async approve(organizationId: string, id: string, userId: string) {
    const record = await this.findById(organizationId, id);

    if (record.status !== 'PENDING') {
      throw new BadRequestException('Record is not pending approval');
    }

    return this.db.wasteRecord.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: userId,
        approvedAt: new Date(),
      },
      include: {
        ingredient: true,
        category: true,
      },
    });
  }

  async reject(organizationId: string, id: string) {
    const record = await this.findById(organizationId, id);

    if (record.status !== 'PENDING') {
      throw new BadRequestException('Record is not pending approval');
    }

    return this.db.wasteRecord.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }

  async getDashboardStats(organizationId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await this.db.wasteRecord.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate },
        status: 'APPROVED',
      },
      include: {
        category: true,
        ingredient: true,
      },
    });

    const totalWaste = records.reduce((sum, r) => sum + r.costImpact, 0);
    const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);
    const recordCount = records.length;

    const categoryBreakdown = records.reduce((acc, r) => {
      const existing = acc.find((c) => c.categoryId === r.categoryId);
      if (existing) {
        existing.cost += r.costImpact;
        existing.quantity += r.quantity;
        existing.count += 1;
      } else {
        acc.push({
          categoryId: r.categoryId,
          categoryName: r.category.name,
          cost: r.costImpact,
          quantity: r.quantity,
          count: 1,
        });
      }
      return acc;
    }, []);

    const topIngredients = records.reduce((acc, r) => {
      const existing = acc.find((i) => i.ingredientId === r.ingredientId);
      if (existing) {
        existing.cost += r.costImpact;
        existing.quantity += r.quantity;
        existing.count += 1;
      } else {
        acc.push({
          ingredientId: r.ingredientId,
          ingredientName: r.ingredient.name,
          cost: r.costImpact,
          quantity: r.quantity,
          count: 1,
        });
      }
      return acc;
    }, []);

    return {
      summary: {
        totalWaste,
        totalQuantity,
        recordCount,
        averageWastePerRecord: recordCount > 0 ? totalWaste / recordCount : 0,
        period: `Last ${days} days`,
      },
      categoryBreakdown: categoryBreakdown.sort((a, b) => b.cost - a.cost),
      topIngredients: topIngredients
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 10),
    };
  }
}
