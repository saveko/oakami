import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService, NotificationType, NotificationSeverity } from './notifications.service';
import { DatabaseService } from '@/database/database.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let db: DatabaseService;

  const mockOrganizationId = 'org-123';

  const mockOrganizationSettings = {
    id: 'org-123',
    enableNotifications: true,
    enableAIPredictions: true,
    wasteAlertThreshold: 100,
    expiryAlertDays: 3,
    inventoryLowThreshold: 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: DatabaseService,
          useValue: {
            organization: {
              findUnique: jest.fn(),
            },
            notification: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    db = module.get<DatabaseService>(DatabaseService);
  });

  describe('createNotification', () => {
    it('should create notification when enableNotifications is true', async () => {
      const mockOrg = {
        id: mockOrganizationId,
        settings: mockOrganizationSettings,
      };

      jest.spyOn(db.organization, 'findUnique').mockResolvedValue(mockOrg as any);
      jest.spyOn(db.notification, 'create').mockResolvedValue({
        id: 'notif-1',
        organizationId: mockOrganizationId,
        type: NotificationType.WASTE_CREATED,
        title: 'New Waste Record',
        message: 'Waste recorded',
        severity: NotificationSeverity.INFO,
        isRead: false,
      } as any);

      const result = await service.createNotification({
        organizationId: mockOrganizationId,
        type: NotificationType.WASTE_CREATED,
        title: 'New Waste Record',
        message: 'Waste recorded',
      });

      expect(result).toBeDefined();
      expect(result?.organizationId).toBe(mockOrganizationId);
      expect(db.notification.create).toHaveBeenCalled();
    });

    it('should skip creation when enableNotifications is false', async () => {
      const mockOrg = {
        id: mockOrganizationId,
        settings: { ...mockOrganizationSettings, enableNotifications: false },
      };

      jest.spyOn(db.organization, 'findUnique').mockResolvedValue(mockOrg as any);

      const result = await service.createNotification({
        organizationId: mockOrganizationId,
        type: NotificationType.WASTE_CREATED,
        title: 'New Waste Record',
        message: 'Waste recorded',
      });

      expect(result).toBeNull();
      expect(db.notification.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid organization', async () => {
      jest.spyOn(db.organization, 'findUnique').mockResolvedValue(null);

      await expect(
        service.createNotification({
          organizationId: 'invalid-org',
          type: NotificationType.WASTE_CREATED,
          title: 'Test',
          message: 'Test',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read with timestamp', async () => {
      const notificationId = 'notif-1';
      const mockNotification = {
        id: notificationId,
        organizationId: mockOrganizationId,
        isRead: false,
      };

      jest.spyOn(db.notification, 'findUnique').mockResolvedValue(mockNotification as any);
      jest.spyOn(db.notification, 'update').mockResolvedValue({
        ...mockNotification,
        isRead: true,
        readAt: new Date(),
      } as any);

      const result = await service.markAsRead(mockOrganizationId, notificationId);

      expect(result.isRead).toBe(true);
      expect(result.readAt).toBeDefined();
      expect(db.notification.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: expect.any(Date),
        },
      });
    });

    it('should throw NotFoundException if notification not found', async () => {
      jest.spyOn(db.notification, 'findUnique').mockResolvedValue(null);

      await expect(
        service.markAsRead(mockOrganizationId, 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if notification belongs to different org', async () => {
      const mockNotification = {
        id: 'notif-1',
        organizationId: 'different-org',
      };

      jest.spyOn(db.notification, 'findUnique').mockResolvedValue(mockNotification as any);

      await expect(
        service.markAsRead(mockOrganizationId, 'notif-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllAsRead', () => {
    it('should batch update all unread notifications', async () => {
      jest.spyOn(db.notification, 'updateMany').mockResolvedValue({ count: 3 });

      await service.markAllAsRead(mockOrganizationId);

      expect(db.notification.updateMany).toHaveBeenCalledWith({
        where: { organizationId: mockOrganizationId, isRead: false },
        data: {
          isRead: true,
          readAt: expect.any(Date),
        },
      });
    });
  });

  describe('getOrganizationNotifications', () => {
    it('should return paginated notifications with unread count', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          organizationId: mockOrganizationId,
          title: 'Test 1',
          isRead: false,
        },
      ];

      jest.spyOn(db.notification, 'findMany').mockResolvedValue(mockNotifications as any);
      jest.spyOn(db.notification, 'count')
        .mockResolvedValueOnce(1) // total
        .mockResolvedValueOnce(1); // unread

      const result = await service.getOrganizationNotifications(
        mockOrganizationId,
        20,
        0,
      );

      expect(result.data).toEqual(mockNotifications);
      expect(result.total).toBe(1);
      expect(result.unreadCount).toBe(1);
    });
  });

  describe('trigger methods', () => {
    it('should trigger onWasteRecordCreated notification', async () => {
      const mockOrg = {
        id: mockOrganizationId,
        settings: mockOrganizationSettings,
      };

      const mockWasteRecord = {
        id: 'waste-1',
        category: 'Produce',
        quantityKg: 10,
        costUsd: 25.5,
      };

      jest.spyOn(db.organization, 'findUnique').mockResolvedValue(mockOrg as any);
      jest.spyOn(db.notification, 'create').mockResolvedValue({} as any);

      await service.onWasteRecordCreated(mockOrganizationId, mockWasteRecord);

      expect(db.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: NotificationType.WASTE_CREATED,
          severity: NotificationSeverity.INFO,
        }),
      });
    });

    it('should trigger onInventoryLow notification', async () => {
      const mockOrg = {
        id: mockOrganizationId,
        settings: mockOrganizationSettings,
      };

      const mockInventoryItem = {
        id: 'inv-1',
        ingredient: { name: 'Tomato' },
        quantityKg: 5,
      };

      jest.spyOn(db.organization, 'findUnique').mockResolvedValue(mockOrg as any);
      jest.spyOn(db.notification, 'create').mockResolvedValue({} as any);

      await service.onInventoryLow(mockOrganizationId, mockInventoryItem);

      expect(db.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: NotificationType.INVENTORY_LOW,
          severity: NotificationSeverity.WARNING,
        }),
      });
    });
  });
});
