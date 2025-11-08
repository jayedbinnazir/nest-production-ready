import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SalesRepService } from './sales-rep.service';
import type { CreateSalesRepDto } from './dto/create-sales-rep.dto';
import type { UpdateSalesRepDto } from './dto/update-sales-rep.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth('jwt-auth')
@ApiTags('Admin Sales Reps')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller({
  path: 'v1/admin/sales-reps',
  version: '1',
})
export class SalesRepController {
  constructor(private readonly salesRepService: SalesRepService) {}

  @Post()
  create(@Body() dto: CreateSalesRepDto) {
    return this.salesRepService.create(dto);
  }

  @Get()
  findAll() {
    return this.salesRepService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.salesRepService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSalesRepDto,
  ) {
    return this.salesRepService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.salesRepService.remove(id);
  }
}

