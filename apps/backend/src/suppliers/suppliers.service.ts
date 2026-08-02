import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { ListSuppliersDto } from './dto/list-suppliers.dto';

@Injectable()
export class SuppliersService {
  constructor(private db: DatabaseService) {}

  async create(organizationId: string, createSupplierDto: CreateSupplierDto) {
    const existing = await this.db.supplier.findFirst({
      where: {
        organizationId,
        name: createSupplierDto.name,
      },
    });

    if (existing) {
      throw new ConflictException('Supplier already exists');
    }

    return this.db.supplier.create({
      data: {
        organizationId,
        ...createSupplierDto,
      },
    });
  }

  async list(organizationId: string, listSuppliersDto: ListSuppliersDto) {
    const {
      skip = 0,
      take = 20,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
    } = listSuppliersDto;

    const where: any = { organizationId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [suppliers, total] = await Promise.all([
      this.db.supplier.findMany({
        where,
        include: {
          _count: {
            select: {
              ingredients: true,
              purchases: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder.toLowerCase(),
        },
        skip,
        take,
      }),
      this.db.supplier.count({ where }),
    ]);

    return {
      data: suppliers,
      pagination: {
        total,
        skip,
        take,
        pages: Math.ceil(total / take),
      },
    };
  }

  async findById(organizationId: string, id: string) {
    const supplier = await this.db.supplier.findFirst({
      where: { id, organizationId },
      include: {
        ingredients: {
          select: {
            id: true,
            name: true,
            costPerUnit: true,
          },
        },
        purchases: {
          include: {
            ingredient: true,
          },
          orderBy: {
            purchaseDate: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            ingredients: true,
            purchases: true,
          },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return supplier;
  }

  async update(organizationId: string, id: string, updateSupplierDto: UpdateSupplierDto) {
    await this.findById(organizationId, id);

    return this.db.supplier.update({
      where: { id },
      data: updateSupplierDto,
    });
  }

  async delete(organizationId: string, id: string) {
    await this.findById(organizationId, id);

    // Check if supplier has ingredients
    const ingredientCount = await this.db.ingredient.count({
      where: { supplierId: id },
    });

    if (ingredientCount > 0) {
      throw new ConflictException(
        'Cannot delete supplier with linked ingredients',
      );
    }

    return this.db.supplier.delete({
      where: { id },
    });
  }

  async getSupplierPerformance(organizationId: string, supplierId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get purchases
    const purchases = await this.db.purchase.findMany({
      where: {
        organizationId,
        supplierId,
        purchaseDate: { gte: startDate },
      },
      include: {
        ingredient: true,
      },
    });

    // Get waste records from this supplier
    const wasteRecords = await this.db.wasteRecord.findMany({
      where: {
        organizationId,
        supplierId,
        createdAt: { gte: startDate },
        status: 'APPROVED',
      },
    });

    // Calculate metrics
    const totalPurchaseCost = purchases.reduce((sum, p) => sum + p.totalCost, 0);
    const totalPurchasedQuantity = purchases.reduce((sum, p) => sum + p.quantity, 0);
    const totalWastedCost = wasteRecords.reduce((sum, r) => sum + r.costImpact, 0);
    const totalWastedQuantity = wasteRecords.reduce((sum, r) => sum + r.quantity, 0);

    const wastePercentage = totalPurchaseCost > 0 ? (totalWastedCost / totalPurchaseCost) * 100 : 0;

    return {
      supplierId,
      period: `Last ${days} days`,
      metrics: {
        purchases: purchases.length,
        totalPurchasedQuantity,
        totalPurchaseCost,
        wasteRecords: wasteRecords.length,
        totalWastedQuantity,
        totalWastedCost,
        wastePercentage,
      },
      recentPurchases: purchases.slice(0, 5),
      recentWaste: wasteRecords.slice(0, 5),
    };
  }

  async getSupplierComparison(organizationId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const suppliers = await this.db.supplier.findMany({
      where: { organizationId },
    });

    const comparison = await Promise.all(
      suppliers.map(async (supplier) => {
        const purchases = await this.db.purchase.findMany({
          where: {
            supplierId: supplier.id,
            organizationId,
            purchaseDate: { gte: startDate },
          },
        });

        const waste = await this.db.wasteRecord.findMany({
          where: {
            supplierId: supplier.id,
            organizationId,
            createdAt: { gte: startDate },
            status: 'APPROVED',
          },
        });

        const totalPurchaseCost = purchases.reduce((sum, p) => sum + p.totalCost, 0);
        const totalWastedCost = waste.reduce((sum, w) => sum + w.costImpact, 0);
        const wastePercentage = totalPurchaseCost > 0 ? (totalWastedCost / totalPurchaseCost) * 100 : 0;

        return {
          supplierId: supplier.id,
          supplierName: supplier.name,
          rating: supplier.rating,
          qualityScore: supplier.qualityScore,
          wasteRate: supplier.wasteRate,
          totalPurchaseCost,
          totalWastedCost,
          wastePercentage,
          purchaseCount: purchases.length,
        };
      }),
    );

    return comparison.sort((a, b) => b.totalPurchaseCost - a.totalPurchaseCost);
  }

  async updateSupplierMetrics(organizationId: string, supplierId: string) {
    const supplier = await this.findById(organizationId, supplierId);

    // Calculate metrics from last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const purchases = await this.db.purchase.findMany({
      where: {
        supplierId,
        organizationId,
        purchaseDate: { gte: ninetyDaysAgo },
      },
    });

    const waste = await this.db.wasteRecord.findMany({
      where: {
        supplierId,
        organizationId,
        createdAt: { gte: ninetyDaysAgo },
        status: 'APPROVED',
      },
    });

    const totalPurchaseCost = purchases.reduce((sum, p) => sum + p.totalCost, 0);
    const totalWastedCost = waste.reduce((sum, w) => sum + w.costImpact, 0);
    const wasteRate = totalPurchaseCost > 0 ? (totalWastedCost / totalPurchaseCost) * 100 : 0;

    return this.db.supplier.update({
      where: { id: supplierId },
      data: {
        wasteRate,
      },
    });
  }
}
