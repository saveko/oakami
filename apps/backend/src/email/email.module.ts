import { Module } from '@nestjs/common';
import { ConfigService } from '@/config/config.service';
import { EmailService } from './email.service';

@Module({
  providers: [EmailService, ConfigService],
  exports: [EmailService],
})
export class EmailModule {}
