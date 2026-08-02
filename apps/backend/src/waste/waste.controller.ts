import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WasteService } from './waste.service';
import { CreateWasteRecordDto } from './dto/create-waste-record.dto';
import { ListWasteRecordsDto } from './dto/list-waste-records.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('waste')
@UseGuards(JwtAuthGuard)
export class WasteController {
  constructor(private wasteService: WasteService) {}

  @Post()
  async create(
    @Body() createWasteRecordDto: CreateWasteRecordDto,
    @Request() req: any,
  ) {
    const organizationId = req.user.organizationId;
    return this.wasteService.create(
      organizationId,
      req.user.id,
      createWasteRecordDto,
    );
  }

  @Get()
  async list(
    @Query() listWasteRecordsDto: ListWasteRecordsDto,
    @Request() req: any,
  ) {
    const organizationId = req.user.organizationId;
    return this.wasteService.list(organizationId, listWasteRecordsDto);
  }

  @Get('dashboard/stats')
  async getDashboardStats(
    @Query('days') days?: number,
    @Request() req: any,
  ) {
    const organizationId = req.user.organizationId;
    return this.wasteService.getDashboardStats(organizationId, days);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Request() req: any) {
    const organizationId = req.user.organizationId;
    return this.wasteService.findById(organizationId, id);
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: string, @Request() req: any) {
    const organizationId = req.user.organizationId;
    return this.wasteService.approve(organizationId, id, req.user.id);
  }

  @Patch(':id/reject')
  async reject(@Param('id') id: string, @Request() req: any) {
    const organizationId = req.user.organizationId;
    return this.wasteService.reject(organizationId, id);
  }
}
