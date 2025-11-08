import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RetailerService } from './retailer.service';
import type { BulkAssignDto } from './dto/bulk-assign.dto';
import type { BulkUnassignDto } from './dto/bulk-unassign.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/types/auth-user.type';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth('jwt-auth')
@ApiTags('Admin Assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller({
  path: 'v1/admin/assignments',
  version: '1',
})
export class RetailerAssignmentController {
  constructor(private readonly retailerService: RetailerService) {}

  @Post('bulk')
  async assign(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: BulkAssignDto,
  ) {
    await this.retailerService.bulkAssign(dto, user.id);
    return { status: 'ok' };
  }

  @Post('bulk-unassign')
  async unassign(@Body() dto: BulkUnassignDto) {
    await this.retailerService.bulkUnassign(dto);
    return { status: 'ok' };
  }
}

