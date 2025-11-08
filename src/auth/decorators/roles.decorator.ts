import { SetMetadata } from '@nestjs/common';
import { AuthRole } from '../types/auth-user.type';
import { ROLES_KEY } from '../guards/roles.guard';

export const Roles = (...roles: AuthRole[]) => SetMetadata(ROLES_KEY, roles);

