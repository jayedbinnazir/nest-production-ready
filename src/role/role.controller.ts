import { Body, Controller, Get, Post } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('/create')
  async createRole(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.roleService.createRole(createRoleDto);
  }

  @Get('/all')
  async getAllRoles(): Promise<Role[]> {
    return this.roleService.findAllRoles();
  }
}
