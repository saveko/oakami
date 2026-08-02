import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';

@Controller('health')
export class HealthController {
  constructor(private db: DatabaseService) {}

  @Get()
  async health() {
    const dbHealth = await this.db.healthCheck();
    return {
      status: dbHealth ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: dbHealth ? 'connected' : 'disconnected',
    };
  }
}
