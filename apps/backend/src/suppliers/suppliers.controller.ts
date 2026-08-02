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
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { ListSuppliersDto } from './dto/list-suppliers.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Post()
  async create(
    @Body() createSupplierDto: CreateSupplierDto,
    @Request() req: any,
  ) {
    return this.suppliersService.create(req.user.organizationId, createSupplierDto);
  }

  @Get()
  async list(@Query() listSuppliersDto: ListSuppliersDto, @Request() req: any) {
    return this.suppliersService.list(req.user.organizationId, listSuppliersDto);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Request() req: any) {
    return this.suppliersService.findById(req.user.organizationId, id);
  }

  @Get(':id/performance')
  async getSupplierPerformance(
    @Param('id') id: string,
    @Query('days') days?: number,
    @Request() req: any,
  ) {
    return this.suppliersService.getSupplierPerformance(
      req.user.organizationId,
      id,
      days || 30,
    );
  }

  @Get('comparison/all')
  async getSupplierComparison(
    @Query('days') days?: number,
    @Request() req: any,
  ) {
    return this.suppliersService.getSupplierComparison(
      req.user.organizationId,
      days || 30,
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
    @Request() req: any,
  ) {
    return this.suppliersService.update(req.user.organizationId, id, updateSupplierDto);
  }

  @Patch(':id/update-metrics')
  async updateMetrics(@Param('id') id: string, @Request() req: any) {
    return this.suppliersService.updateSupplierMetrics(req.user.organizationId, id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.suppliersService.delete(req.user.organizationId, id);
  }
}
