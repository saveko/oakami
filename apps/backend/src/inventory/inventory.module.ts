import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';

@Module({
  imports: [DatabaseModule],
  providers: [InventoryService],
  controllers: [InventoryController],
})
export class InventoryModule {}
