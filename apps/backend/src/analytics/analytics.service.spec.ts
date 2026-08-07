import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { DatabaseService } from '@/database/database.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let db: DatabaseService;

  const mockOrganizationId = 'org-123';

  beforeEach(async () => {
    const mockQueryRaw = jest.fn().mockResolvedValue([{ count: 0 }]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: DatabaseService,
          useValue: {
            wasteRecord: {
              findMany: jest.fn(),
              count: jest.fn(),
              aggregate: jest.fn(),
              groupBy: jest.fn(),
            },
            inventoryItem: {
              count: jest.fn(),
            },
            wasteCategory: {
              findMany: jest.fn(),
            },
            ingredient: {
              findMany: jest.fn(),
            },
            $queryRaw: mockQueryRaw,
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    db = module.get<DatabaseService>(DatabaseService);
  });

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics for 7-day period', async () => {
      const mockRecords = [
        {
          createdAt: new Date(),
          costImpact: 25.5,
          quantity: 10,
          categoryId: 'cat-1',
        },
      ];

      jest.spyOn(db.wasteRecord, 'findMany' as any).mockResolvedValue(mockRecords as any);
      jest.spyOn(db.wasteRecord, 'aggregate' as any).mockResolvedValue({
        _sum: { costImpact: 25.5, quantity: 10 },
        _count: { _all: 1 },
      } as any);
      jest.spyOn(db.wasteRecord, 'count' as any).mockResolvedValue(1);
      jest.spyOn(db.inventoryItem, 'count' as any).mockResolvedValue(0);
      jest.spyOn(db.wasteRecord, 'groupBy' as any).mockResolvedValue([] as any);

      const result = await service.getDashboardMetrics(mockOrganizationId, 7);

      expect(result.period).toBe('Last 7 days');
      expect(result.metrics.totalWasteCost).toBe(25.5);
      expect(result.metrics.wasteRecordCount).toBe(1);
      expect(result.metrics.averageWastePerRecord).toBe(25.5);
    });

    it('should calculate average waste per record correctly', async () => {
      jest.spyOn(db.wasteRecord, 'findMany' as any).mockResolvedValue([]);
      jest.spyOn(db.wasteRecord, 'aggregate' as any).mockResolvedValue({
        _sum: { costImpact: 100, quantity: 40 },
        _count: { _all: 4 },
      } as any);
      jest.spyOn(db.wasteRecord, 'count' as any).mockResolvedValue(4);
      jest.spyOn(db.inventoryItem, 'count' as any).mockResolvedValue(0);
      jest.spyOn(db.wasteRecord, 'groupBy' as any).mockResolvedValue([] as any);

      const result = await service.getDashboardMetrics(mockOrganizationId, 7);

      expect(result.metrics.averageWastePerRecord).toBe(25); // 100 / 4
    });

    it('should return zero average when no records exist', async () => {
      jest.spyOn(db.wasteRecord, 'findMany' as any).mockResolvedValue([]);
      jest.spyOn(db.wasteRecord, 'aggregate' as any).mockResolvedValue({
        _sum: { costImpact: 0, quantity: 0 },
        _count: { _all: 0 },
      } as any);
      jest.spyOn(db.wasteRecord, 'count' as any).mockResolvedValue(0);
      jest.spyOn(db.inventoryItem, 'count' as any).mockResolvedValue(0);
      jest.spyOn(db.wasteRecord, 'groupBy' as any).mockResolvedValue([] as any);

      const result = await service.getDashboardMetrics(mockOrganizationId, 7);

      expect(result.metrics.averageWastePerRecord).toBe(0);
    });

    it('should include expiring items and low stock alerts', async () => {
      jest.spyOn(db.wasteRecord, 'findMany' as any).mockResolvedValue([]);
      jest.spyOn(db.wasteRecord, 'aggregate' as any).mockResolvedValue({
        _sum: { costImpact: 0, quantity: 0 },
        _count: { _all: 0 },
      } as any);
      jest.spyOn(db.wasteRecord, 'count' as any).mockResolvedValue(0);
      // Mock inventoryItem.count for expiring items
      jest.spyOn(db.inventoryItem, 'count' as any).mockResolvedValue(3);
      // Mock $queryRaw for low stock items
      jest.spyOn(db, '$queryRaw' as any).mockResolvedValue([{ count: 2 }]);
      jest.spyOn(db.wasteRecord, 'groupBy' as any).mockResolvedValue([] as any);

      const result = await service.getDashboardMetrics(mockOrganizationId, 7);

      expect(result.metrics.expiringItemsAlert).toBe(3);
      expect(result.metrics.lowStockAlert).toBe(2);
    });
  });

  describe('getWasteTrendAnalysis', () => {
    it('should group waste records by date', async () => {
      const mockRecords = [
        {
          createdAt: new Date('2026-08-01'),
          costImpact: 25.5,
          quantity: 10,
        },
        {
          createdAt: new Date('2026-08-01'),
          costImpact: 10.0,
          quantity: 5,
        },
        {
          createdAt: new Date('2026-08-02'),
          costImpact: 15.0,
          quantity: 6,
        },
      ];

      jest.spyOn(db.wasteRecord, 'findMany' as any).mockResolvedValue(mockRecords as any);

      const result = await service.getWasteTrendAnalysis(mockOrganizationId, 30);

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2026-08-01');
      expect(result[0].totalCost).toBe(35.5);
      expect(result[0].totalQuantity).toBe(15);
      expect(result[0].recordCount).toBe(2);
      expect(result[1].date).toBe('2026-08-02');
      expect(result[1].totalCost).toBe(15);
    });

    it('should return sorted results by date ascending', async () => {
      const mockRecords = [
        { createdAt: new Date('2026-08-03'), costImpact: 10, quantity: 5 },
        { createdAt: new Date('2026-08-01'), costImpact: 20, quantity: 10 },
        { createdAt: new Date('2026-08-02'), costImpact: 15, quantity: 7 },
      ];

      jest.spyOn(db.wasteRecord, 'findMany' as any).mockResolvedValue(mockRecords as any);

      const result = await service.getWasteTrendAnalysis(mockOrganizationId, 30);

      expect(result[0].date).toBe('2026-08-01');
      expect(result[1].date).toBe('2026-08-02');
      expect(result[2].date).toBe('2026-08-03');
    });

    it('should return empty array when no records exist', async () => {
      jest.spyOn(db.wasteRecord, 'findMany' as any).mockResolvedValue([]);

      const result = await service.getWasteTrendAnalysis(mockOrganizationId, 30);

      expect(result).toEqual([]);
    });
  });

  describe('getCategoryAnalysis', () => {
    it('should aggregate waste by category with percentages', async () => {
      const mockGroupBy = [
        {
          categoryId: 'cat-1',
          _sum: { costImpact: 60, quantity: 30 },
          _count: 6,
        },
        {
          categoryId: 'cat-2',
          _sum: { costImpact: 40, quantity: 20 },
          _count: 4,
        },
      ];

      const mockCategories = [
        { id: 'cat-1', name: 'Produce', color: '#00FF00' },
        { id: 'cat-2', name: 'Dairy', color: '#FFFFFF' },
      ];

      jest.spyOn(db.wasteRecord, 'groupBy' as any).mockResolvedValue(mockGroupBy as any);
      jest.spyOn(db.wasteCategory, 'findMany' as any).mockResolvedValue(mockCategories as any);

      const result = await service.getCategoryAnalysis(mockOrganizationId, 30);

      expect(result).toHaveLength(2);
      expect(result[0].categoryName).toBe('Produce');
      expect(result[0].cost).toBe(60);
      expect(result[0].percentage).toBe(60); // 60 / 100 * 100
      expect(result[1].categoryName).toBe('Dairy');
      expect(result[1].percentage).toBe(40);
    });

    it('should handle unknown category names', async () => {
      const mockGroupBy = [
        {
          categoryId: 'cat-unknown',
          _sum: { costImpact: 50, quantity: 25 },
          _count: 5,
        },
      ];

      jest.spyOn(db.wasteRecord, 'groupBy' as any).mockResolvedValue(mockGroupBy as any);
      jest.spyOn(db.wasteCategory, 'findMany' as any).mockResolvedValue([] as any);

      const result = await service.getCategoryAnalysis(mockOrganizationId, 30);

      expect(result).toHaveLength(1);
      expect(result[0].categoryName).toBe('Unknown');
      expect(result[0].percentage).toBe(100); // Only category, 100%
    });

    it('should calculate zero percentage when total cost is zero', async () => {
      jest.spyOn(db.wasteRecord, 'groupBy' as any).mockResolvedValue([] as any);
      jest.spyOn(db.wasteCategory, 'findMany' as any).mockResolvedValue([] as any);

      const result = await service.getCategoryAnalysis(mockOrganizationId, 30);

      expect(result).toEqual([]);
    });
  });

  describe('getTopWastedIngredients', () => {
    it('should return top wasted ingredients limited by count', async () => {
      const mockGroupBy = [
        { ingredientId: 'ing-1', _sum: { costImpact: 100, quantity: 50 }, _count: 10 },
        { ingredientId: 'ing-2', _sum: { costImpact: 80, quantity: 40 }, _count: 8 },
        { ingredientId: 'ing-3', _sum: { costImpact: 60, quantity: 30 }, _count: 6 },
      ];

      const mockIngredients = [
        { id: 'ing-1', name: 'Tomato', categoryId: 'cat-1' },
        { id: 'ing-2', name: 'Lettuce', categoryId: 'cat-1' },
      ];

      jest.spyOn(db.wasteRecord, 'groupBy' as any).mockResolvedValue(mockGroupBy as any);
      jest.spyOn(db.ingredient, 'findMany' as any).mockResolvedValue(mockIngredients as any);

      const result = await service.getTopWastedIngredients(mockOrganizationId, 30, 2);

      expect(result).toHaveLength(2);
      expect(result[0].ingredientName).toBe('Tomato');
      expect(result[0].cost).toBe(100);
      expect(result[1].ingredientName).toBe('Lettuce');
    });

    it('should handle default limit of 15', async () => {
      const mockGroupBy = Array.from({ length: 20 }, (_, i) => ({
        ingredientId: `ing-${i}`,
        _sum: { costImpact: 100 - i * 5, quantity: 50 },
        _count: 10,
      }));

      jest.spyOn(db.wasteRecord, 'groupBy' as any).mockResolvedValue(mockGroupBy as any);
      jest.spyOn(db.ingredient, 'findMany' as any).mockResolvedValue([] as any);

      const result = await service.getTopWastedIngredients(mockOrganizationId, 30);

      expect(result).toHaveLength(15); // Default limit
    });

    it('should maintain order from database groupBy (cost descending)', async () => {
      // Mock groupBy returns in descending order (higher cost first)
      const mockGroupBy = [
        { ingredientId: 'ing-1', _sum: { costImpact: 100, quantity: 50 }, _count: 10 },
        { ingredientId: 'ing-2', _sum: { costImpact: 50, quantity: 25 }, _count: 5 },
      ];

      const mockIngredients = [
        { id: 'ing-1', name: 'TopIng', categoryId: 'cat' },
        { id: 'ing-2', name: 'SecondIng', categoryId: 'cat' },
      ];

      jest.spyOn(db.wasteRecord, 'groupBy' as any).mockResolvedValue(mockGroupBy as any);
      jest.spyOn(db.ingredient, 'findMany' as any).mockResolvedValue(mockIngredients as any);

      const result = await service.getTopWastedIngredients(mockOrganizationId, 30, 5);

      // Results should match the database order
      expect(result[0].cost).toBe(100);
      expect(result[0].ingredientName).toBe('TopIng');
      expect(result[1].cost).toBe(50);
      expect(result[1].ingredientName).toBe('SecondIng');
    });
  });

  describe('getSupplierWasteAnalysis', () => {
    it('should aggregate waste by supplier', async () => {
      const mockRecords = [
        {
          costImpact: 50,
          quantity: 25,
          ingredient: {
            supplierId: 'sup-1',
            supplier: { id: 'sup-1', name: 'Supplier A' },
          },
        },
        {
          costImpact: 30,
          quantity: 15,
          ingredient: {
            supplierId: 'sup-1',
            supplier: { id: 'sup-1', name: 'Supplier A' },
          },
        },
        {
          costImpact: 40,
          quantity: 20,
          ingredient: {
            supplierId: 'sup-2',
            supplier: { id: 'sup-2', name: 'Supplier B' },
          },
        },
      ];

      jest.spyOn(db.wasteRecord, 'findMany' as any).mockResolvedValue(mockRecords as any);

      const result = await service.getSupplierWasteAnalysis(mockOrganizationId, 30);

      expect(result).toHaveLength(2);
      expect(result[0].supplierName).toBe('Supplier A');
      expect(result[0].wastedCost).toBe(80);
      expect(result[0].wastedQuantity).toBe(40);
      expect(result[0].recordCount).toBe(2);
    });

    it('should sort suppliers by wasted cost descending', async () => {
      const mockRecords = [
        {
          costImpact: 20,
          quantity: 10,
          ingredient: { supplierId: 'sup-1', supplier: { id: 'sup-1', name: 'A' } },
        },
        {
          costImpact: 50,
          quantity: 25,
          ingredient: { supplierId: 'sup-2', supplier: { id: 'sup-2', name: 'B' } },
        },
      ];

      jest.spyOn(db.wasteRecord, 'findMany' as any).mockResolvedValue(mockRecords as any);

      const result = await service.getSupplierWasteAnalysis(mockOrganizationId, 30);

      expect(result[0].wastedCost).toBeGreaterThanOrEqual(result[1].wastedCost);
    });

    it('should filter out records without supplier', async () => {
      const mockRecords = [
        {
          costImpact: 50,
          quantity: 25,
          ingredient: { supplierId: null, supplier: null },
        },
        {
          costImpact: 30,
          quantity: 15,
          ingredient: { supplierId: 'sup-1', supplier: { id: 'sup-1', name: 'Supplier A' } },
        },
      ];

      jest.spyOn(db.wasteRecord, 'findMany' as any).mockResolvedValue(mockRecords as any);

      const result = await service.getSupplierWasteAnalysis(mockOrganizationId, 30);

      expect(result).toHaveLength(1);
      expect(result[0].supplierName).toBe('Supplier A');
    });
  });

  describe('getCostAnalysis', () => {
    it('should return total and average cost metrics', async () => {
      jest.spyOn(db.wasteRecord, 'aggregate' as any).mockResolvedValue({
        _sum: { costImpact: 300, quantity: 150 },
        _count: { _all: 6 },
      } as any);

      const result = await service.getCostAnalysis(mockOrganizationId, 30);

      expect(result.summary.totalWasteCost).toBe(300);
      expect(result.summary.totalQuantity).toBe(150);
      expect(result.summary.recordCount).toBe(6);
      expect(result.summary.avgCostPerRecord).toBe(50); // 300 / 6
      expect(result.summary.avgCostPerDay).toBe(10); // 300 / 30
    });

    it('should handle zero records', async () => {
      jest.spyOn(db.wasteRecord, 'aggregate' as any).mockResolvedValue({
        _sum: { costImpact: null, quantity: null },
        _count: { _all: 0 },
      } as any);

      const result = await service.getCostAnalysis(mockOrganizationId, 30);

      expect(result.summary.totalWasteCost).toBe(0);
      expect(result.summary.avgCostPerRecord).toBe(0);
      expect(result.summary.avgCostPerDay).toBe(0);
    });

    it('should calculate average cost per day correctly', async () => {
      jest.spyOn(db.wasteRecord, 'aggregate' as any).mockResolvedValue({
        _sum: { costImpact: 150, quantity: 75 },
        _count: { _all: 3 },
      } as any);

      const result = await service.getCostAnalysis(mockOrganizationId, 15);

      expect(result.summary.avgCostPerDay).toBe(10); // 150 / 15
    });
  });

  describe('getHeatmapData', () => {
    it('should create heatmap with day and hour dimensions', async () => {
      // Create dates with specific times: Sunday + Monday data
      // new Date(2026, 7, 2) is Sunday, August 2, 2026
      const sundayDate = new Date(2026, 7, 2, 10, 0, 0); // Sunday hour 10
      const mondayDate = new Date(2026, 7, 3, 14, 0, 0); // Monday hour 14
      const tuesdayDate = new Date(2026, 7, 4, 9, 0, 0); // Tuesday hour 9

      const mockRecords = [
        { createdAt: sundayDate, costImpact: 25, quantity: 10 },
        { createdAt: mondayDate, costImpact: 15, quantity: 8 },
        { createdAt: tuesdayDate, costImpact: 20, quantity: 5 },
      ];

      jest.spyOn(db.wasteRecord, 'findMany' as any).mockResolvedValue(mockRecords as any);

      const result = await service.getHeatmapData(mockOrganizationId, 'cost');

      expect(result).toHaveLength(7); // 7 days
      expect(result[0].day).toBe('Sunday');
      expect(result[0].data).toHaveLength(24); // 24 hours
      expect(result[0].data[10].value).toBe(25); // Sunday hour 10
      expect(result[1].data[14].value).toBe(15); // Monday hour 14
      expect(result[2].data[9].value).toBe(20); // Tuesday hour 9
    });

    it('should support quantity metric', async () => {
      const sundayDate = new Date(2026, 7, 2, 10, 0, 0);
      const mockRecords = [{ createdAt: sundayDate, costImpact: 25, quantity: 10 }];

      jest.spyOn(db.wasteRecord, 'findMany' as any).mockResolvedValue(mockRecords as any);

      const result = await service.getHeatmapData(mockOrganizationId, 'quantity');

      expect(result[0].data[10].value).toBe(10); // Should be quantity, not cost
    });

    it('should aggregate multiple records for same day/hour', async () => {
      const sundayDate1 = new Date(2026, 7, 2, 10, 15, 0);
      const sundayDate2 = new Date(2026, 7, 2, 10, 45, 0);

      const mockRecords = [
        { createdAt: sundayDate1, costImpact: 15, quantity: 8 },
        { createdAt: sundayDate2, costImpact: 20, quantity: 12 },
      ];

      jest.spyOn(db.wasteRecord, 'findMany' as any).mockResolvedValue(mockRecords as any);

      const result = await service.getHeatmapData(mockOrganizationId, 'cost');

      expect(result[0].data[10].value).toBe(35); // 15 + 20
    });

    it('should return zero values for empty days/hours', async () => {
      jest.spyOn(db.wasteRecord, 'findMany' as any).mockResolvedValue([]);

      const result = await service.getHeatmapData(mockOrganizationId, 'cost');

      expect(result).toHaveLength(7);
      result.forEach((day) => {
        day.data.forEach((hour) => {
          expect(hour.value).toBe(0);
        });
      });
    });
  });

  describe('error handling', () => {
    it('should only include APPROVED records in getDashboardMetrics', async () => {
      jest.spyOn(db.wasteRecord, 'findMany' as any).mockResolvedValue([]);
      jest.spyOn(db.wasteRecord, 'aggregate' as any).mockResolvedValue({
        _sum: { costImpact: 0 },
        _count: { _all: 0 },
      } as any);
      jest.spyOn(db.wasteRecord, 'count' as any).mockResolvedValue(0);
      jest.spyOn(db.inventoryItem, 'count' as any).mockResolvedValue(0);
      jest.spyOn(db.wasteRecord, 'groupBy' as any).mockResolvedValue([] as any);

      await service.getDashboardMetrics(mockOrganizationId, 7);

      const aggregateCall = (db.wasteRecord.aggregate as jest.Mock).mock.calls[0][0];
      expect(aggregateCall.where.status).toBe('APPROVED');
    });

    it('should only include APPROVED records in getCategoryAnalysis', async () => {
      jest.spyOn(db.wasteRecord, 'groupBy' as any).mockResolvedValue([] as any);
      jest.spyOn(db.wasteCategory, 'findMany' as any).mockResolvedValue([] as any);

      await service.getCategoryAnalysis(mockOrganizationId, 30);

      const groupByCall = (db.wasteRecord.groupBy as jest.Mock).mock.calls[0][0];
      expect(groupByCall.where.status).toBe('APPROVED');
    });
  });
});
