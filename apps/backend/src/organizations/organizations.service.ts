import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationSettingsDto } from './dto/update-organization-settings.dto';

@Injectable()
export class OrganizationsService {
  constructor(private db: DatabaseService) {}

  async create(userId: string, createOrganizationDto: CreateOrganizationDto) {
    const organization = await this.db.organization.create({
      data: {
        name: createOrganizationDto.name,
        description: createOrganizationDto.description,
        website: createOrganizationDto.website,
        phone: createOrganizationDto.phone,
        address: createOrganizationDto.address,
        city: createOrganizationDto.city,
        state: createOrganizationDto.state,
        zipCode: createOrganizationDto.zipCode,
        country: createOrganizationDto.country,
        settings: {
          create: {},
        },
      },
      include: {
        settings: true,
      },
    });

    // Update user with organization
    await this.db.user.update({
      where: { id: userId },
      data: { organizationId: organization.id },
    });

    return organization;
  }

  async findById(id: string) {
    const organization = await this.db.organization.findUnique({
      where: { id },
      include: {
        settings: true,
        _count: {
          select: {
            members: true,
            ingredients: true,
            wasteRecords: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async getSettings(organizationId: string) {
    const settings = await this.db.organizationSettings.findUnique({
      where: { organizationId },
    });

    if (!settings) {
      throw new NotFoundException('Organization settings not found');
    }

    return settings;
  }

  async updateSettings(
    organizationId: string,
    updateSettingsDto: UpdateOrganizationSettingsDto,
  ) {
    return this.db.organizationSettings.update({
      where: { organizationId },
      data: updateSettingsDto,
    });
  }

  async getMembers(organizationId: string) {
    return this.db.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async addMember(organizationId: string, email: string, role: string) {
    const user = await this.db.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.organizationId && user.organizationId !== organizationId) {
      throw new BadRequestException('User already belongs to another organization');
    }

    return this.db.user.update({
      where: { id: user.id },
      data: {
        organizationId,
        role,
      },
    });
  }

  async removeMember(organizationId: string, userId: string) {
    const user = await this.db.user.findUnique({ where: { id: userId } });

    if (!user || user.organizationId !== organizationId) {
      throw new NotFoundException('User not found in organization');
    }

    return this.db.user.update({
      where: { id: userId },
      data: { organizationId: null },
    });
  }

  async getStats(organizationId: string) {
    const organization = await this.findById(organizationId);

    const [wasteRecords, totalWasteCost, ingredients, suppliers] = await Promise.all([
      this.db.wasteRecord.count({
        where: {
          organizationId,
          status: 'APPROVED',
        },
      }),
      this.db.wasteRecord.aggregate({
        where: {
          organizationId,
          status: 'APPROVED',
        },
        _sum: {
          costImpact: true,
        },
      }),
      this.db.ingredient.count({ where: { organizationId } }),
      this.db.supplier.count({ where: { organizationId } }),
    ]);

    return {
      organization: {
        id: organization.id,
        name: organization.name,
      },
      stats: {
        members: organization._count.members,
        wasteRecords,
        totalWasteCost: totalWasteCost._sum.costImpact || 0,
        ingredients,
        suppliers,
      },
    };
  }
}
