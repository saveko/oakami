import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { ListInventoryDto } from './dto/list-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    private db: DatabaseService,
    private notificationsService: NotificationsService,
  ) {}

  async create(organizationId: string, createInventoryItemDto: CreateInventoryItemDto) {
    const { ingredientId, batch, ...rest } = createInventoryItemDto;

    const ingredient = await this.db.ingredient.findFirst({
      where: { id: ingredientId, organizationId },
    });

    if (!ingredient) {
      throw new NotFoundException('Ingredient not found');
    }

    // Check for duplicate batch
    if (batch) {
      const existing = await this.db.inventoryItem.findFirst({
        where: {
          organizationId,
          ingredientId,
          batch,
        },
      });

      if (existing) {
        throw new BadRequestException('Batch already exists for this ingredient');
      }
    }

    return this.db.inventoryItem.create({
      data: {
        organizationId,
        ingredientId,
        batch: batch || null,
        ...rest,
      },
      include: {
        ingredient: true,
      },
    });
  }

  async list(organizationId: string, listInventoryDto: ListInventoryDto) {
    const {
      skip = 0,
      take = 20,
      ingredientId,
      categoryId,
      showLow = false,
      showExpiring = false,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
    } = listInventoryDto;

    const where: any = { organizationId };

    if (ingredientId) {
      where.ingredientId = ingredientId;
    }

    if (categoryId) {
      where.ingredient = { categoryId };
    }

    if (showLow) {
      where.quantity = { lte: this.db.raw('min_threshold') };
    }

    if (showExpiring) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      where.expiryDate = {
        lte: thirtyDaysFromNow,
        gte: new Date(),
      };
    }

    const [items, total] = await Promise.all([
      this.db.inventoryItem.findMany({
        where,
        include: {
          ingredient: {
            include: {
              category: true,
              supplier: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder.toLowerCase(),
        },
        skip,
        take,
      }),
      this.db.inventoryItem.count({ where }),
    ]);

    return {
      data: items,
      pagination: {
        total,
        skip,
        take,
        pages: Math.ceil(total / take),
      },
    };
  }

  async findById(organizationId: string, id: string) {
    const item = await this.db.inventoryItem.findFirst({
      where: { id, organizationId },
      include: {
        ingredient: {
          include: {
            category: true,
            supplier: true,
          },
        },
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    return item;
  }

  async update(
    organizationId: string,
    id: string,
    updateInventoryItemDto: UpdateInventoryItemDto,
  ) {
    await this.findById(organizationId, id);

    return this.db.inventoryItem.update({
      where: { id },
      data: updateInventoryItemDto,
      include: {
        ingredient: true,
      },
    });
  }

  async adjustQuantity(
    organizationId: string,
    id: string,
    quantity: number,
    notes?: string,
  ) {
    const item = await this.findById(organizationId, id);

    const newQuantity = item.quantity + quantity;

    if (newQuantity < 0) {
      throw new BadRequestException('Adjustment would result in negative quantity');
    }

    const [updated] = await Promise.all([
      this.db.inventoryItem.update({
        where: { id },
        data: { quantity: newQuantity },
        include: { ingredient: true },
      }),
      this.db.inventoryMovement.create({
        data: {
          organizationId,
          inventoryId: id,
          ingredientId: item.ingredientId,
          movementType: 'ADJUSTMENT',
          quantity: Math.abs(quantity),
          unit: item.ingredient.unit,
          notes: notes || `Manual adjustment: ${quantity > 0 ? '+' : ''}${quantity}`,
        },
      }),
    ]);

    // Check if item is now low stock after adjustment
    if (updated.quantity <= updated.minThreshold) {
      await this.notificationsService.onInventoryLow(organizationId, updated);
    }

    return updated;
  }

  async getExpiringItems(organizationId: string, daysFrom: number = 30) {
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + daysFrom);

    return this.db.inventoryItem.findMany({
      where: {
        organizationId,
        expiryDate: {
          lte: expiryThreshold,
          gte: new Date(),
        },
      },
      include: {
        ingredient: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });
  }

  async getLowStockItems(organizationId: string) {
    return this.db.inventoryItem.findMany({
      where: {
        organizationId,
      },
    }).then((items) =>
      items.filter((item) => item.quantity <= item.minThreshold),
    );
  }

  async getInventorySummary(organizationId: string) {
    const items = await this.db.inventoryItem.findMany({
      where: { organizationId },
      include: {
        ingredient: {
          include: { supplier: true },
        },
      },
    });

    const totalItems = items.length;
    const totalValue = items.reduce(
      (sum, item) => sum + item.quantity * item.ingredient.costPerUnit,
      0,
    );

    const expiringItems = items.filter((item) => {
      if (!item.expiryDate) return false;
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return item.expiryDate <= thirtyDaysFromNow && item.expiryDate >= new Date();
    });

    const lowStockItems = items.filter((item) => item.quantity <= item.minThreshold);

    return {
      totalItems,
      totalValue,
      expiringItems: expiringItems.length,
      lowStockItems: lowStockItems.length,
      expiringItemsList: expiringItems,
      lowStockItemsList: lowStockItems,
    };
  }
}
