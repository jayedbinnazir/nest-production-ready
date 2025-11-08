import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RetailerService } from './retailer.service';
import type { ListRetailerDto } from './dto/list-retailer.dto';
import type { UpdateRetailerDto } from './dto/update-retailer.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/types/auth-user.type';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth('jwt-auth')
@ApiTags('Retailers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('sales_rep')
@Controller({
  path: 'v1/retailers',
  version: '1',
})
export class RetailerController {
  constructor(private readonly retailerService: RetailerService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListRetailerDto,
  ) {
    return this.retailerService.listAssignedRetailers(user.id, query);
  }

  @Get(':uid')
  detail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('uid') uid: string,
  ) {
    return this.retailerService.getRetailerDetailForSalesRep(user.id, uid);
  }

  @Patch(':uid')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('uid') uid: string,
    @Body() dto: UpdateRetailerDto,
  ) {
    return this.retailerService.updateRetailerBySalesRep(user.id, uid, dto);
  }
}

