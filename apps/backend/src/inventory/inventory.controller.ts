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
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { ListInventoryDto } from './dto/list-inventory.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Post()
  async create(
    @Body() createInventoryItemDto: CreateInventoryItemDto,
    @Request() req: any,
  ) {
    return this.inventoryService.create(req.user.organizationId, createInventoryItemDto);
  }

  @Get()
  async list(@Query() listInventoryDto: ListInventoryDto, @Request() req: any) {
    return this.inventoryService.list(req.user.organizationId, listInventoryDto);
  }

  @Get('summary')
  async getSummary(@Request() req: any) {
    return this.inventoryService.getInventorySummary(req.user.organizationId);
  }

  @Get('expiring')
  async getExpiringItems(
    @Query('days') days?: number,
    @Request() req: any,
  ) {
    return this.inventoryService.getExpiringItems(req.user.organizationId, days);
  }

  @Get('low-stock')
  async getLowStockItems(@Request() req: any) {
    return this.inventoryService.getLowStockItems(req.user.organizationId);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Request() req: any) {
    return this.inventoryService.findById(req.user.organizationId, id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateInventoryItemDto: UpdateInventoryItemDto,
    @Request() req: any,
  ) {
    return this.inventoryService.update(
      req.user.organizationId,
      id,
      updateInventoryItemDto,
    );
  }

  @Patch(':id/adjust')
  async adjustQuantity(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
    @Body('notes') notes?: string,
    @Request() req: any,
  ) {
    return this.inventoryService.adjustQuantity(
      req.user.organizationId,
      id,
      quantity,
      notes,
    );
  }
}
