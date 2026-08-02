import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationSettingsDto } from './dto/update-organization-settings.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Post()
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @Request() req: any,
  ) {
    return this.organizationsService.create(req.user.id, createOrganizationDto);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.organizationsService.findById(id);
  }

  @Get(':id/settings')
  async getSettings(@Param('id') id: string) {
    return this.organizationsService.getSettings(id);
  }

  @Patch(':id/settings')
  async updateSettings(
    @Param('id') id: string,
    @Body() updateSettingsDto: UpdateOrganizationSettingsDto,
  ) {
    return this.organizationsService.updateSettings(id, updateSettingsDto);
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string) {
    return this.organizationsService.getMembers(id);
  }

  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @Body('email') email: string,
    @Body('role') role: string,
  ) {
    return this.organizationsService.addMember(id, email, role);
  }

  @Delete(':id/members/:userId')
  async removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.organizationsService.removeMember(id, userId);
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string) {
    return this.organizationsService.getStats(id);
  }
}
