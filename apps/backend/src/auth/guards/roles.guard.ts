import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const organizationId = request.params.organizationId || request.body?.organizationId;

    if (!user || !organizationId) {
      throw new ForbiddenException('User or organization context not found');
    }

    // Check if user has required role in this organization
    const userOrg = user.organizations?.find(
      (org: any) => org.organizationId === organizationId
    );

    if (!userOrg || !requiredRoles.includes(userOrg.role)) {
      throw new ForbiddenException(
        `User does not have required role(s): ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}
