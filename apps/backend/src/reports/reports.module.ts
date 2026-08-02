import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [DatabaseModule],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
