import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';
import { IngredientsService } from './ingredients.service';
import { IngredientsController } from './ingredients.controller';

@Module({
  imports: [DatabaseModule],
  providers: [IngredientsService],
  controllers: [IngredientsController],
})
export class IngredientsModule {}
