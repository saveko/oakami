import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { GetNotificationsDto } from './dto/get-notifications.dto';

@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @Query() dto: GetNotificationsDto,
    @Request() req: any,
  ) {
    const organizationId = req.user.organizationId;
    return this.notificationsService.getOrganizationNotifications(
      organizationId,
      dto.limit || 20,
      dto.skip || 0,
      dto.unreadOnly || false,
    );
  }

  @Get('unread/count')
  async getUnreadCount(@Request() req: any) {
    const organizationId = req.user.organizationId;
    const unreadCount = await this.notificationsService.getUnreadCount(organizationId);
    return { unreadCount };
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') notificationId: string,
    @Request() req: any,
  ) {
    const organizationId = req.user.organizationId;
    return this.notificationsService.markAsRead(organizationId, notificationId);
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req: any) {
    const organizationId = req.user.organizationId;
    await this.notificationsService.markAllAsRead(organizationId);
    return { success: true };
  }
}
