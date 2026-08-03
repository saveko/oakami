import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigService } from './config/config.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { WasteModule } from './waste/waste.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { ReportsModule } from './reports/reports.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { AiModule } from './ai/ai.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,  // 1 second
        limit: 10,  // 10 requests per second
      },
      {
        name: 'long',
        ttl: 60000,  // 1 minute
        limit: 100,  // 100 requests per minute
      },
    ]),
    DatabaseModule,
    AuthModule,
    NotificationsModule,
    WasteModule,
    InventoryModule,
    OrganizationsModule,
    IngredientsModule,
    ReportsModule,
    AnalyticsModule,
    SuppliersModule,
    AiModule,
  ],
  controllers: [HealthController],
  providers: [ConfigService],
})
export class AppModule {}
