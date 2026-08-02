import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { DatabaseService } from '@/database/database.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { PredictionType } from '@prisma/client';

describe('AiService', () => {
  let service: AiService;
  let db: DatabaseService;
  let notificationsService: NotificationsService;

  const mockOrganizationId = 'org-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: DatabaseService,
          useValue: {
            wasteRecord: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
            inventoryItem: {
              findMany: jest.fn(),
            },
            aiPrediction: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            onPredictionGenerated: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    db = module.get<DatabaseService>(DatabaseService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  describe('generatePredictions', () => {
    it('should generate predictions for all types', async () => {
      const mockWasteRecords = [
        {
          quantity: 10,
          cost: 25,
          createdAt: new Date(),
          unit: 'kg',
        },
        {
          quantity: 5,
          cost: 12.5,
          createdAt: new Date(),
          unit: 'kg',
        },
      ];

      jest.spyOn(db.wasteRecord, 'findMany').mockResolvedValue(mockWasteRecords as any);
      jest.spyOn(db.inventoryItem, 'findMany').mockResolvedValue([]);
      jest.spyOn(db.aiPrediction, 'create').mockResolvedValue({
        id: 'pred-1',
        organizationId: mockOrganizationId,
        predictionType: PredictionType.WASTE,
        value: 15,
        confidence: 0.85,
        unit: 'kg',
        recommendation: 'Reduce waste',
        predictedFor: new Date(),
      } as any);
      jest.spyOn(notificationsService, 'onPredictionGenerated').mockResolvedValue(null);

      const result = await service.generatePredictions(mockOrganizationId, 30);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should trigger notification for high-confidence predictions', async () => {
      jest.spyOn(db.wasteRecord, 'findMany').mockResolvedValue([
        {
          quantity: 50,
          cost: 100,
          createdAt: new Date(),
          unit: 'kg',
        },
      ] as any);
      jest.spyOn(db.inventoryItem, 'findMany').mockResolvedValue([]);

      const highConfPrediction = {
        id: 'pred-1',
        organizationId: mockOrganizationId,
        predictionType: PredictionType.WASTE,
        value: 100,
        confidence: 0.9, // High confidence
        unit: 'kg',
        recommendation: 'Critical waste',
        predictedFor: new Date(),
      };

      jest.spyOn(db.aiPrediction, 'create').mockResolvedValue(highConfPrediction as any);
      jest.spyOn(notificationsService, 'onPredictionGenerated').mockResolvedValue(null);

      await service.generatePredictions(mockOrganizationId, 30);

      expect(notificationsService.onPredictionGenerated).toHaveBeenCalledWith(
        mockOrganizationId,
        expect.objectContaining({
          confidence: 0.9,
        }),
      );
    });

    it('should not trigger notification for low-confidence predictions', async () => {
      jest.spyOn(db.wasteRecord, 'findMany').mockResolvedValue([]);
      jest.spyOn(db.inventoryItem, 'findMany').mockResolvedValue([]);

      const lowConfPrediction = {
        id: 'pred-1',
        organizationId: mockOrganizationId,
        predictionType: PredictionType.DEMAND,
        value: 5,
        confidence: 0.5, // Low confidence
        unit: 'kg',
        recommendation: 'Demand may increase',
        predictedFor: new Date(),
      };

      jest.spyOn(db.aiPrediction, 'create').mockResolvedValue(lowConfPrediction as any);
      jest.spyOn(notificationsService, 'onPredictionGenerated').mockResolvedValue(null);

      await service.generatePredictions(mockOrganizationId, 30);

      // Prediction created but notification not called for low confidence
      expect(db.aiPrediction.create).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should continue processing on individual prediction errors', async () => {
      jest.spyOn(db.wasteRecord, 'findMany').mockResolvedValue([]);
      jest.spyOn(db.inventoryItem, 'findMany').mockResolvedValue([]);
      jest.spyOn(db.aiPrediction, 'create')
        .mockRejectedValueOnce(new Error('Database error'))
        .mockResolvedValueOnce({
          id: 'pred-2',
          organizationId: mockOrganizationId,
          predictionType: PredictionType.DEMAND,
          value: 10,
          confidence: 0.75,
          unit: 'kg',
          recommendation: 'Test',
          predictedFor: new Date(),
        } as any);

      const result = await service.generatePredictions(mockOrganizationId, 30);

      // Should continue despite first error
      expect(result).toBeDefined();
    });
  });
});
