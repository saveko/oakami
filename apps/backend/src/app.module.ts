import { Module } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { WasteModule } from './waste/waste.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    WasteModule,
    InventoryModule,
    OrganizationsModule,
    IngredientsModule,
  ],
  controllers: [HealthController],
  providers: [ConfigService],
})
export class AppModule {}
