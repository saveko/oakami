import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  NotFoundException,
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
    @Request() req: any,
    @Query('days') days?: number,
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

  @Get('filter/search')
  async filterRecords(
    @Query() filters: any,
    @Request() req: any,
  ) {
    const organizationId = req.user.organizationId;
    return this.wasteService.filterRecords(organizationId, filters);
  }

  @Get('filter/presets')
  async getFilterPresets(@Request() req: any) {
    const organizationId = req.user.organizationId;
    return this.wasteService.getFilterPresets(organizationId);
  }

  @Post('filter/presets')
  async saveFilterPreset(
    @Body() data: any,
    @Request() req: any,
  ) {
    const organizationId = req.user.organizationId;
    return this.wasteService.saveFilterPreset(organizationId, req.user.id, data);
  }

  @Get('filter/presets/:presetId')
  async applyFilterPreset(
    @Param('presetId') presetId: string,
    @Request() req: any,
  ) {
    const organizationId = req.user.organizationId;
    const preset = await this.wasteService.getFilterPresets(organizationId);
    const selectedPreset = preset.find((p: any) => p.id === presetId);
    if (!selectedPreset) {
      throw new NotFoundException('Filter preset not found');
    }
    return this.wasteService.filterRecords(organizationId, selectedPreset.filterCriteria);
  }

  @Delete('filter/presets/:presetId')
  async deleteFilterPreset(
    @Param('presetId') presetId: string,
    @Request() req: any,
  ) {
    const organizationId = req.user.organizationId;
    return this.wasteService.deleteFilterPreset(organizationId, presetId);
  }

  @Get('filter/export')
  async exportFilteredRecords(
    @Query() filters: any,
    @Request() req: any,
  ) {
    const organizationId = req.user.organizationId;
    return this.wasteService.exportFilteredRecords(organizationId, filters);
  }
}
