import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Get('my-organizations')
  async getMyOrganizations(@Request() req) {
    return this.organizationsService.getUserOrganizations(req.user.id);
  }

  @Get(':organizationId')
  async getOrganization(@Param('organizationId') organizationId: string, @Request() req) {
    return this.organizationsService.getOrganization(organizationId, req.user.id);
  }

  @Get(':organizationId/users')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getOrganizationUsers(
    @Param('organizationId') organizationId: string,
    @Request() req
  ) {
    return this.organizationsService.getOrganizationUsers(organizationId, req.user.id);
  }

  @Post(':organizationId/users')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async addUserToOrganization(
    @Param('organizationId') organizationId: string,
    @Body('userId') targetUserId: string,
    @Body('role') role: UserRole,
    @Request() req
  ) {
    return this.organizationsService.addUserToOrganization(
      organizationId,
      targetUserId,
      role,
      req.user.id
    );
  }

  @Patch(':organizationId/users/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateUserRole(
    @Param('organizationId') organizationId: string,
    @Param('userId') targetUserId: string,
    @Body('role') newRole: UserRole,
    @Request() req
  ) {
    return this.organizationsService.updateUserRole(
      organizationId,
      targetUserId,
      newRole,
      req.user.id
    );
  }

  @Delete(':organizationId/users/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async removeUserFromOrganization(
    @Param('organizationId') organizationId: string,
    @Param('userId') targetUserId: string,
    @Request() req
  ) {
    return this.organizationsService.removeUserFromOrganization(
      organizationId,
      targetUserId,
      req.user.id
    );
  }
}
