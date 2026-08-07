import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';

@Module({
  imports: [DatabaseModule, NotificationsModule],
  providers: [InventoryService],
  controllers: [InventoryController],
})
export class InventoryModule {}
