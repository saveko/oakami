import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

@Module({
  imports: [DatabaseModule, NotificationsModule],
  providers: [AiService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
