import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export enum NotificationType {
  WASTE_CREATED = 'WASTE_CREATED',
  WASTE_APPROVED = 'WASTE_APPROVED',
  INVENTORY_LOW = 'INVENTORY_LOW',
  INVENTORY_EXPIRING = 'INVENTORY_EXPIRING',
  PREDICTION_GENERATED = 'PREDICTION_GENERATED',
  REPORT_GENERATED = 'REPORT_GENERATED',
}

export enum NotificationSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

interface CreateNotificationParams {
  organizationId: string;
  type: NotificationType;
  title: string;
  message: string;
  severity?: NotificationSeverity;
  relatedId?: string;
  relatedType?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private db: DatabaseService) {}

  async createNotification({
    organizationId,
    type,
    title,
    message,
    severity = NotificationSeverity.INFO,
    relatedId,
    relatedType,
  }: CreateNotificationParams) {
    const organization = await this.db.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if notifications are enabled
    if (!organization.settings?.enableNotifications) {
      return null;
    }

    return this.db.notification.create({
      data: {
        organizationId,
        type,
        title,
        message,
        severity,
        relatedId,
        relatedType,
        isRead: false,
      },
    });
  }

  async getOrganizationNotifications(
    organizationId: string,
    limit: number = 20,
    skip: number = 0,
    unreadOnly: boolean = false,
  ) {
    const where = unreadOnly
      ? { organizationId, isRead: false }
      : { organizationId };

    const [notifications, total] = await Promise.all([
      this.db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      this.db.notification.count({ where }),
    ]);

    const unreadCount = await this.db.notification.count({
      where: { organizationId, isRead: false },
    });

    return {
      data: notifications,
      total,
      unreadCount,
      limit,
      skip,
    };
  }

  async getUnreadCount(organizationId: string): Promise<number> {
    return this.db.notification.count({
      where: { organizationId, isRead: false },
    });
  }

  async markAsRead(organizationId: string, notificationId: string) {
    const notification = await this.db.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.organizationId !== organizationId) {
      throw new NotFoundException('Notification not found');
    }

    return this.db.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(organizationId: string) {
    await this.db.notification.updateMany({
      where: { organizationId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return this.getUnreadCount(organizationId);
  }

  // Trigger methods called from other services
  async onWasteRecordCreated(organizationId: string, wasteRecord: any) {
    const organization = await this.db.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true },
    });

    if (!organization?.settings?.enableNotifications) {
      return;
    }

    return this.createNotification({
      organizationId,
      type: NotificationType.WASTE_CREATED,
      title: 'New Waste Record',
      message: `${wasteRecord.category || 'Waste'} recorded: ${wasteRecord.quantityKg} kg, $${wasteRecord.costUsd.toFixed(2)}`,
      severity: NotificationSeverity.INFO,
      relatedId: wasteRecord.id,
      relatedType: 'WASTE_RECORD',
    });
  }

  async onWasteRecordApproved(organizationId: string, wasteRecord: any) {
    const organization = await this.db.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true },
    });

    if (!organization?.settings?.enableNotifications) {
      return;
    }

    return this.createNotification({
      organizationId,
      type: NotificationType.WASTE_APPROVED,
      title: 'Waste Record Approved',
      message: `${wasteRecord.category || 'Waste'} record approved: ${wasteRecord.quantityKg} kg`,
      severity: NotificationSeverity.INFO,
      relatedId: wasteRecord.id,
      relatedType: 'WASTE_RECORD',
    });
  }

  async onInventoryLow(organizationId: string, inventoryItem: any) {
    const organization = await this.db.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true },
    });

    if (!organization?.settings?.enableNotifications) {
      return;
    }

    return this.createNotification({
      organizationId,
      type: NotificationType.INVENTORY_LOW,
      title: 'Low Stock Alert',
      message: `${inventoryItem.ingredient?.name || 'Item'} is running low: ${inventoryItem.quantityKg} kg remaining`,
      severity: NotificationSeverity.WARNING,
      relatedId: inventoryItem.id,
      relatedType: 'INVENTORY_ITEM',
    });
  }

  async onInventoryExpiring(organizationId: string, inventoryItems: any[]) {
    const organization = await this.db.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true },
    });

    if (!organization?.settings?.enableNotifications) {
      return;
    }

    for (const item of inventoryItems) {
      const daysUntilExpiry = Math.ceil(
        (item.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
      );

      await this.createNotification({
        organizationId,
        type: NotificationType.INVENTORY_EXPIRING,
        title: 'Item Expiring Soon',
        message: `${item.ingredient?.name || 'Item'} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`,
        severity: daysUntilExpiry <= 1 ? NotificationSeverity.CRITICAL : NotificationSeverity.WARNING,
        relatedId: item.id,
        relatedType: 'INVENTORY_ITEM',
      });
    }
  }

  async onPredictionGenerated(organizationId: string, prediction: any) {
    const organization = await this.db.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true },
    });

    if (!organization?.settings?.enableNotifications) {
      return;
    }

    // Only notify for high confidence or critical predictions
    if (prediction.confidence < 0.7) {
      return;
    }

    const isCritical =
      prediction.predictionType === 'WASTE' && prediction.value > 50;

    return this.createNotification({
      organizationId,
      type: NotificationType.PREDICTION_GENERATED,
      title: `AI Prediction: ${prediction.predictionType}`,
      message: prediction.recommendation || `${prediction.predictionType} prediction: ${prediction.value.toFixed(2)} ${prediction.unit}`,
      severity: isCritical ? NotificationSeverity.CRITICAL : NotificationSeverity.INFO,
      relatedId: prediction.id,
      relatedType: 'PREDICTION',
    });
  }

  async onReportGenerated(organizationId: string, report: any) {
    const organization = await this.db.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true },
    });

    if (!organization?.settings?.enableNotifications) {
      return;
    }

    return this.createNotification({
      organizationId,
      type: NotificationType.REPORT_GENERATED,
      title: `${report.reportType || 'Report'} Generated`,
      message: `Your ${report.reportType || 'report'} for ${report.period || 'the period'} is ready`,
      severity: NotificationSeverity.INFO,
      relatedId: report.id,
      relatedType: 'REPORT',
    });
  }
}
