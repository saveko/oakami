import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { CreateWasteRecordDto } from './dto/create-waste-record.dto';
import { ListWasteRecordsDto } from './dto/list-waste-records.dto';
import { WasteStatus } from '@prisma/client';

@Injectable()
export class WasteService {
  constructor(
    private db: DatabaseService,
    private notificationsService: NotificationsService,
  ) {}

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

    await this.notificationsService.onWasteRecordCreated(organizationId, wasteRecord);

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

    const updated = await this.db.wasteRecord.update({
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

    await this.notificationsService.onWasteRecordApproved(organizationId, updated);

    return updated;
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

    const where = {
      organizationId,
      createdAt: { gte: startDate },
      status: WasteStatus.APPROVED,
    };

    // Get overall totals with single aggregation query
    const [totalStats, categoryStats, ingredientStats] = await Promise.all([
      this.db.wasteRecord.aggregate({
        where,
        _sum: { costImpact: true, quantity: true },
        _count: true,
      }),
      // Get category breakdown with database groupBy
      this.db.wasteRecord.groupBy({
        by: ['categoryId'],
        where,
        _sum: { costImpact: true, quantity: true },
        _count: true,
        orderBy: { _sum: { costImpact: 'desc' } },
      }),
      // Get ingredient breakdown with database groupBy
      this.db.wasteRecord.groupBy({
        by: ['ingredientId'],
        where,
        _sum: { costImpact: true, quantity: true },
        _count: true,
        orderBy: { _sum: { costImpact: 'desc' } },
        take: 10,
      }),
    ]);

    const totalWaste = totalStats._sum?.costImpact || 0;
    const totalQuantity = totalStats._sum?.quantity || 0;
    const recordCount = (totalStats._count as number) || 0;

    // Fetch only category names for matching categories
    const categoryIds = categoryStats.map((c) => c.categoryId);
    const categories = categoryIds.length
      ? await this.db.wasteCategory.findMany({
          where: { id: { in: categoryIds }, organizationId },
          select: { id: true, name: true },
        })
      : [];

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    const categoryBreakdown = categoryStats.map((c) => ({
      categoryId: c.categoryId,
      categoryName: categoryMap.get(c.categoryId) || 'Unknown',
      cost: c._sum?.costImpact || 0,
      quantity: c._sum?.quantity || 0,
      count: (c._count as number) || 0,
    }));

    // Fetch only ingredient names for matching ingredients
    const ingredientIds = ingredientStats.map((i) => i.ingredientId);
    const ingredients = ingredientIds.length
      ? await this.db.ingredient.findMany({
          where: { id: { in: ingredientIds }, organizationId },
          select: { id: true, name: true },
        })
      : [];

    const ingredientMap = new Map(ingredients.map((i) => [i.id, i.name]));

    const topIngredients = ingredientStats.map((i) => ({
      ingredientId: i.ingredientId,
      ingredientName: ingredientMap.get(i.ingredientId) || 'Unknown',
      cost: i._sum?.costImpact || 0,
      quantity: i._sum?.quantity || 0,
      count: (i._count as number) || 0,
    }));

    return {
      summary: {
        totalWaste,
        totalQuantity,
        recordCount,
        averageWastePerRecord: recordCount > 0 ? totalWaste / recordCount : 0,
        period: `Last ${days} days`,
      },
      categoryBreakdown,
      topIngredients,
    };
  }
}
