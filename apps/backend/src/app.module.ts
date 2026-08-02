import { Module } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { DatabaseService } from './database/database.service';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
  ],
  controllers: [HealthController],
  providers: [ConfigService],
})
export class AppModule {}
