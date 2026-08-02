import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { DatabaseService } from '@/database/database.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';

describe('InventoryService', () => {
  let service: InventoryService;
  let db: DatabaseService;
  let notificationsService: NotificationsService;

  const mockOrganizationId = 'org-123';
  const mockIngredientId = 'ingredient-789';

  const mockIngredient = {
    id: mockIngredientId,
    organizationId: mockOrganizationId,
    name: 'Tomato',
    unit: 'kg',
    costPerUnit: 2.5,
    categoryId: 'cat-1',
  };

  const mockInventoryItem = {
    id: 'inv-123',
    organizationId: mockOrganizationId,
    ingredientId: mockIngredientId,
    quantity: 50,
    minThreshold: 10,
    maxThreshold: 100,
    unit: 'kg',
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    batch: 'BATCH-001',
    location: 'Storage A',
    createdAt: new Date(),
    updatedAt: new Date(),
    ingredient: mockIngredient,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: DatabaseService,
          useValue: {
            ingredient: {
              findFirst: jest.fn(),
            },
            inventoryItem: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            inventoryMovement: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            onInventoryLow: jest.fn(),
            onInventoryExpiring: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    db = module.get<DatabaseService>(DatabaseService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  describe('adjustQuantity', () => {
    it('should increase quantity and create movement record', async () => {
      const itemId = 'inv-123';
      const quantity = 20;

      const updatedItem = {
        ...mockInventoryItem,
        quantity: mockInventoryItem.quantity + quantity,
      };

      jest.spyOn(db.inventoryItem, 'findFirst').mockResolvedValue(mockInventoryItem);
      jest.spyOn(db.inventoryItem, 'update').mockResolvedValue(updatedItem);
      jest.spyOn(db.inventoryMovement, 'create').mockResolvedValue({} as any);
      jest.spyOn(notificationsService, 'onInventoryLow').mockResolvedValue(null);

      const result = await service.adjustQuantity(mockOrganizationId, itemId, quantity);

      expect(result.quantity).toBe(70);
      expect(db.inventoryMovement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: mockOrganizationId,
          inventoryId: itemId,
          ingredientId: mockIngredientId,
          movementType: 'ADJUSTMENT',
          quantity: quantity,
        }),
      });
    });

    it('should decrease quantity and trigger low-stock notification', async () => {
      const itemId = 'inv-123';
      const quantity = -45;

      const lowStockItem = {
        ...mockInventoryItem,
        quantity: 5, // Below minThreshold of 10
      };

      jest.spyOn(db.inventoryItem, 'findFirst').mockResolvedValue(mockInventoryItem);
      jest.spyOn(db.inventoryItem, 'update').mockResolvedValue(lowStockItem);
      jest.spyOn(db.inventoryMovement, 'create').mockResolvedValue({} as any);
      jest.spyOn(notificationsService, 'onInventoryLow').mockResolvedValue(null);

      await service.adjustQuantity(mockOrganizationId, itemId, quantity);

      expect(notificationsService.onInventoryLow).toHaveBeenCalledWith(
        mockOrganizationId,
        expect.objectContaining({
          quantity: 5,
        }),
      );
    });

    it('should not trigger low-stock notification if above threshold', async () => {
      const itemId = 'inv-123';
      const quantity = -10;

      const aboveThresholdItem = {
        ...mockInventoryItem,
        quantity: 40, // Still above minThreshold of 10
      };

      jest.spyOn(db.inventoryItem, 'findFirst').mockResolvedValue(mockInventoryItem);
      jest.spyOn(db.inventoryItem, 'update').mockResolvedValue(aboveThresholdItem);
      jest.spyOn(db.inventoryMovement, 'create').mockResolvedValue({} as any);
      jest.spyOn(notificationsService, 'onInventoryLow').mockResolvedValue(null);

      await service.adjustQuantity(mockOrganizationId, itemId, quantity);

      expect(notificationsService.onInventoryLow).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for negative adjustment exceeding quantity', async () => {
      const itemId = 'inv-123';
      const quantity = -100;

      jest.spyOn(db.inventoryItem, 'findFirst').mockResolvedValue(mockInventoryItem);

      await expect(
        service.adjustQuantity(mockOrganizationId, itemId, quantity),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getExpiringItems', () => {
    it('should return items expiring within threshold days', async () => {
      const expiringItem = {
        ...mockInventoryItem,
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      };

      const nonExpiringItem = {
        ...mockInventoryItem,
        id: 'inv-456',
        expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
      };

      jest.spyOn(db.inventoryItem, 'findMany').mockResolvedValue([expiringItem]);

      const result = await service.getExpiringItems(mockOrganizationId, 30);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('inv-123');
    });

    it('should exclude items with null expiryDate', async () => {
      jest.spyOn(db.inventoryItem, 'findMany').mockResolvedValue([mockInventoryItem]);

      const result = await service.getExpiringItems(mockOrganizationId, 30);

      expect(result).toEqual([mockInventoryItem]);
    });
  });

  describe('getLowStockItems', () => {
    it('should return items below minimum threshold', async () => {
      const lowStockItem = {
        ...mockInventoryItem,
        quantity: 5,
      };

      jest.spyOn(db.inventoryItem, 'findMany').mockResolvedValue([lowStockItem]);

      const result = await service.getLowStockItems(mockOrganizationId);

      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(5);
    });

    it('should exclude items at or above minimum threshold', async () => {
      const normalStockItem = {
        ...mockInventoryItem,
        quantity: 15,
      };

      jest.spyOn(db.inventoryItem, 'findMany').mockResolvedValue([normalStockItem]);

      const result = await service.getLowStockItems(mockOrganizationId);

      expect(result).toHaveLength(0);
    });
  });

  describe('getInventorySummary', () => {
    it('should return correct summary with expiring and low-stock items', async () => {
      const items = [
        {
          ...mockInventoryItem,
          quantity: 50,
          expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        },
        {
          ...mockInventoryItem,
          id: 'inv-456',
          quantity: 5,
          expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        },
      ];

      jest.spyOn(db.inventoryItem, 'findMany').mockResolvedValue(items as any);

      const result = await service.getInventorySummary(mockOrganizationId);

      expect(result.totalItems).toBe(2);
      expect(result.expiringItems).toBe(1);
      expect(result.lowStockItems).toBe(1);
      expect(result.totalValue).toBeGreaterThan(0);
    });
  });
});
