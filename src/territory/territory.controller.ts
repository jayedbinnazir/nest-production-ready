import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TerritoryService } from './territory.service';
import type { CreateTerritoryDto } from './dto/create-territory.dto';
import type { UpdateTerritoryDto } from './dto/update-territory.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiBearerAuth('jwt-auth')
@ApiTags('Territories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller({
  path: 'v1/admin/territories',
  version: '1',
})
export class TerritoryController {
  constructor(private readonly territoryService: TerritoryService) {}

  @Post()
  create(@Body() dto: CreateTerritoryDto) {
    return this.territoryService.create(dto);
  }

  @Get()
  @ApiQuery({
    name: 'areaId',
    required: false,
    description: 'Filter territories by area',
  })
  findAll(@Query('areaId') areaId?: string) {
    return this.territoryService.findAll(areaId);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.territoryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTerritoryDto,
  ) {
    return this.territoryService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.territoryService.remove(id);
  }
}

