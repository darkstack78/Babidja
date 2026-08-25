import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

/**
 * Protection la plus critique du projet contre les fuites de données entre
 * établissements (section 4.4 du document technique backend). Doit être
 * appliqué sur TOUTES les routes du module tenant/*, sans exception.
 */
@Injectable()
export class TenantScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user; // injecté par JwtAuthGuard en amont
    const requestedTenantId = req.params.tenantId || req.body.tenantId;
    if (user.role === UserRole.SUPER_ADMIN) return true;
    return user.tenantId === requestedTenantId;
  }
}
