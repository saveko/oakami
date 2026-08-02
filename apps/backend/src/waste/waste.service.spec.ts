import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WasteService } from './waste.service';
import { DatabaseService } from '@/database/database.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { CreateWasteRecordDto } from './dto/create-waste-record.dto';

describe('WasteService', () => {
  let service: WasteService;
  let db: DatabaseService;
  let notificationsService: NotificationsService;

  const mockOrganizationId = 'org-123';
  const mockUserId = 'user-456';
  const mockIngredientId = 'ingredient-789';
  const mockCategoryId = 'category-101';

  const mockIngredient = {
    id: mockIngredientId,
    organizationId: mockOrganizationId,
    name: 'Tomato',
    unit: 'kg',
    costPerUnit: 2.5,
    category: null,
  };

  const mockCategory = {
    id: mockCategoryId,
    organizationId: mockOrganizationId,
    name: 'Produce',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WasteService,
        {
          provide: DatabaseService,
          useValue: {
            ingredient: {
              findFirst: jest.fn(),
            },
            wasteCategory: {
              findFirst: jest.fn(),
            },
            wasteRecord: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            onWasteRecordCreated: jest.fn(),
            onWasteRecordApproved: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WasteService>(WasteService);
    db = module.get<DatabaseService>(DatabaseService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  describe('create', () => {
    it('should create a waste record with valid data', async () => {
      const createDto: CreateWasteRecordDto = {
        ingredientId: mockIngredientId,
        categoryId: mockCategoryId,
        quantity: 10,
        unit: 'kg',
        costImpact: 25,
        notes: 'Expired tomatoes',
      };

      const expectedRecord = {
        id: 'waste-123',
        organizationId: mockOrganizationId,
        ingredientId: mockIngredientId,
        categoryId: mockCategoryId,
        quantity: 10,
        unit: 'kg',
        costImpact: 25,
        percentageWaste: 100,
        recordedById: mockUserId,
        status: 'PENDING',
        notes: 'Expired tomatoes',
        createdAt: new Date(),
        ingredient: mockIngredient,
        category: mockCategory,
        wasteReason: null,
        recordedBy: {
          id: mockUserId,
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      jest.spyOn(db.ingredient, 'findFirst').mockResolvedValue(mockIngredient);
      jest.spyOn(db.wasteCategory, 'findFirst').mockResolvedValue(mockCategory);
      jest.spyOn(db.wasteRecord, 'create').mockResolvedValue(expectedRecord);
      jest.spyOn(notificationsService, 'onWasteRecordCreated').mockResolvedValue(null);

      const result = await service.create(mockOrganizationId, mockUserId, createDto);

      expect(result).toEqual(expectedRecord);
      expect(db.wasteRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: mockOrganizationId,
          ingredientId: mockIngredientId,
          status: 'PENDING',
          recordedById: mockUserId,
        }),
        include: expect.any(Object),
      });
      expect(notificationsService.onWasteRecordCreated).toHaveBeenCalledWith(
        mockOrganizationId,
        expectedRecord,
      );
    });

    it('should throw NotFoundException for invalid ingredient', async () => {
      const createDto: CreateWasteRecordDto = {
        ingredientId: 'invalid-id',
        categoryId: mockCategoryId,
        quantity: 10,
        unit: 'kg',
        costImpact: 25,
      };

      jest.spyOn(db.ingredient, 'findFirst').mockResolvedValue(null);

      await expect(
        service.create(mockOrganizationId, mockUserId, createDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for invalid category', async () => {
      const createDto: CreateWasteRecordDto = {
        ingredientId: mockIngredientId,
        categoryId: 'invalid-id',
        quantity: 10,
        unit: 'kg',
        costImpact: 25,
      };

      jest.spyOn(db.ingredient, 'findFirst').mockResolvedValue(mockIngredient);
      jest.spyOn(db.wasteCategory, 'findFirst').mockResolvedValue(null);

      await expect(
        service.create(mockOrganizationId, mockUserId, createDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should calculate percentageWaste correctly', async () => {
      const createDto: CreateWasteRecordDto = {
        ingredientId: mockIngredientId,
        categoryId: mockCategoryId,
        quantity: 10,
        unit: 'kg',
        costImpact: 25,
      };

      const recordWithPercentage = {
        ...createDto,
        id: 'waste-123',
        organizationId: mockOrganizationId,
        recordedById: mockUserId,
        status: 'PENDING',
        notes: null,
        percentageWaste: 100,
        wasteReasonId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        approvedAt: null,
        approvedBy: null,
        ingredient: mockIngredient,
        category: mockCategory,
        wasteReason: null,
        recordedBy: {
          id: mockUserId,
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      jest.spyOn(db.ingredient, 'findFirst').mockResolvedValue(mockIngredient);
      jest.spyOn(db.wasteCategory, 'findFirst').mockResolvedValue(mockCategory);
      jest.spyOn(db.wasteRecord, 'create').mockResolvedValue(recordWithPercentage);
      jest.spyOn(notificationsService, 'onWasteRecordCreated').mockResolvedValue(null);

      await service.create(mockOrganizationId, mockUserId, createDto);

      const callArgs = (db.wasteRecord.create as jest.Mock).mock.calls[0][0];
      expect(callArgs.data.percentageWaste).toBe(100);
    });
  });

  describe('approve', () => {
    it('should update status to APPROVED and set approvedAt', async () => {
      const recordId = 'waste-123';
      const pendingRecord = {
        id: recordId,
        organizationId: mockOrganizationId,
        status: 'PENDING',
        ingredientId: mockIngredientId,
        categoryId: mockCategoryId,
        quantity: 10,
        unit: 'kg',
        costImpact: 25,
        percentageWaste: 100,
        recordedById: mockUserId,
        createdAt: new Date(),
        ingredient: mockIngredient,
        category: mockCategory,
      };

      const approvedRecord = {
        ...pendingRecord,
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: mockUserId,
      };

      jest.spyOn(db.wasteRecord, 'findFirst').mockResolvedValue(pendingRecord);
      jest.spyOn(db.wasteRecord, 'update').mockResolvedValue(approvedRecord);
      jest.spyOn(notificationsService, 'onWasteRecordApproved').mockResolvedValue(null);

      const result = await service.approve(mockOrganizationId, recordId, mockUserId);

      expect(result.status).toBe('APPROVED');
      expect(result.approvedBy).toBe(mockUserId);
      expect(db.wasteRecord.update).toHaveBeenCalledWith({
        where: { id: recordId },
        data: {
          status: 'APPROVED',
          approvedBy: mockUserId,
          approvedAt: expect.any(Date),
        },
        include: expect.any(Object),
      });
      expect(notificationsService.onWasteRecordApproved).toHaveBeenCalledWith(
        mockOrganizationId,
        approvedRecord,
      );
    });

    it('should throw BadRequestException if record is not PENDING', async () => {
      const recordId = 'waste-123';
      const approvedRecord = {
        id: recordId,
        organizationId: mockOrganizationId,
        status: 'APPROVED',
        ingredientId: mockIngredientId,
      };

      jest.spyOn(db.wasteRecord, 'findFirst').mockResolvedValue(approvedRecord);

      await expect(
        service.approve(mockOrganizationId, recordId, mockUserId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('list', () => {
    it('should return paginated waste records', async () => {
      const mockRecords = [
        {
          id: 'waste-1',
          organizationId: mockOrganizationId,
          status: 'APPROVED',
          quantity: 5,
          costImpact: 12.5,
          ingredient: mockIngredient,
          category: mockCategory,
          wasteReason: null,
          recordedBy: {
            id: mockUserId,
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      ];

      jest.spyOn(db.wasteRecord, 'findMany').mockResolvedValue(mockRecords);
      jest.spyOn(db.wasteRecord, 'count').mockResolvedValue(1);

      const result = await service.list(mockOrganizationId, { skip: 0, take: 20 });

      expect(result.data).toEqual(mockRecords);
      expect(result.pagination.total).toBe(1);
      expect(db.wasteRecord.findMany).toHaveBeenCalled();
    });
  });

  describe('getDashboardStats', () => {
    it('should return correct aggregates for date range', async () => {
      const mockRecords = [
        {
          quantity: 10,
          cost: 25,
          costImpact: 25,
          createdAt: new Date(),
          unit: 'kg',
          category: { id: mockCategoryId, name: 'Produce' },
          ingredient: { id: mockIngredientId, name: 'Tomato' },
        },
        {
          quantity: 5,
          cost: 12.5,
          costImpact: 12.5,
          createdAt: new Date(),
          unit: 'kg',
          category: { id: mockCategoryId, name: 'Produce' },
          ingredient: { id: mockIngredientId, name: 'Tomato' },
        },
      ];

      jest.spyOn(db.wasteRecord, 'findMany').mockResolvedValue(mockRecords as any);

      const result = await service.getDashboardStats(mockOrganizationId, 7);

      expect(result.summary.totalWaste).toBe(37.5);
      expect(result.summary.totalQuantity).toBe(15);
      expect(result.summary.recordCount).toBe(2);
      expect(result.categoryBreakdown.length).toBeGreaterThan(0);
    });

    it('should only include APPROVED records', async () => {
      await service.getDashboardStats(mockOrganizationId, 7);

      const callArgs = (db.wasteRecord.findMany as jest.Mock).mock.calls[0][0];
      expect(callArgs.where.status).toBe('APPROVED');
    });
  });
});
