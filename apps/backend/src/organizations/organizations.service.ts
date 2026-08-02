import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private db: DatabaseService) {}

  async getUserOrganizations(userId: string) {
    return this.db.userOrganization.findMany({
      where: { userId },
      include: {
        organization: true,
      },
    });
  }

  async getOrganizationUsers(organizationId: string, userId: string) {
    // Verify user is admin in this organization
    const userOrg = await this.db.userOrganization.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
    });

    if (!userOrg || userOrg.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can view organization users');
    }

    return this.db.userOrganization.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
          },
        },
      },
    });
  }

  async addUserToOrganization(
    organizationId: string,
    targetUserId: string,
    role: UserRole,
    requestingUserId: string
  ) {
    // Verify requesting user is admin
    const requestingUserOrg = await this.db.userOrganization.findUnique({
      where: {
        userId_organizationId: { userId: requestingUserId, organizationId },
      },
    });

    if (!requestingUserOrg || requestingUserOrg.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can add users to organization');
    }

    // Check if user already in organization
    const existing = await this.db.userOrganization.findUnique({
      where: {
        userId_organizationId: { userId: targetUserId, organizationId },
      },
    });

    if (existing) {
      throw new BadRequestException('User already in organization');
    }

    return this.db.userOrganization.create({
      data: {
        userId: targetUserId,
        organizationId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async updateUserRole(
    organizationId: string,
    targetUserId: string,
    newRole: UserRole,
    requestingUserId: string
  ) {
    // Verify requesting user is admin
    const requestingUserOrg = await this.db.userOrganization.findUnique({
      where: {
        userId_organizationId: { userId: requestingUserId, organizationId },
      },
    });

    if (!requestingUserOrg || requestingUserOrg.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can update user roles');
    }

    // Prevent users from removing their own admin role
    if (requestingUserId === targetUserId && newRole !== UserRole.ADMIN) {
      throw new BadRequestException('Cannot remove your own admin role');
    }

    const userOrg = await this.db.userOrganization.findUnique({
      where: {
        userId_organizationId: { userId: targetUserId, organizationId },
      },
    });

    if (!userOrg) {
      throw new NotFoundException('User not found in organization');
    }

    return this.db.userOrganization.update({
      where: {
        userId_organizationId: { userId: targetUserId, organizationId },
      },
      data: { role: newRole },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async removeUserFromOrganization(
    organizationId: string,
    targetUserId: string,
    requestingUserId: string
  ) {
    // Verify requesting user is admin
    const requestingUserOrg = await this.db.userOrganization.findUnique({
      where: {
        userId_organizationId: { userId: requestingUserId, organizationId },
      },
    });

    if (!requestingUserOrg || requestingUserOrg.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can remove users');
    }

    // Prevent users from removing themselves
    if (requestingUserId === targetUserId) {
      throw new BadRequestException('Cannot remove yourself from organization');
    }

    const userOrg = await this.db.userOrganization.findUnique({
      where: {
        userId_organizationId: { userId: targetUserId, organizationId },
      },
    });

    if (!userOrg) {
      throw new NotFoundException('User not found in organization');
    }

    return this.db.userOrganization.delete({
      where: {
        userId_organizationId: { userId: targetUserId, organizationId },
      },
    });
  }

  async getOrganization(organizationId: string, userId: string) {
    // Verify user is member of organization
    const userOrg = await this.db.userOrganization.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });

    if (!userOrg) {
      throw new ForbiddenException('User not member of this organization');
    }

    return this.db.organization.findUnique({
      where: { id: organizationId },
      include: {
        settings: true,
        userOrganizations: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }
}
