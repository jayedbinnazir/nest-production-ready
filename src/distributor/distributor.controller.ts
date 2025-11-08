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
import { DistributorService } from './distributor.service';
import type { CreateDistributorDto } from './dto/create-distributor.dto';
import type { UpdateDistributorDto } from './dto/update-distributor.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiBearerAuth('jwt-auth')
@ApiTags('Distributors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller({
  path: 'v1/admin/distributors',
  version: '1',
})
export class DistributorController {
  constructor(private readonly distributorService: DistributorService) {}

  @Post()
  create(@Body() dto: CreateDistributorDto) {
    return this.distributorService.create(dto);
  }

  @Get()
  findAll() {
    return this.distributorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.distributorService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateDistributorDto,
  ) {
    return this.distributorService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.distributorService.remove(id);
  }
}

