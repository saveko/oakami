import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';
import { WasteService } from './waste.service';
import { WasteController } from './waste.controller';

@Module({
  imports: [DatabaseModule],
  providers: [WasteService],
  controllers: [WasteController],
})
export class WasteModule {}
