import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WasteController } from './waste.controller';
import { WasteService } from './waste.service';
import { WasteStatus } from '@prisma/client';

describe('WasteController', () => {
  let controller: WasteController;
  let wasteService: any;

  const mockOrganizationId = 'org-123';
  const mockUserId = 'user-456';

  const mockWasteRecord = {
    id: 'waste-1',
    organizationId: mockOrganizationId,
    ingredientId: 'ingredient-789',
    categoryId: 'category-101',
    quantity: 10,
    unit: 'kg',
    costImpact: 25.5,
    percentageWaste: 100,
    status: 'APPROVED' as WasteStatus,
    recordedById: mockUserId,
    notes: 'Test waste record',
    createdAt: new Date(),
    updatedAt: new Date(),
    approvedAt: new Date(),
    approvedBy: mockUserId,
    wasteReasonId: null,
    ingredient: {
      id: 'ingredient-789',
      name: 'Tomato',
      unit: 'kg',
      costPerUnit: 2.5,
      categoryId: null,
    },
    category: {
      id: 'category-101',
      name: 'Produce',
    },
    wasteReason: null,
    recordedBy: {
      id: mockUserId,
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
    },
  };

  beforeEach(async () => {
    const mockWasteService = {
      create: jest.fn(),
      list: jest.fn(),
      findById: jest.fn(),
      approve: jest.fn(),
      reject: jest.fn(),
      getDashboardStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WasteController],
      providers: [
        {
          provide: WasteService,
          useValue: mockWasteService,
        },
      ],
    }).compile();

    controller = module.get<WasteController>(WasteController);
    wasteService = module.get<any>(WasteService);
  });

  describe('create', () => {
    it('should call service.create with correct parameters', async () => {
      const createDto = {
        ingredientId: 'ingredient-789',
        categoryId: 'category-101',
        quantity: 10,
        unit: 'kg',
        costImpact: 25.5,
        notes: 'Test waste record',
      };

      const mockRequest = {
        user: { id: mockUserId, organizationId: mockOrganizationId },
      } as any;

      wasteService.create.mockResolvedValue(mockWasteRecord);

      const result = await controller.create(createDto, mockRequest);

      expect(wasteService.create).toHaveBeenCalledWith(mockOrganizationId, mockUserId, createDto);
      expect(result.id).toBe('waste-1');
    });

    it('should handle service errors', async () => {
      const createDto = {
        ingredientId: 'ingredient-invalid',
        categoryId: 'category-101',
        quantity: 10,
        unit: 'kg',
        costImpact: 25.5,
      };

      const mockRequest = {
        user: { id: mockUserId, organizationId: mockOrganizationId },
      } as any;

      wasteService.create.mockRejectedValue(new NotFoundException('Ingredient not found'));

      await expect(controller.create(createDto, mockRequest)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('list', () => {
    it('should call service.list with pagination params', async () => {
      const mockRequest = {
        user: { organizationId: mockOrganizationId },
      } as any;

      const mockResponse = {
        data: [mockWasteRecord],
        pagination: {
          total: 1,
          skip: 0,
          take: 20,
          pages: 1,
        },
      };

      wasteService.list.mockResolvedValue(mockResponse);

      const result = await controller.list({ skip: 0, take: 20 } as any, mockRequest);

      expect(wasteService.list).toHaveBeenCalledWith(mockOrganizationId, {
        skip: 0,
        take: 20,
      });
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should use default pagination if not provided', async () => {
      const mockRequest = {
        user: { organizationId: mockOrganizationId },
      } as any;

      wasteService.list.mockResolvedValue({ data: [], pagination: {} });

      await controller.list({} as any, mockRequest);

      expect(wasteService.list).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should call service.findById with correct id', async () => {
      const mockRequest = {
        user: { organizationId: mockOrganizationId },
      } as any;

      wasteService.findById.mockResolvedValue(mockWasteRecord);

      const result = await controller.findById('waste-1', mockRequest);

      expect(wasteService.findById).toHaveBeenCalledWith(mockOrganizationId, 'waste-1');
      expect(result.id).toBe('waste-1');
    });

    it('should handle not found error', async () => {
      const mockRequest = {
        user: { organizationId: mockOrganizationId },
      } as any;

      wasteService.findById.mockRejectedValue(new NotFoundException('Record not found'));

      await expect(controller.findById('invalid-id', mockRequest)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('approve', () => {
    it('should call service.approve with correct parameters', async () => {
      const mockRequest = {
        user: { id: mockUserId, organizationId: mockOrganizationId },
      } as any;

      const approvedRecord = { ...mockWasteRecord, status: 'APPROVED' as WasteStatus };
      wasteService.approve.mockResolvedValue(approvedRecord);

      const result = await controller.approve('waste-1', mockRequest);

      expect(wasteService.approve).toHaveBeenCalledWith(mockOrganizationId, 'waste-1', mockUserId);
      expect(result.status).toBe('APPROVED');
    });

    it('should handle bad request error', async () => {
      const mockRequest = {
        user: { id: mockUserId, organizationId: mockOrganizationId },
      } as any;

      wasteService.approve.mockRejectedValue(
        new BadRequestException('Record already approved')
      );

      await expect(controller.approve('waste-1', mockRequest)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('reject', () => {
    it('should call service.reject with correct parameters', async () => {
      const mockRequest = {
        user: { organizationId: mockOrganizationId },
      } as any;

      const rejectedRecord = { ...mockWasteRecord, status: 'REJECTED' as WasteStatus };
      wasteService.reject.mockResolvedValue(rejectedRecord);

      const result = await controller.reject('waste-1', mockRequest);

      expect(wasteService.reject).toHaveBeenCalledWith(mockOrganizationId, 'waste-1');
      expect(result.status).toBe('REJECTED');
    });
  });

  describe('getDashboardStats', () => {
    it('should call service.getDashboardStats with correct parameters', async () => {
      const mockRequest = {
        user: { organizationId: mockOrganizationId },
      } as any;

      const mockStats = {
        summary: {
          totalWaste: 250.5,
          totalQuantity: 100,
          recordCount: 10,
          avgCostPerDay: 35.78,
        },
        categoryBreakdown: [
          {
            categoryId: 'category-101',
            categoryName: 'Produce',
            cost: 150.5,
            quantity: 60,
            count: 6,
          },
        ],
      };

      wasteService.getDashboardStats.mockResolvedValue(mockStats);

      const result = await controller.getDashboardStats(mockRequest, 7);

      expect(wasteService.getDashboardStats).toHaveBeenCalledWith(mockOrganizationId, 7);
      expect(result.summary.totalWaste).toBe(250.5);
      expect(result.categoryBreakdown).toHaveLength(1);
    });

    it('should use default period of 7 days', async () => {
      const mockRequest = {
        user: { organizationId: mockOrganizationId },
      } as any;

      wasteService.getDashboardStats.mockResolvedValue({});

      await controller.getDashboardStats(mockRequest, undefined);

      expect(wasteService.getDashboardStats).toHaveBeenCalledWith(mockOrganizationId, undefined);
    });
  });

  describe('Request Context', () => {
    it('should extract organizationId and userId from request', async () => {
      const createDto = {
        ingredientId: 'ingredient-789',
        categoryId: 'category-101',
        quantity: 10,
        unit: 'kg',
        costImpact: 25.5,
      };

      const mockRequest = {
        user: {
          id: 'different-user-id',
          organizationId: 'different-org-id',
        },
      } as any;

      wasteService.create.mockResolvedValue(mockWasteRecord);

      await controller.create(createDto, mockRequest);

      expect(wasteService.create).toHaveBeenCalledWith(
        'different-org-id',
        'different-user-id',
        expect.any(Object)
      );
    });
  });

  describe('Error Handling', () => {
    it('should propagate service validation errors', async () => {
      const mockRequest = {
        user: { id: mockUserId, organizationId: mockOrganizationId },
      } as any;

      const validationError = new BadRequestException('Invalid quantity');
      wasteService.create.mockRejectedValue(validationError);

      await expect(
        controller.create(
          {
            ingredientId: 'ing-1',
            categoryId: 'cat-1',
            quantity: -10,
            unit: 'kg',
            costImpact: 25,
          },
          mockRequest
        )
      ).rejects.toThrow('Invalid quantity');
    });
  });

  describe('Response Format', () => {
    it('should include required fields in create response', async () => {
      const mockRequest = {
        user: { id: mockUserId, organizationId: mockOrganizationId },
      } as any;

      wasteService.create.mockResolvedValue(mockWasteRecord);

      const result = await controller.create(
        {
          ingredientId: 'ing-789',
          categoryId: 'cat-101',
          quantity: 10,
          unit: 'kg',
          costImpact: 25.5,
        },
        mockRequest
      );

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('organizationId');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('createdAt');
    });

    it('should include pagination info in list response', async () => {
      const mockRequest = {
        user: { organizationId: mockOrganizationId },
      } as any;

      const mockResponse = {
        data: [mockWasteRecord],
        pagination: {
          total: 1,
          skip: 0,
          take: 20,
          pages: 1,
        },
      };

      wasteService.list.mockResolvedValue(mockResponse);

      const result = await controller.list({ skip: 0, take: 20 } as any, mockRequest);

      expect(result.pagination).toHaveProperty('total');
      expect(result.pagination).toHaveProperty('skip');
      expect(result.pagination).toHaveProperty('take');
      expect(result.pagination).toHaveProperty('pages');
    });
  });
});
